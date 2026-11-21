import './App.css';

import React, { Component } from 'react';

import AirQuality  from './components/AirQuality';
// import ClassSchedule from './components/ClassSchedule';
import Clock from './components/Clock';
import IndoorWeather from './components/IndoorWeather';
import OutdoorWeather from './components/OutdoorWeather';
import { connect } from 'react-redux';
import { getClassSchedule } from './actions/classSchedule';
import { getIndoorWeather } from './actions/indoorWeather';
import { getOutdoorWeather } from './actions/outdoorWeather';
import { getBingWallpaper } from './actions/bingWallpaper'
import { tick } from './actions/clock';

const apiURL = process.env.REACT_APP_HA_API_URL;

// 由每秒的调度器统一驱动，页面隐藏时暂停，恢复可见或网络恢复时补跑。
const scheduledTasks = [
  { key: 'outdoor', interval: 1000 * 60 * 30, action: 'getOutdoorWeather' }, // every 30 minutes
  { key: 'indoor', interval: 1000 * 60 * 5, action: 'getIndoorWeather' },    // every 5 minutes
  { key: 'wallpaper', interval: 1000 * 60 * 60 * 12, action: 'getBingWallpaper' }, // every 12 hours
];

class App extends Component {

  constructor(props) {
    super(props);
    this.state = { scale: 1 };
    this.appEl = null;
    this.timers = [];
    this.nextRun = {};
    this.inflight = {};
    this.setAppRef = this.setAppRef.bind(this);
    this.measureScale = this.measureScale.bind(this);
    this.runScheduler = this.runScheduler.bind(this);
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.handleOnline = this.handleOnline.bind(this);
  }

  componentDidMount() {
    this.props.getClassSchedule();

    // 首次加载不受页面可见性影响。
    this.props.tick();
    this.runDueTasks(true);

    this.timers.push(setInterval(this.runScheduler, 1000));

    this.measureScale();
    window.addEventListener('resize', this.measureScale);
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('online', this.handleOnline);
    if (this.appEl && typeof window.ResizeObserver !== 'undefined') {
      this.resizeObserver = new window.ResizeObserver(this.measureScale);
      this.resizeObserver.observe(this.appEl);
    }
  }

  componentDidUpdate() {
    this.measureScale();
  }

  componentWillUnmount() {
    this.timers.forEach(timer => clearInterval(timer));
    this.timers = [];
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('resize', this.measureScale);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  // 每秒执行：更新时钟，并补跑已到期的数据请求。
  runScheduler() {
    if (document.hidden) {
      return;
    }

    this.props.tick();
    this.runDueTasks(false);
  }

  runDueTasks(force) {
    const now = Date.now();

    scheduledTasks.forEach(task => {
      if (this.inflight[task.key]) {
        return;
      }

      if (!force && this.nextRun[task.key] && now < this.nextRun[task.key]) {
        return;
      }

      this.startTask(task);
    });
  }

  startTask(task) {
    this.inflight[task.key] = true;
    this.nextRun[task.key] = Date.now() + task.interval;

    const done = () => {
      this.inflight[task.key] = false;
    };

    // 请求结束（无论成功失败）后才解除占用，避免慢请求叠加。
    Promise.resolve(this.props[task.action]()).then(done, done);
  }

  // 从后台/休眠恢复时立即刷新时钟和过期数据。
  handleVisibilityChange() {
    if (!document.hidden) {
      this.runScheduler();
    }
  }

  // 网络恢复后立即重试所有数据域。
  handleOnline() {
    this.nextRun = {};
    this.runScheduler();
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
    getIndoorWeather: () => dispatch(getIndoorWeather()),
    getClassSchedule: () => dispatch(getClassSchedule()),
    getBingWallpaper: () => dispatch(getBingWallpaper()),
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
