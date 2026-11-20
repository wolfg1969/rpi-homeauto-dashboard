export const GET_OUTDOOR_AQI = 'GET_OUTDOOR_AQI';

// const location = process.env.REACT_APP_QWEATHER_LOCATION;
// const authKey = process.env.REACT_APP_QWEATHER_API_KEY;
const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;
const airQualityEntityID= process.env.REACT_APP_HA_AIR_QUALITY_ENTITY_ID;

export const getOutdoorAQI = () => {
  return dispatch => {
    // API Document: https://dev.qweather.com/docs/api/air/air-now/
    // fetch(`https://devapi.qweather.com/v7/air/now?location=${location}&key=${authKey}&lang=zh`).then(
    //   results => results.json()
    // ).then(
    //   data => dispatch({ 
    //     type: GET_OUTDOOR_AQI,
    //     payload: {
    //       ...data,
    //     }
    //   })
    // )
    fetch(`${apiURL}/states/${airQualityEntityID}`, {
      method: 'GET',
      // method: 'POST',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      }
    }).then(
      results => results.json()
    ).then(
      data => {
        const { aqi_value, primary_pollutant } = data.attributes;
        dispatch({ 
          type: GET_OUTDOOR_AQI,
          payload: {
            code: "200",
            now: {
              aqi: aqi_value,
              category: data.state,
              primary: primary_pollutant
            }
          }
        })
      }
    )
  }
};
