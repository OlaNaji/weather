//-------------- Defining HTML elements -----------//
let city = document.querySelector('.location-name')
let locationInfo = document.querySelector('.location-info')

let temperature = document.querySelector('.temperature')
let condition = document.querySelector('.condition')
let feelsLike = document.querySelector('.temperature-details')
let dateInfo = document.querySelector('.dateInfo')
let timeInfo = document.querySelector('.timeInfo')

let uvIndex = document.querySelector('.uvIndex')
let wind = document.querySelector('.wind')
let humidity = document.querySelector('.humidity')

let sunrise = document.querySelector('.sunrise')
let sunset = document.querySelector('.sunset')

queryInput = document.getElementById('query')

// --------- API request ------------//
function takeQuery() {
    let query = queryInput.value
    takeLocation(query)
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    const lat = position.coords.latitude.toFixed(4);
    const long = position.coords.longitude.toFixed(4);
    const q = `${lat},${long}`;

    takeLocation(q);
}



function takeLocation(q) {
    const apiKey = '581cef54a30e46b99fa130058240101';
    const location = q;
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=6`;

    async function checkWeather() {
        const response = await fetch(apiUrl);
        const weatherData = await response.json();

        display(weatherData)
        localStorage.setItem('weatherData', JSON.stringify(weatherData));

    }

    checkWeather();
}

getLocation();


weatherData = JSON.parse(localStorage.getItem('weatherData'))
display(weatherData)
//---------------------------------------------------------//

function display(weatherData) {
    city.innerHTML = weatherData.location.name
    locationInfo.innerHTML = `${weatherData.location.region}, ${weatherData.location.country}`
    temperature.innerHTML = `${weatherData.current.temp_c}°c`
    condition.innerHTML = weatherData.current.condition.text
    feelsLike.innerHTML = `${weatherData.forecast.forecastday[0].day.mintemp_c} / ${weatherData.forecast.forecastday[0].day.maxtemp_c} feels like ${weatherData.current.feelslike_c}`
    dateInfo.innerHTML = weatherData.location.localtime.substring(0, 10);
    timeInfo.innerHTML = convertTime(weatherData.location.localtime.substring(11))

    uvIndex.innerHTML = weatherData.forecast.forecastday[0].day.uv
    wind.innerHTML = weatherData.forecast.forecastday[0].day.maxwind_kph + ' kph'
    humidity.innerHTML = weatherData.forecast.forecastday[0].day.avghumidity + '%'

    sunrise.innerHTML = weatherData.forecast.forecastday[0].astro.sunrise
    sunset.innerHTML = weatherData.forecast.forecastday[0].astro.sunset




    //display hourly report
    let hourArray = weatherData.forecast.forecastday[0].hour
    var dailyReportText = ``;
    for (let i = 0; i < hourArray.length; i++) {
        let time = convertTime(hourArray[i].time.substring(11));
        let temp = hourArray[i].temp_c
        let condition = hourArray[i].condition.text
        let icon = getCategoryPaths(condition, hourArray[i].time.substring(11, 13)).icon;


        dailyReportText += `
    <div class="swiper-slide">
        <h2>${time}</h2>
        <img src="${icon}" alt="">
        <p>${temp}°c</p>
    </div>
    `
    }
    dailyReport.innerHTML = dailyReportText



    //display the weekly report
    weekArray = weatherData.forecast.forecastday
    weeklyReportText = ``
    for (let i = 0; i < weekArray.length; i++) {
        let day = getDayName(weekArray[i].date);
        let temp = weekArray[i].day.avgtemp_c;
        let condition = weekArray[i].day.condition.text;
        let icon = getCategoryPaths(condition, NaN).icon;

        weeklyReportText += `
    <div class="swiper-slide w-100 h-auto my-2">
        <div class="forecast-card justify-content-between d-flex align-items-baseline">
            <p>${day}</p>
            <img src="${icon}" alt="">
            <p>${condition}</p>
            <p>${temp}°c</p>
        </div>
    </div>
    `
    }
    weeklyReport.innerHTML = weeklyReportText


    //change card background image
    let card = document.querySelector('.weather-card-inner')
    let bgURL = getCategoryPaths(weatherData.current.condition.text, weatherData.current.last_updated.substring(11, 13)).image
    card.style.background = `url('${bgURL}') center/cover rgba(78, 78, 78, 0.75)`;



    //change body background image
    document.body.style.background = `url(${bgURL}) center/cover rgba(78, 78, 78, 0.80)`; // Set the background image
    document.body.style.backdropFilter = 'blur(15px)';


    //change main card's icon
    let weatherIcon = document.querySelector('.weatherIcon')
    let iconURL = getCategoryPaths(weatherData.current.condition.text, weatherData.current.last_updated.substring(11, 13)).icon
    weatherIcon.src = iconURL

}


//--------------- mapping conditions -----------------//
function groupWeatherCondition(condition) {
    condition = condition.toLowerCase();

    const weatherMappings = [{
            conditions: ['clear'],
            category: 'clear'
        },
        {
            conditions: ['sunny'],
            category: 'sunny'
        },
        {
            conditions: ['partly cloudy', 'cloudy'],
            category: 'cloudy'
        },
        {
            conditions: ['overcast'],
            category: 'overcast'
        },
        {
            conditions: ['mist', 'fog', 'freezing fog'],
            category: 'foggy'
        },
        {
            conditions: [
                'patchy rain possible',
                'patchy light drizzle',
                'light drizzle',
                'patchy light rain',
                'light rain',
                'light rain shower',
                'patchy light rain with thunder',
            ],
            category: 'lightRain',
        },
        {
            conditions: [
                'moderate rain at times',
                'moderate rain',
                'heavy rain at times',
                'heavy rain',
                'moderate or heavy rain shower',
                'torrential rain shower',
                'moderate or heavy rain with thunder',
            ],
            category: 'heavyRain',
        },
        {
            conditions: [
                'patchy snow possible',
                'blowing snow',
                'blizzard',
                'light snow',
                'light sleet',
                'light snow showers',
                'patchy light snow with thunder',
            ],
            category: 'lightSnow',
        },
        {
            conditions: [
                'moderate snow',
                'heavy snow',
                'moderate or heavy sleet',
                'moderate or heavy snow showers',
                'light showers of ice pellets',
                'moderate or heavy showers of ice pellets',
                'moderate or heavy snow with thunder',
            ],
            category: 'heavySnow',
        },
        {
            conditions: [
                'freezing drizzle',
                'heavy freezing drizzle',
                'light freezing rain',
                'moderate or heavy freezing rain',
                'light sleet showers',
                'moderate or heavy sleet showers',
                'light showers of ice pellets',
                'moderate or heavy showers of ice pellets',
            ],
            category: 'freezing',
        },
        {
            conditions: ['thundery outbreaks possible'],
            category: 'thunderstorm'
        },
    ];

    for (const mapping of weatherMappings) {
        if (mapping.conditions.some(cond => condition.includes(cond))) {
            return mapping.category;
        }
    }

    return 'Unknown Condition';
}

function getCategoryPaths(weatherCondition, time) {
    const categoryMappings = {
        'clear': {
            icon: isDayTime(time) ? './icons/clear.svg' : './icons/clearNight.svg',
            image: isDayTime(time) ? './images/morningClear.jpg' : './images/nightClear.jpg',
        },
        'sunny': {
            icon: './icons/sunny.svg',
            image: './images/sunny.jpg',
        },
        'cloudy': {
            icon: isDayTime(time) ? './icons/cloudyDay.svg' : './icons/cloudyNight.svg',
            image: isDayTime(time) ? './images/cloudyDay.jpg' : './images/cloudyNight.jpg',
        },
        'overcast': {
            icon: isDayTime(time) ? './icons/overcastDay.svg' : './icons/overcastNight.svg',
            image: './images/overcast.jpg',
        },
        'foggy': {
            icon: './icons/foggy.svg',
            image: './images/foggy.jpg',
        },
        'lightRain': {
            icon: './icons/light-rain.svg',
            image: './images/light-rain.jpg',
        },
        'heavyRain': {
            icon: './icons/heavy-rain.svg',
            image: './images/heavy-rain.jpg',
        },
        'lightSnow': {
            icon: './icons/light-snow.svg',
            image: './images/light-snow.jpg',
        },
        'heavySnow': {
            icon: './icons/heavy-snow.svg',
            image: './images/heavy-snow.jpg',
        },
        'freezing': {
            icon: './icons/freezing.svg',
            image: './images/freezing.jpg',
        },
        'thunderstorm': {
            icon: './icons/thunderstorm.svg',
            image: './images/thunderstorm.jpg',
        },
    };

    const category = groupWeatherCondition(weatherCondition);
    const currentCategory = categoryMappings[category];

    return currentCategory || {
        category: 'Unknown',
        icon: '',
        image: '',
    };
}


function isDayTime(time) {
    return time >= 6 && time < 18;
}



function getDayName(dateString) {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const date = new Date(dateString);

    // Get the day of the week as an index (0-6)
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
}


function convertTime(time24) {
    const [hours, minutes] = time24.split(':').map(Number);

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    const time12 = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });

    return `${time12}`;
}


//-------------Carousel initialisation ----------------//
document.addEventListener('DOMContentLoaded', function () {
    // Initialize Swiper for vertical-forecast-container
    // var verticalForecastSwiper = new Swiper('.vertical-forecast-container', {
    //     direction: 'vertical',
    //     slidesPerView: 'auto',
    //     spaceBetween: 10,
    //     pagination: {
    //         el: '.swiper-pagination',
    //         clickable: true,
    //     },
    // });

    // Initialize Swiper for swiper-container (assuming this is a different container)
    var dailySwiper = new Swiper('.day-swiper', {
        slidesPerView: 'auto',
        spaceBetween: 10,
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
    });

    // Initialize Swiper for weather-info
    // var weatherInfoSwiper = new Swiper('.weather-info', {
    //     direction: 'vertical',
    //     slidesPerView: 3,
    //     freeMode: true,

    // });
});
