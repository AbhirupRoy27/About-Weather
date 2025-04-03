// API configuration
const API_KEY = 'ace3d98d5cedbb4cb312fdb370d6598d'; 
const WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';

// DOM elements
const cityInput = document.getElementById('city');
const searchButton = document.getElementById('search');
const cityName = document.getElementById('city-name');
const dateElement = document.getElementById('date');
const tempElement = document.getElementById('temp');
const feelsLikeElement = document.getElementById('feels-like');
const weatherIcon = document.getElementById('weather-icon');
const conditionElement = document.getElementById('condition');
const humidityElement = document.getElementById('humidity');
const windSpeedElement = document.getElementById('wind-speed');
const pressureElement = document.getElementById('pressure');

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
}

// Toggle theme
themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Function to format date
const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Function to format day
const formatDay = (date) => {
    return date.toLocaleDateString('en-US', {
        weekday: 'long'
    });
};

// Function to convert Kelvin to Celsius
const kelvinToCelsius = (kelvin) => {
    return Math.round(kelvin - 273.15);
};

// Function to update UI with weather data
const updateWeatherUI = (data) => {
    // Update city and date
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateElement.textContent = formatDate(new Date());

    // Update temperature
    const temp = kelvinToCelsius(data.main.temp);
    const feelsLike = kelvinToCelsius(data.main.feels_like);
    tempElement.textContent = `${temp}°C`;
    feelsLikeElement.textContent = `Feels like: ${feelsLike}°C`;

    // Update weather condition and icon
    conditionElement.textContent = data.weather[0].description.charAt(0).toUpperCase() + 
                                 data.weather[0].description.slice(1);
                                 weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;


    // Update weather details
    humidityElement.textContent = `${data.main.humidity}%`;
    windSpeedElement.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`; // Convert m/s to km/h
    pressureElement.textContent = `${data.main.pressure} hPa`;
};

// Function to update forecast UI
const updateForecastUI = (data) => {
    // Get daily forecasts (one per day)
    const dailyForecasts = data.list.reduce((acc, forecast) => {
        const date = new Date(forecast.dt * 1000);
        const dateString = date.toDateString();
        
        if (!acc[dateString]) {
            acc[dateString] = forecast;
        }
        return acc;
    }, {});

    // Convert to array and get first 5 days
    const forecasts = Object.values(dailyForecasts).slice(0, 5);

    // Update each day's forecast
    forecasts.forEach((forecast, index) => {
        const day = index + 1;
        const date = new Date(forecast.dt * 1000);
        
        // Update date
        document.getElementById(`day${day}-date`).textContent = formatDay(date);
        
        // Update icon
        const iconElement = document.getElementById(`day${day}-icon`);
        iconElement.src = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png`;
        
        // Update temperatures
        document.getElementById(`day${day}-temp-max`).textContent = 
            `${kelvinToCelsius(forecast.main.temp_max)}°C`;
        document.getElementById(`day${day}-temp-min`).textContent = 
            `${kelvinToCelsius(forecast.main.temp_min)}°C`;
        
        // Update condition
        document.getElementById(`day${day}-condition`).textContent = 
            forecast.weather[0].description.charAt(0).toUpperCase() + 
            forecast.weather[0].description.slice(1);
    });
};

// Function to fetch weather and forecast data
const getWeatherData = async (city) => {
    try {
        // Fetch current weather
        const weatherResponse = await fetch(`${WEATHER_URL}?q=${city}&appid=${API_KEY}`);
        if (!weatherResponse.ok) {
            throw new Error('City not found');
        }
        const weatherData = await weatherResponse.json();
        updateWeatherUI(weatherData);

        // Fetch 5-day forecast
        const forecastResponse = await fetch(`${FORECAST_URL}?q=${city}&appid=${API_KEY}`);
        if (!forecastResponse.ok) {
            throw new Error('Forecast data not available');
        }
        const forecastData = await forecastResponse.json();
        updateForecastUI(forecastData);

    } catch (error) {
        alert('Error: ' + error.message);
    }
};

// Event listeners
searchButton.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    } else {
        alert('Please enter a city name');
    }
});

// Allow search when Enter key is pressed
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        searchButton.click();
    }
});

// Load default city weather (London)
window.addEventListener('load', () => {
    getWeatherData('New Delhi');
});

