import { GET_OUTDOOR_AQI } from '../actions/outdoorWeather';

const defaultState = {
  Data: '', 
  LastUpdate: ''
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_OUTDOOR_AQI:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
