import { CLOCK_TICK } from '../actions/clock'

const defaultState = {
  currentDate: '',
  currentTime: '',
  lunar: '',
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case CLOCK_TICK:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
