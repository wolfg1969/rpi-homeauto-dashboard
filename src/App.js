import './App.css';

import React, { Component } from 'react';

import AirQuality  from './components/AirQuality';
// import ClassSchedule from './components/ClassSchedule';
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

const apiURL = process.env.REACT_APP_HA_API_URL;

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { scale: 1 };
    this.appEl = null;
    this.setAppRef = this.setAppRef.bind(this);
    this.measureScale = this.measureScale.bind(this);
  }

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

    this.measureScale();
    window.addEventListener('resize', this.measureScale);
    if (this.appEl && typeof window.ResizeObserver !== 'undefined') {
      this.resizeObserver = new window.ResizeObserver(this.measureScale);
      this.resizeObserver.observe(this.appEl);
    }
  }

  componentDidUpdate() {
    this.measureScale();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.measureScale);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  setAppRef(el) {
    this.appEl = el;
  }

  // 等比缩放整个页面，保证在任意分辨率的屏幕上都能一页显示、不出现滚动条。
  measureScale() {
    if (!this.appEl) {
      return;
    }

    const availableHeight = window.innerHeight;
    const contentHeight = this.appEl.offsetHeight;

    if (!availableHeight || !contentHeight) {
      return;
    }

    const scale = Math.min(1, availableHeight / contentHeight);

    if (Math.abs(scale - this.state.scale) > 0.001) {
      this.setState({ scale });
    }
  }

  triggerHAWebhook(hookName) {
    fetch(`${apiURL}/webhook/${hookName}`, {
      method: 'POST'
    })
  }

  reloadPage(event) {
    if (event.target.closest('button')) {
      return;
    }
    window.location.reload();
  }

  render() {
    return (
      <div
        className="App container"
        ref={this.setAppRef}
        style={{ transform: `scale(${this.state.scale})`, transformOrigin: 'top center' }}
        onDoubleClick={event => this.reloadPage(event)}
      >
      
        <div className="columns">
          <div className="column col-12">
            <Clock />
          </div>
          <div className="column col-12">
            <OutdoorWeather />
          </div>
          <div className="column col-4">
            {
              (() => {
                const { code, now } = this.props.outdoorAirQuality;
    
                if (code !== "200") {
                  return null
                }
                
                const { aqi, /*pm10, pm25,*/ category } = now;
                
                return <AirQuality title="室外空气质量" aqi={aqi} aqiText={category} aqiData={now} />
              })()
            }
          </div>
      
          <div className="column col-4">
            {
              (() => {
                const { Data, LastUpdate, isStale } = this.props.indoorAirQuality;
                const aqiVal = Data.split(' ')[0]
                return <AirQuality title="室内空气质量" aqi={aqiVal} aqiText="" lastUpdate={LastUpdate} isStale={isStale} />
              })()
            }
          </div>
      
          <div className="column col-4">
            <IndoorWeather />
          </div>

          <div className="column col-4 text-center">
            <button className="btn btn-primary btn-lg btn-fill" onClick={() => this.triggerHAWebhook('turn_off_all_lights')}>一键关灯</button>
          </div>
          <div className="column col-4 text-center">
            <button className="btn btn-error btn-lg btn-fill" onClick={() => this.triggerHAWebhook('turn_on_main_lights')}>一键开灯</button>
          </div>
          <div className="column col-4 text-center">
            <button className="btn btn-success btn-lg btn-fill" onClick={() => this.triggerHAWebhook('toggle_door_light')}>玄关灯</button>
          </div>

          <div className="column col-12 text-right wallpaper-title">
            <span>{this.props.bingWallpaper.title}</span>
          </div>
        </div>
        {/* <div className="columns">
          <div className="column col-12">
            <ClassSchedule />
          </div>
        </div> */}
      
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
