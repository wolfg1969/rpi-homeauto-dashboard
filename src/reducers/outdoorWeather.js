import { GET_OUTDOOR_WEATHER } from '../actions/outdoorWeather'

const defaultState = {
  now: {},
  dailyForecast: {},
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_OUTDOOR_WEATHER:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
