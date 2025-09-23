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
    fetch(
      `${apiURL}/states/${weatherEntityID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      }
    }).then(
      results => results.json()
    ).then(
      data => {
        const { 
          qweather_icon: icon, 
          condition_cn: text, 
          humidity,
          pressure,
          temperature: temp,
          feelslike: feelsLike,
          wind_bearing: wind360,
          winddir: windDir,
          windscale: windScale,
          wind_speed: windSpeed,
          last_updated: updateTime,
          daily_forecast
        } = data.attributes;

        let daily_data = []
        daily_forecast.map(item => {
          const {
            text: textDay, 
            textnight: textNight, 
            icon: iconDay, 
            iconnight: iconNight,
            native_temp_low: tempMin,
            native_temperature: tempMax,
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
        })

        dispatch({ 
          type: GET_OUTDOOR_WEATHER,
          payload: {
            now: {
              code: '200',
              now: {
                icon,
                text,
                humidity, 
                pressure, 
                temp, 
                feelsLike, 
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
        })
      }
    )
  }
};
