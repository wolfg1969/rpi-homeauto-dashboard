import { GET_BING_WALLPAPER } from '../actions/bingWallpaper';

const defaultState = {
  url: '', 
  title: ''
};

export default function reducer(state = defaultState, action) {

  switch (action.type) {
    case GET_BING_WALLPAPER:
      return Object.assign({}, state, {
          ...action.payload,
        });
    default:
      return state;
  }
};
