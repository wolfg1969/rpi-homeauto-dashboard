export const GET_OUTDOOR_WEATHER = 'GET_OUTDOOR_WEATHER';

// const location = process.env.REACT_APP_QWEATHER_LOCATION;
// const authKey = process.env.REACT_APP_QWEATHER_API_KEY;
const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;

const weatherEntityID= process.env.REACT_APP_HA_WEATHER_ENTITY_ID;

export const getOutdoorWeather = () => {
  return dispatch => {
    // API Document: https://dev.qweather.com/docs/api/weather/weather-now/
    // API Document: https://dev.qweather.com/docs/api/weather/weather-daily-forecast/
    // Promise.all([
    //   fetch(`https://devapi.qweather.com/v7/weather/now?location=${location}&key=${authKey}&lang=zh`).then(res => res.json()),
    //   fetch(`https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${authKey}&lang=zh`).then(res => res.json())
    // ]).then(([now, dailyForecast]) => {
    //   dispatch({ 
    //     type: GET_OUTDOOR_WEATHER,
    //     payload: {
    //       now,
    //       dailyForecast,
    //     }
    //   })
    // })
    const weatherPromise = fetch(
      `${apiURL}/states/${weatherEntityID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      }
    }).then(response => response.json());

    const forecastPromise = fetch(
      `${apiURL}/services/weather/get_forecasts?return_response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      },
      body: JSON.stringify({
        entity_id: weatherEntityID,
        type: 'daily'
      })
    }).then(response => response.json());

    Promise.all([weatherPromise,forecastPromise]).then(
      ([weatherData, forecastData]) => {

        const { 
          condition_cn: text,
          feels_like: feelsLike,
          hourly_summary: hourlySummary,
          humidity,
          last_updated: updateTime,
          minutely_summary: minutelySummary,
          pressure,
          pressure_unit: pressureUnit,
          qweather_icon: icon, 
          temperature: temp,
          temperature_unit: tempUnit,
          warning,
          winddir: windDir,
          windscale: windScale,
          wind_bearing: wind360,
          wind_speed: windSpeed
        } = weatherData.attributes;

        const { forecast: daily_forecast } = forecastData.service_response["weather.tian_qi"];
        let daily_data = [];
        daily_forecast.forEach(item => {
          const {
            text: textDay, 
            textnight: textNight, 
            icon: iconDay, 
            iconnight: iconNight,
            templow: tempMin,
            temperature: tempMax,
          } = item;
          daily_data.push({
            textDay, 
            textNight, 
            iconDay, 
            iconNight,
            tempMin,
            tempMax,
            moonPhaseIcon: '',  // unavailable
          })
        });

        dispatch({ 
          type: GET_OUTDOOR_WEATHER,
          payload: {
            now: {
              code: '200',
              now: {
                feelsLike, 
                icon,
                hourlySummary,
                humidity, 
                minutelySummary,
                pressure, 
                pressureUnit,
                temp, 
                tempUnit,
                text,
                warning,
                wind360, 
                windDir, 
                windScale, 
                windSpeed,
                updateTime
              }
            },
            dailyForecast: {
              code: '200',
              daily: daily_data.slice(0, 3)
            }
          }
        });
      }
    );
  };
};
