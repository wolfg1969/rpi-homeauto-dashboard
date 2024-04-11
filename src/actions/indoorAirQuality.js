export const GET_INDOOR_AQI = 'GET_INDOOR_AQI';

const deviceId = '42';

export const getIndoorAQI = () => {
  return dispatch => {
    
    fetch(`http://192.168.1.125:8080/json.htm?type=devices&rid=${deviceId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
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
