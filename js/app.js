const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const currentWeather = document.getElementById('currentWeather');
const forecastWeather = document.getElementById('forecastWeather');

const API_KEY = "b4878daef8ab2fb6a39f043bd44f59bf";

searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if(city){
        fetchWeather(city);
    } else {
        alert("Please enter a city name!");
    }
});

async function fetchWeather(city){
    // Clear previous content
    currentWeather.innerHTML = "";
    forecastWeather.innerHTML = "";

    try {
        // --- Current Weather ---
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const currentData = await currentRes.json();
        if(currentData.cod !== 200) throw new Error(currentData.message);

        const currentCard = document.createElement('div');
        currentCard.className = 'card';
        currentCard.innerHTML = `
            <h3>${currentData.name}, ${currentData.sys.country}</h3>
            <img src="https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png" alt="${currentData.weather[0].description}">
            <p>${currentData.weather[0].description}</p>
            <p>Temperature: ${currentData.main.temp} °C</p>
            <p>Humidity: ${currentData.main.humidity}%</p>
            <p>Wind: ${currentData.wind.speed} m/s</p>
        `;
        currentWeather.appendChild(currentCard);

        // --- 5-Day Forecast ---
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();

        // Filter to get one forecast per day (at 12:00)
        const dailyForecasts = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(forecast => {
            const forecastCard = document.createElement('div');
            forecastCard.className = 'card';
            forecastCard.innerHTML = `
                <h4>${new Date(forecast.dt_txt).toLocaleDateString()}</h4>
                <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
                <p>${forecast.weather[0].description}</p>
                <p>Temp: ${forecast.main.temp} °C</p>
            `;
            forecastWeather.appendChild(forecastCard);
        });

        // --- Chart.js Temperature Trend ---
            const ctx = document.getElementById('tempChart').getContext('2d');

            // Extract labels (dates) and data (temperatures)
            const labels = dailyForecasts.map(f => new Date(f.dt_txt).toLocaleDateString());
            const temps = dailyForecasts.map(f => f.main.temp);

            // Destroy previous chart if exists to avoid duplication
            if(window.tempChartInstance) {
                window.tempChartInstance.destroy();
            }

            // Create new chart
            window.tempChartInstance = new Chart(ctx, {
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
                        legend: {
                            display: true,
                            position: 'top'
                        },
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Temperature (°C)'
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Date'
                            }
                        }
                    }
                }
            });

    } catch(err){
        alert("Error fetching weather: " + err.message);
    }
}
