import { GET_CLASS_SCHEDULE } from '../actions/classSchedule'

const defaultState = {
  schedule: [],
  key: '',
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_CLASS_SCHEDULE:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
