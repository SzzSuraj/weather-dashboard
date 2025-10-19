// Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeather = document.getElementById('currentWeather');
const forecastWeather = document.getElementById('forecastWeather');

const API_KEY = "b4878daef8ab2fb6a39f043bd44f59bf";
let tempChartInstance;

// Initialize Leaflet Map
const map = L.map('map').setView([20,0], 2); // Initial global view
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Add click event on map
map.on('click', (e) => {
    const {lat, lng} = e.latlng;
    fetchWeatherByCoords(lat, lng);
});

// Event listener for city search
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if(city) fetchWeather(city);
    else alert("Please enter a city name!");
});

// On page load, get user's location
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
        const {latitude, longitude} = pos.coords;
        fetchWeatherByCoords(latitude, longitude);
    });
}

// Fetch weather by city name
async function fetchWeather(city) {
    currentWeather.innerHTML = "";
    forecastWeather.innerHTML = "";

    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const currentData = await currentRes.json();
        if(currentData.cod !== 200) throw new Error(currentData.message);

        displayCurrentWeather(currentData);

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();
        const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
        displayForecast(dailyForecasts);
        displayChart(dailyForecasts, city);

    } catch(err){
        alert("Error fetching weather: " + err.message);
    }
}

// Fetch weather by coordinates (map or geolocation)
async function fetchWeatherByCoords(lat, lon) {
    currentWeather.innerHTML = "";
    forecastWeather.innerHTML = "";

    try {
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const currentData = await currentRes.json();
        if(currentData.cod !== 200) throw new Error(currentData.message);

        displayCurrentWeather(currentData);

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();
        const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
        displayForecast(dailyForecasts);
        displayChart(dailyForecasts, currentData.name);

    } catch(err){
        alert("Error fetching weather: " + err.message);
    }
}

// Display current weather card
function displayCurrentWeather(data) {
    const card = document.createElement('div');
    card.className = 'card';
   
    card.innerHTML = `
        <h3>${data.name}, ${data.sys.country}</h3>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
        <p>${data.weather[0].description}</p>
        <p>Temperature: ${data.main.temp} °C</p>
        <p>Humidity: ${data.main.humidity}%</p>
        <p>Wind: ${data.wind.speed} m/s</p>
    `;
    currentWeather.appendChild(card);
}

// Display 5-day forecast cards
function displayForecast(dailyForecasts) {
    dailyForecasts.forEach(forecast => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <h4>${new Date(forecast.dt_txt).toLocaleDateString()}</h4>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
            <p>${forecast.weather[0].description}</p>
            <p>Temp: ${forecast.main.temp} °C</p>
        `;
        forecastWeather.appendChild(card);
    });
}

// Display 5-day temperature trend chart
function displayChart(dailyForecasts, city) {
    const ctx = document.getElementById('tempChart').getContext('2d');
    const labels = dailyForecasts.map(f => new Date(f.dt_txt).toLocaleDateString());
    const temps = dailyForecasts.map(f => f.main.temp);

    if(tempChartInstance) tempChartInstance.destroy();

    tempChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `5-Day Temperature for ${city}`,
                data: temps,
                fill: true,
                backgroundColor: 'rgba(108, 99, 255, 0.2)',
                borderColor: 'rgba(108, 99, 255, 1)',
                tension: 0.3,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: true, position: 'top' },
            },
            scales: {
                y: { title: { display: true, text: 'Temperature (°C)' } },
                x: { title: { display: true, text: 'Date' } }
            }
        }
    });
}
