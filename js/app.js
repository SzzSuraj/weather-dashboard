const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeather = document.getElementById('currentWeather');
const forecastWeather = document.getElementById('forecastWeather');

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        console.log(`Fetching weather for: ${city}`);
        // API integration will go here
    } else {
        alert("Please enter a city name!");
    }
});
