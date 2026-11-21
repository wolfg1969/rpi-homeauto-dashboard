export const GET_OUTDOOR_WEATHER = 'GET_OUTDOOR_WEATHER';
export const GET_OUTDOOR_AQI = 'GET_OUTDOOR_AQI';

const apiURL = process.env.REACT_APP_HA_API_URL;
const haAPIAuthToken = process.env.REACT_APP_HA_API_TOKEN;

const weatherEntityID = process.env.REACT_APP_HA_WEATHER_ENTITY_ID;

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
    // 室外天气、逐日预报、空气质量与天气预警统一取自 qweather_pro 的 get_weather 服务，
    // 一次请求同时更新 outdoorWeather 与 outdoorAirQuality 两个数据域。
    return fetch(
      `${apiURL}/services/qweather_pro/get_weather?return_response`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${haAPIAuthToken}`,
        'Content-Type': 'application/json',
        'Origin': '*'
      },
      body: JSON.stringify({
        entity_id: weatherEntityID
      })
    }).then(
      response => response.json()
    ).then(
      data => {
        const serviceResponse = data && data.service_response;

        if (!serviceResponse) {
          return;
        }

        const {
          now: current = {},
          daily = [],
          aqi = {},
          warning: warnings = [],
          minutely_summary: minutelySummary = '',
          update_time: updateTime,
        } = serviceResponse;

        const dailyData = daily.slice(0, 3).map(item => {
          const daytime = item.daytime || {};
          const nighttime = item.nighttime || {};

          return {
            textDay: daytime.text,
            textNight: nighttime.text,
            iconDay: daytime.icon,
            iconNight: nighttime.icon,
            tempMin: item.temp_min,
            tempMax: item.temp_max,
            moonPhaseIcon: '',  // unavailable
          };
        });

        const warning = warnings
          .map(item => item.title || item.text)
          .filter(Boolean)
          .join('；');

        dispatch({
          type: GET_OUTDOOR_WEATHER,
          payload: {
            now: {
              code: '200',
              now: {
                feelsLike: current.feelsLike,
                icon: current.icon,
                humidity: current.humidity,
                minutelySummary,
                pressure: current.pressure,
                pressureUnit: 'hPa',
                temp: current.temp,
                tempUnit: '°C',
                text: current.text_cn,
                warning,
                wind360: current.wind360,
                windDir: getWindDirectionName(current.windDir),
                windScale: current.windScale,
                windSpeed: current.windSpeed,
                updateTime
              }
            },
            dailyForecast: {
              code: '200',
              daily: dailyData
            }
          }
        });

        dispatch({
          type: GET_OUTDOOR_AQI,
          payload: {
            code: '200',
            now: {
              aqi: aqi.aqi,
              category: aqi.category,
              primary: aqi.primary
            }
          }
        });
      }
    );
  };
};
