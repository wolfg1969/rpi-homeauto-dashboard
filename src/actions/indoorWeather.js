export const GET_INDOOR_WEATHER = 'GET_INDOOR_WEATHER';
export const GET_INDOOR_AQI = 'GET_INDOOR_AQI';

const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;

const temperatureEntityID = process.env.REACT_APP_HA_INDOOR_TEMPERATURE_ENTITY_ID;
const humidityEntityID = process.env.REACT_APP_HA_INDOOR_HUMIDITY_ENTITY_ID;
const pressureEntityID = process.env.REACT_APP_HA_INDOOR_PRESSURE_ENTITY_ID;
const aqiEntityID = process.env.REACT_APP_HA_INDOOR_AQI_ENTITY_ID;

export const getIndoorWeather = () => {
  return dispatch => {

    // 室内天气与室内空气质量共用一次 template 渲染，同时更新两个数据域。
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
          {% set data = dict(data, **{'aqi': {'Data': states('${aqiEntityID}', rounded=True, with_unit=True), 'lastUpdate': as_local(states['${aqiEntityID}'].last_changed).strftime('%Y-%m-%d %H:%M:%S')}}) %}
          {% set data = dict(data, **{'LastUpdate': as_local(states['${temperatureEntityID}'].last_changed).strftime('%Y-%m-%d %H:%M:%S') }) %}
          {{data|tojson}}
        `
      })
    }).then(
      results => results.json()
    ).then(
      data => {
        const { Temp, Humidity, HumidityStatus, Barometer, aqi, LastUpdate } = data;
        const { Data, lastUpdate: aqiLastUpdate } = aqi || {};

        dispatch({
          type: GET_INDOOR_WEATHER,
          payload: {
            Temp,
            Humidity,
            HumidityStatus,
            Barometer,
            LastUpdate
          }
        });

        dispatch({
          type: GET_INDOOR_AQI,
          payload: {
            Data,
            LastUpdate: aqiLastUpdate
          }
        });
      }
    )
  }
};
