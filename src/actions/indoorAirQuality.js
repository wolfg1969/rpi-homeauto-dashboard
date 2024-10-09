export const GET_INDOOR_AQI = 'GET_INDOOR_AQI';

const deviceId = process.env.REACT_APP_DOMOITCZ_INDOOR_AQI_DEVICE_ID;
const authToken = btoa(process.env.REACT_APP_DOMOTICZ_API_CREDENTIALS)

export const getIndoorAQI = () => {
  return dispatch => {
    
    fetch(`http://192.168.1.125:8080/json.htm?type=devices&rid=${deviceId}`, {
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    }).then(
      results => results.json()
    ).then(
      data => data.result[0]
    ).then(
      data => {
        const { Data, LastUpdate } = data;
        
        dispatch({ 
          type: GET_INDOOR_AQI,
          payload: {
            Data,
            LastUpdate,
          }
        })
      }
    )
  }
};
