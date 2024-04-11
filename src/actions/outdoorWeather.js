export const GET_OUTDOOR_WEATHER = 'GET_OUTDOOR_WEATHER';

const location = process.env.REACT_APP_QWEATHER_LOCATION;
const authKey = process.env.REACT_APP_QWEATHER_API_KEY;

export const getOutdoorWeather = () => {
  return dispatch => {
    // API Document: https://dev.qweather.com/docs/api/weather/weather-now/
    // API Document: https://dev.qweather.com/docs/api/weather/weather-daily-forecast/
    Promise.all([
      fetch(`https://devapi.qweather.com/v7/weather/now?location=${location}&key=${authKey}&lang=zh`).then(res => res.json()),
      fetch(`https://devapi.qweather.com/v7/weather/3d?location=${location}&key=${authKey}&lang=zh`).then(res => res.json())
    ]).then(([now, dailyForecast]) => {
      dispatch({ 
        type: GET_OUTDOOR_WEATHER,
        payload: {
          now,
          dailyForecast,
        }
      })
    })
  }
};
