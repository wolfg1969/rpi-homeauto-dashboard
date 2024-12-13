export const GET_INDOOR_WEATHER = 'GET_INDOOR_WEATHER';

const deviceId = process.env.REACT_APP_DOMOTICZ_INDOOR_WEATHER_DEVICE_ID;
const authToken = btoa(process.env.REACT_APP_DOMOTICZ_API_CREDENTIALS)

export const getIndoorWeather = () => {
  return dispatch => {
    
    fetch(`http://192.168.1.125:8080/json.htm?type=command&param=getdevices&rid=${deviceId}`, {
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    }).then(
      results => results.json()
    ).then(
      data => data.result[0]
    ).then(
      data => {
        const { Sunrise, Sunset, Temp, Humidity, HumidityStatus, Barometer, LastUpdate } = data;
        
        dispatch({ 
          type: GET_INDOOR_WEATHER,
          payload: {
            Temp, 
            Humidity, 
            HumidityStatus, 
            Barometer, 
            LastUpdate
          }
        })
      }
    )
  }
};
