import React, { Component } from 'react';
import { getAqiClassName, getChinaAqiClassName } from '../helper'

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

class AirQuality extends Component {
  
  render() {
    const { title, aqi, aqiText, aqiData, lastUpdate } = this.props;

    if (aqiData) {
      const aqiClassName = getChinaAqiClassName(aqi);
      return (
        <div className={`info-card aqi text-center ${aqiClassName}`}>
          <h6>{title}</h6>
          <p className="h2">{aqi}</p>
          <p className="h5">{aqiText}</p>
          {
            (() => {
              if (aqiData.primary) {
                return <p><small>主要污染物：{aqiData.primary}</small></p>
              } else {
                return null
              }
            })()
          }
          
        </div>
      )

    } else {
      const aqiClassName = getAqiClassName(aqi);
      return (
        <div className={`info-card aqi text-center ${aqiClassName}`}>
          <h6>{title}</h6>
          <p className="aqiVal">{aqi}</p>
          {
            (() => {
              if (aqiText) {
                return <p className="aqiText">{aqiText}</p>
              } else {
                return null
              }
            })()
          }
          {
            (() => {
              if (lastUpdate) {
                return <p className="p-1"><small>{lastUpdate}</small></p>
              } else {
                return null
              }
            })()
          }
        </div>
      )
    }
  }
}

AirQuality.propTypes = {
  title: PropTypes.string,
  aqi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  aqiText: PropTypes.string,
  aqiData: PropTypes.any,
  lastUpdate: PropTypes.any,
};

const mapStateToProps = state => {
  return {
    outdoorWeather: state.outdoorWeather,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(AirQuality);
