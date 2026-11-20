export const GET_OUTDOOR_WEATHER = 'GET_OUTDOOR_WEATHER';

// const location = process.env.REACT_APP_QWEATHER_LOCATION;
// const authKey = process.env.REACT_APP_QWEATHER_API_KEY;
const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;

const weatherEntityID= process.env.REACT_APP_HA_WEATHER_ENTITY_ID;
const weatherWarningsEntityID = process.env.REACT_APP_HA_WEATHER_WARNINGS_ENTITY_ID;

// API Document: https://dev.qweather.com/docs/api/weather/wind-guide/
const windDirectionNames = {
  n: '北风',
  nne: '东北偏北风',
  ne: '东北风',
  ene: '东北偏东风',
  e: '东风',
  ese: '东南偏东风',
  se: '东南风',
  sse: '东南偏南风',
  s: '南风',
  ssw: '西南偏南风',
  sw: '西南风',
  wsw: '西南偏西风',
  w: '西风',
  wnw: '西北偏西风',
  nw: '西北风',
  nnw: '西北偏北风',
  none: '无持续风向',
  vrb: '风向变化不定',
  rotational: '旋转风',
};

const getWindDirectionName = windDir => {
  if (!windDir) return windDir;
  return windDirectionNames[String(windDir).toLowerCase()] || windDir;
};


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

    const warningsPromise = fetch(
      `${apiURL}/states/${weatherWarningsEntityID}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      }
    }).then(response => response.json());

    Promise.all([weatherPromise, forecastPromise, warningsPromise]).then(
      ([weatherData, forecastData, warningsData]) => {

        const { 
          condition_cn: text,
          feels_like: feelsLike,
          // hourly_summary: hourlySummary,
          humidity,
          update_time: updateTime,
          minutely_summary: minutelySummary,
          pressure,
          pressure_unit: pressureUnit,
          qweather_icon: icon, 
          temperature: temp,
          temperature_unit: tempUnit,
          wind_dir: windDir,
          wind_scale: windScale,
          wind_bearing: wind360,
          wind_speed: windSpeed
        } = weatherData.attributes;

        const { forecast: daily_forecast } = forecastData.service_response[weatherEntityID];
        let daily_data = [];
        daily_forecast.forEach(item => {
          const {
            text: textDay, 
            text_night: textNight, 
            icon: iconDay, 
            icon_night: iconNight,
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

        const warning = warningsData.attributes.text;

        dispatch({ 
          type: GET_OUTDOOR_WEATHER,
          payload: {
            now: {
              code: '200',
              now: {
                feelsLike, 
                icon,
                // hourlySummary,
                humidity, 
                minutelySummary,
                pressure, 
                pressureUnit,
                temp, 
                tempUnit,
                text,
                warning,
                wind360,
                windDir: getWindDirectionName(windDir),
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
