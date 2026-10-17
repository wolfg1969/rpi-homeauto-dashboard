import { GET_INDOOR_AQI } from '../actions/indoorAirQuality';

const defaultState = {
  Data: '',
  LastUpdate: '',
  isStale: false,
  lastValidData: '',
  lastValidLastUpdate: '',
};

// HA returns the string "unavailable" (or "unknown") when the sensor is offline.
// A valid reading starts with a number, optionally followed by a unit.
const isUnavailable = (value) => {
  const token = String(value || '').trim().split(/\s+/)[0];

  return token === '' || !Number.isFinite(Number(token));
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_INDOOR_AQI: {
      const { Data, LastUpdate } = action.payload;

      if (isUnavailable(Data)) {
        // Keep showing the last valid reading while the sensor is unavailable.
        return Object.assign({}, state, {
          Data: state.lastValidData || Data,
          LastUpdate: state.lastValidLastUpdate,
          isStale: true,
        });
      }

      return Object.assign({}, state, {
        Data,
        LastUpdate,
        isStale: false,
        lastValidData: Data,
        lastValidLastUpdate: LastUpdate,
      });
    }
    default:
      return state;
  }
};
