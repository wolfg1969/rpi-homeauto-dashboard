import { combineReducers } from 'redux';
import clock from './clock';
import outdoorWeather from './outdoorWeather';
import outdoorAirQuality from './outdoorAirQuality';
import indoorAirQuality from './indoorAirQuality';
import indoorWeather from './indoorWeather';
import classSchedule from './classSchedule';
import bingWallpaper from './bingWallpaper'

const dashboardApp = combineReducers({
  clock,
  outdoorWeather,
  outdoorAirQuality,
  indoorAirQuality,
  indoorWeather,
  classSchedule,
  bingWallpaper,
})

export default dashboardApp;
