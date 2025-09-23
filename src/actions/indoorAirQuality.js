export const GET_INDOOR_AQI = 'GET_INDOOR_AQI';

const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;
const aqiEntityID = process.env.REACT_APP_HA_INDOOR_AQI_ENTITY_ID;

export const getIndoorAQI = () => {
  return dispatch => {
    
    fetch(`${apiURL}/template`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      },
      body: JSON.stringify({
        "template": `
          {% set data = {} %}
          {% set data = dict(data, **{'Data': states('${aqiEntityID}', rounded=True, with_unit=True)}) %}
          {% set data = dict(data, **{'LastUpdate': as_local(states.sensor.weatherstation_livingroom_temperature.last_changed).strftime('%Y-%m-%d %H:%M:%S') }) %}
          {{data|tojson}}
        `
      })
    }).then(
      results => results.json()
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
