import 'moment/locale/zh-cn';

import * as moment from 'moment';

import React, { Component } from 'react';

import { connect } from 'react-redux';

// import weatherIcons from '../assets/heweather-icons';

class OutdoorWeather extends Component {
  
  render() {
    const { now, dailyForecast } = this.props.outdoorWeather;

    const { code, now: nowData } = now;
    
    if (code !== '200') {
      return null
    }
    
    return (
      <div className="info-card weather outdoor">
        <div className="columns col-oneline col-gapless">
        {
          (() => {
            const { icon, text } = nowData;
          
            return (
              <div className="cond text-center column col-3">
                <span className="h1"><i className={`weather-icon qi-${icon}`}></i> </span>
                {/* <img className="weather-icon" src={weatherIcons[`icon_${icon}`]} alt={text} /> */}
                <p>{text}</p>
              </div>
            )
          })()
        }
      
        {
          (() => {
          
            const { humidity, pressure, temp, feelsLike, wind360, windDir, windScale, windSpeed } = nowData;
            
            const windLevelHigh = windScale.substring(windScale.lastIndexOf('-')+1);
            
            let unit = '级';
            
            if (isNaN(parseInt(windLevelHigh))) {
              unit = '';
            }
          
            return (
              <div className="temp column col-9">
                <p>
                  <i className="wi wi-thermometer"></i>{temp}<span>&#x2103;</span> <small>{feelsLike}<span>&#x2103;</span></small>
                  <i className="wi wi-humidity"></i> {humidity} <span>%</span>
                </p>
                <p className="wind">
                  <i className="wi wi-barometer"></i> {pressure} <span>hPa</span> 
                  <i className={`wi wi-wind-beaufort-${windLevelHigh}`}></i> <span>{`${windDir} ${windScale}${unit}`}</span>
                </p>
              </div>
            )
          })()
        }
        </div>
      
        <div className="forecast columns col-oneline">
        {
          (() => {
            const { code, daily } = dailyForecast;

            if (code !== '200') {
              return null
            }

            return daily.map((item, index) => {
              
              let title = '今天';
              if (index === 1) {
                title = '明天'
              } else if (index === 2) {
                title = '后天'
              }
              
              const { 
                textDay, 
                textNight, 
                iconDay, 
                iconNight,
                tempMin,
                tempMax,
                moonPhaseIcon,
              } = item;
              
              let condText = textDay;
              
              if (textDay !== textNight) {
                condText = `${textDay}转${textNight}`;
              }
              
              const temp = `${tempMin} - ${tempMax}\u2103`;
              
              return (
              <div className="column col-4 text-center" key={index}>
                <h4>{title} <small><i className={`qi-${moonPhaseIcon}`}></i></small></h4>
                <p>
                <span className="h4"><i className={`qi-${iconDay}`}></i> <i className={`qi-${iconNight}`}></i></span>
                </p>
                <p>{condText}</p>
                <p>{temp}</p>
              </div>
              )
            })
          })()
        }
        </div>
        
        {
          (() => {
            const lastUpdate = now.updateTime;
            
            return (
              <p className="note">
              更新于 {moment(lastUpdate).format('YYYY-MM-DD HH:mm:ss')}
              </p>
            )
          })()
        }
        
      
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    outdoorWeather: state.outdoorWeather,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(OutdoorWeather);
