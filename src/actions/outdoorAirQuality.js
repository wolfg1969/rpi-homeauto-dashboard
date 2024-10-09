export const GET_OUTDOOR_AQI = 'GET_OUTDOOR_AQI';

const location = process.env.QWEATHER_LOCATION;
const authKey = process.env.QWEATHER_API_KEY;

export const getOutdoorAQI = () => {
  return dispatch => {
    // API Document: https://dev.qweather.com/docs/api/air/air-now/
    fetch(`https://devapi.qweather.com/v7/air/now?location=${location}&key=${authKey}&lang=zh`).then(
      results => results.json()
    ).then(
      data => dispatch({ 
        type: GET_OUTDOOR_AQI,
        payload: {
          ...data,
        }
      })
    )
  }
};
