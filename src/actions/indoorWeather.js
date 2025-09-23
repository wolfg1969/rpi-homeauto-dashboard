export const GET_INDOOR_WEATHER = 'GET_INDOOR_WEATHER';

const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;

const temperatureEntityID = process.env.REACT_APP_HA_INDOOR_TEMPERATURE_ENTITY_ID;
const humidityEntityID = process.env.REACT_APP_HA_INDOOR_HUMIDITY_ENTITY_ID;
const pressureEntityID = process.env.REACT_APP_HA_INDOOR_PRESSURE_ENTITY_ID;

export const getIndoorWeather = () => {
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
          {% set data = dict(data, **{'Temp': states('${temperatureEntityID}', rounded=True)}) %}
          {% set data = dict(data, **{'Humidity': states('${humidityEntityID}', rounded=True)}) %}
          {% set data = dict(data, **{'Barometer': states('${pressureEntityID}', rounded=True)}) %}
          {% set data = dict(data, **{'LastUpdate': as_local(states.sensor.weatherstation_livingroom_temperature.last_changed).strftime('%Y-%m-%d %H:%M:%S') }) %}
          {{data|tojson}}
        `
      })
    }).then(
      results => results.json()
    ).then(
      data => {
        // console.log(data)
        const { Temp, Humidity, HumidityStatus, Barometer, LastUpdate } = data;
        
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
