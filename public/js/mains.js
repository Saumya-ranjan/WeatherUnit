(function() {

    "use strict";

    /**
     * This function wraps all data that would otherwise be in a global scope relative to the rest of the program, creating the needed data to establish the map
     * @param mapboxgl
     * @returns {{saCoords: {lon: number, lat: number}, weatherApiUrl: string, marker: *, map: mapboxgl.Map, weatherOptions: {appid: string, exclude: string, units: string}}}
     */
    function createWeatherAppObject(mapboxgl) {

        mapboxgl.accessToken = MAPBOX_KEY;
        const saCoords = {lat: 29.4241, lon: -98.4936};

        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v9',
            center: saCoords,
            zoom: 13
        });

        const marker = new mapboxgl.Marker({
            draggable: true
        }).setLngLat(saCoords)
            .addTo(map);

        const weatherApiUrl = 'https://api.openweathermap.org/data/2.5/onecall';

        const weatherOptions = {
            appid: OPEN_WEATHER_APPID,
            exclude: 'minutely, hourly',
            units: 'metric'
        };

        return {saCoords, map, marker, weatherApiUrl, weatherOptions};
    }

    /**
     * This function simply returns the html used to create a weather panel
     * @param forecast
     * @returns {string}
     */
    function createWeatherPanel(forecast) {
        return (
            `<article class="weather-panel">
                <h3>${new Date(forecast.dt * 1000).toLocaleDateString()}</h3>
                <p>${forecast.temp.min}&deg / ${forecast.temp.max}&deg</p>
                <img src="http://openweathermap.org/img/w/${forecast.weather[0].icon}.png" alt="icon">
                <p class="extra-info">Humidity: ${forecast.humidity}%</p>
                <p class="extra-info">Wind: ${forecast.wind_speed}mph</p>
                <p class="extra-info">Pressure: ${forecast.pressure}mbar</p>
            </article>`
        );
    }

    /**
     * This function reduces all forecast information from the weather api to an html string that is used to display the weather panels
     * @param response
     */
    function createWeatherPanels(response) {
        var forecastDays = response.daily.slice(0, 5);
        document.querySelector('#weather-panels').innerHTML = forecastDays.reduce((accumulator, currentValue) => {
            accumulator += createWeatherPanel(currentValue);
            return accumulator;
        }, '');
    }

    /**
     * This function makes the request to the weather api
     * @param weatherApiUrl
     * @param weatherOptions
     * @param coords
     */
    function getWeather({ weatherApiUrl, weatherOptions }, coords) {

        weatherOptions.lat = coords.lat;
        weatherOptions.lon = coords.lon;

        const weatherUrl = `${weatherApiUrl}?${new URLSearchParams(weatherOptions)}`;

        fetch(weatherUrl)
            .then(response => response.json())
            .then(createWeatherPanels)
            .catch(console.log);

    }


    /**
     * This function adds event listeners to the search button and map marker
     * @param app
     */
    function addListeners(app) {

        const { marker, map } = app;

        const searchBtn = document.querySelector('#search-btn');
        const searchInput = document.querySelector('#search');

        marker.on('dragend', function() {
            const markerPosition = app.marker.getLngLat();
            const position = {lat: markerPosition.lat, lon: markerPosition.lng};
            map.setCenter(markerPosition);
            getWeather(app, position);
        });

        searchBtn.addEventListener('click', (results) => {
            geocode(searchInput.value, MAPBOX_KEY).then(function(results) {
                map.setCenter(results);
                marker.setLngLat(results);
                getWeather(app, {lat: results[1], lon: results[0]});
            });
        });

    }

    // create the app object to use
    const app = createWeatherAppObject(mapboxgl);

    // populate the weather for the inital page load
    getWeather(app, app.saCoords);

    addListeners(app);

}());

