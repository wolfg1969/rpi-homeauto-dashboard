import { GET_INDOOR_WEATHER } from '../actions/indoorWeather'

const defaultState = {
  Temp: '', 
  Humidity: '', 
  HumidityStatus: '', 
  Barometer: '', 
  LastUpdate: ''
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_INDOOR_WEATHER:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
