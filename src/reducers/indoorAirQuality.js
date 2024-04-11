import { GET_INDOOR_AQI } from '../actions/indoorAirQuality';

const defaultState = {
  Data: '', 
  LastUpdate: ''
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_INDOOR_AQI:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
