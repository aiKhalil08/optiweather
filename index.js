const BGCHANGEINTERVAL = 8000;
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednessday', 'Thursday', 'Friday', 'Saturday'];
function format12Hour(dateStr) {
    const date = new Date(dateStr);
    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}${ampm}`;
}

const forecastSection = document.querySelector('#forecastSection');
const searchSection = document.querySelector('#searchSection');
const locationSection = document.querySelector('#locationSection');
const currentConditionSection = document.querySelector('#currentSection');
const inputField = document.querySelector('#searchField');

function replaceContent(parent, newChild) {
    parent.innerHTML = null;
    if (newChild) parent.appendChild(newChild);
}

// visuals
const startBgAnimation = () => {
    const bgImages = ['rainy_2', 'snow', 'thunderstorm', 'hot', 'sunny_2', 'cloudy', 'rainy', 'snow_2', 'sunny'];
    let nextBg = 0;

    const changeBg = () => {
        const hiddenBg = document.querySelector('.bgHidden');
        const visibleBg = document.querySelector('.bgVisible');
        
        visibleBg.classList.remove('bgVisible');
        visibleBg.classList.add('bgHidden');

        hiddenBg.classList.remove('bgHidden');
        hiddenBg.classList.add('bgVisible');
        hiddenBg.style.backgroundImage = `url('./assets/images/${[bgImages[nextBg]]}.jpg')`;
    }

    setInterval(() => {
        changeBg();
        nextBg = (nextBg + 1) % (bgImages.length);
        console.log(nextBg)
    }, BGCHANGEINTERVAL);
    // alert(presentCondition)
}

const showSpinner = () => {
    const spinner = document.createElement('div');
    spinner.id = 'spinner';

    replaceContent(forecastSection, spinner);
}

function setCurrentCondition(current) {
    const iconElement = document.createElement('img');
    const descriptionElement = document.createElement('p');
    const degreeElement = document.createElement('p');
    descriptionElement.id = 'currentDescription';
    degreeElement.id = 'currentDegree';

    iconElement.src = current.condition.icon;
    descriptionElement.textContent = current.condition.text;
    degreeElement.textContent = current.temp_c+ '°C';

    replaceContent(currentConditionSection, null);
    currentConditionSection.appendChild(iconElement);
    currentConditionSection.appendChild(descriptionElement);
    currentConditionSection.appendChild(degreeElement);
}

function setLocation(location) {
    const iconElement = document.createElement('img');
    const locationElement = document.createElement('p');

    iconElement.src = 'assets/svgs/location-icon.svg';
    locationElement.textContent = location.name + ', ' + location.country;

    replaceContent(locationSection, null);
    locationSection.appendChild(iconElement);
    locationSection.appendChild(locationElement);
}

function setForecast(forecast) {
    // console.log(forecast)
    const forecastContainer = document.createElement('div');
    const dailyForecastContainer = document.createElement('div');
    const hourlyForecastContainer = document.createElement('div');
    forecastContainer.id = 'forecast';
    dailyForecastContainer.id = 'dailyForecastContainer';
    hourlyForecastContainer.id = 'hourlyForecastContainer';

    forecastContainer.appendChild(dailyForecastContainer);
    forecastContainer.appendChild(hourlyForecastContainer);

    // set daily forecast
    const dialyForecastTitle = document.createElement('h3');
    const dailyForecastList = document.createElement('ul');
    dialyForecastTitle.textContent = 'Daily Forecast';
    dailyForecastContainer.appendChild(dialyForecastTitle);
    dailyForecastContainer.appendChild(dailyForecastList);
    forecast.forecastday.forEach((dailyForecast, index) => {
        const foreCastItem = document.createElement('li');
        const icon = document.createElement('img');
        const day = document.createElement('p');
        const dayTemp = document.createElement('p');

        foreCastItem.classList.add('dailyForecastCard');
        day.classList.add('day');
        dayTemp.classList.add('dayTemp');

        icon.src = dailyForecast.day.condition.icon;
        day.textContent = index === 0 ?
        'Today' :
        (
            index === 1 ?
            'Tomorrow' :
            DAYS[new Date(dailyForecast.date).getDay()]
        );
        dayTemp.textContent = dailyForecast.day.mintemp_c+'°C/'+dailyForecast.day.maxtemp_c+'°C';

        foreCastItem.appendChild(icon);
        foreCastItem.appendChild(day);
        foreCastItem.appendChild(dayTemp);

        dailyForecastList.appendChild(foreCastItem);
    });

    // set hourly forecast
    const currentDayForecast = forecast.forecastday[0];
    const hourlyParams = {
        'time': [DAYS[new Date(currentDayForecast.date).getDay()]],
        'icon': true,
        'temp_c': ['Temp', '°C'],
        'wind_kph': ['Wind', 'kph'],
        'precip_mm': ['Precip', 'mm'],
        'humidity': ['Humidity', '%'],
        'gust_kph': ['Gust', 'kph'],
    };
    const hourlyForecastTitle = document.createElement('h3');
    const hourlyForecastList = document.createElement('ul');
    hourlyForecastTitle.textContent = 'Hourly Forecast';
    hourlyForecastContainer.appendChild(hourlyForecastTitle);
    hourlyForecastContainer.appendChild(hourlyForecastList);

    currentDayForecast.hour.forEach((hourlyForecast, index) => {
        const foreCastItem = document.createElement('li');
        foreCastItem.classList.add('hourlyForecastCard');

        Object.keys(hourlyParams).forEach(param => {

            if (param === 'icon') {
                const icon = document.createElement('img');
                icon.src = hourlyForecast.condition.icon;
                foreCastItem.appendChild(icon);
            } else {
                const container = document.createElement('div');
                const title = document.createElement('p');
                const value = document.createElement('p');

                title.textContent = hourlyParams[param][0];
                value.textContent = param === 'time' ? 
                format12Hour(hourlyForecast[param]) :
                hourlyForecast[param] + hourlyParams[param][1];

                container.appendChild(title);
                container.appendChild(value);
                foreCastItem.appendChild(container);
            }
        })
        hourlyForecastList.appendChild(foreCastItem);
    })

    // replace content
    replaceContent(forecastSection, forecastContainer)
}

const handleResponse = (data) => {
    // console.log(data);
    setCurrentCondition(data.current);
    setLocation(data.location);
    setForecast(data.forecast)
}

const handleError = (errorMessage) => {
    const errorContainer = document.createElement('p');
    errorContainer.id = 'error';
    errorContainer.textContent = errorMessage;
    replaceContent(forecastSection, errorContainer);
    replaceContent(locationSection, null);
    replaceContent(currentConditionSection, null);
}

async function handleFormSubmit(e) {
    e.preventDefault();
    if (inputField.value === '') return;
    showSpinner();

    const result = await fetchWeatherForecast();
    if (result.ok) {
        handleResponse(result.data);
    } else {
        handleError(result.errorMessage);
    }
}

async function fetchWeatherForecast() {
    const cityName = inputField.value;
    
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=2fd1c8de70a848dea29113517251002&q=${cityName}&days=3&aqi=no&alerts=no`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
    
        if (!response.ok) {
            return {ok: false, errorMessage: data.error.message};
        } else return {ok: true, data};
    } catch (e) {
        return {ok: false, errorMessage: "Unable to fetch weather data."};
    }
}

// run app
(() => {
    document.addEventListener('DOMContentLoaded', () => {
        const searchForm = document.querySelector('form#searchSection');
        searchForm.addEventListener('submit', handleFormSubmit);
        startBgAnimation();
    })
})()