import './App.css';

import React, { Component } from 'react';

import AirQuality  from './components/AirQuality';
import ClassSchedule from './components/ClassSchedule';
import Clock from './components/Clock';
import IndoorWeather from './components/IndoorWeather';
import OutdoorWeather from './components/OutdoorWeather';
import { connect } from 'react-redux';
import { getClassSchedule } from './actions/classSchedule';
import { getIndoorAQI } from './actions/indoorAirQuality';
import { getIndoorWeather } from './actions/indoorWeather';
import { getOutdoorAQI } from './actions/outdoorAirQuality';
import { getOutdoorWeather } from './actions/outdoorWeather';
import { getBingWallpaper } from './actions/bingWallpaper'
import { tick } from './actions/clock';

class App extends Component {
  
  componentWillMount() {
    this.props.tick();
    this.props.getOutdoorWeather();
    this.props.getOutdoorAQI();
    this.props.getIndoorAQI();
    this.props.getIndoorWeather();
    this.props.getClassSchedule();
    this.props.getBingWallpaper();
  }
  
  componentDidMount() {
    setInterval(() => this.props.tick(), 1000);  // every second
    setInterval(() => this.props.getOutdoorAQI(), 1000 * 60 * 30); // every 30 minutes
    setInterval(() => this.props.getOutdoorWeather(), 1000 * 60 * 30); // every 30 minutes
    setInterval(() => this.props.getIndoorAQI(), 1000 * 60 * 5); // every 5 minutes
    setInterval(() => this.props.getIndoorWeather(), 1000 * 60 * 5); // every 5 minutes
    // setInterval(() => this.props.getClassSchedule(), 1000 * 60 * 45); // every 45 minutes
    setInterval(() => this.props.getBingWallpaper(), 1000 * 60 * 60 * 12); // every 12 hours
  }
  
  render() {
    return (
      <div className="App container">
      
        <div className="columns">
          <div className="column col-12">
            <Clock />
          </div> 
        </div>
      
        <div className="columns">
          <div className="column col-12">
            <OutdoorWeather />
          </div> 
        </div>
      
        <div className="columns col-oneline">
          <div className="column col-4">
            {
              (() => {
                const { code, now } = this.props.outdoorAirQuality;
    
                if (code !== "200") {
                  return null
                }
                
                const { aqi, pm10, pm25, category } = now;
                
                return <AirQuality title="室外空气质量" aqi={aqi} aqiText={category} aqiData={now} />
              })()
            }
            
          </div>
      
          <div className="column col-4">
            {
              (() => {
                const { Data, LastUpdate } = this.props.indoorAirQuality;
                const aqiVal = Data.split(' ')[0]
                return <AirQuality title="室内空气质量" aqi={aqiVal} aqiText="" lastUpdate={LastUpdate} />
              })()
            }
          </div>
      
          <div className="column col-4">
            <IndoorWeather />
          </div>
        </div>
            
        {/* <div className="columns">
          <div className="column col-12">
            <ClassSchedule />
          </div>
        </div> */}
        <div class="columns">
        <div className="column col-auto col-ml-auto">
          <span style={{position:'absolute', bottom: 10, right: 10}}>{this.props.bingWallpaper.title}</span>
        </div>
        </div>
      
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    outdoorWeather: state.outdoorWeather,
    outdoorAirQuality: state.outdoorAirQuality,
    indoorAirQuality: state.indoorAirQuality,
    bingWallpaper: state.bingWallpaper,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    tick: () => dispatch(tick()),
    getOutdoorWeather: () => dispatch(getOutdoorWeather()),
    getOutdoorAQI: () => dispatch(getOutdoorAQI()),
    getIndoorAQI: () => dispatch(getIndoorAQI()),
    getIndoorWeather: () => dispatch(getIndoorWeather()),
    getClassSchedule: () => dispatch(getClassSchedule()),
    getBingWallpaper: () => dispatch(getBingWallpaper()),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
