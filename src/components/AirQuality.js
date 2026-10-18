import React, { Component } from 'react';
import { getAqiClassName, getChinaAqiClassName } from '../helper'

import PropTypes from 'prop-types';
import { connect } from 'react-redux';

const isUnavailableValue = (value) => {
  const token = String(value || '').trim().split(/\s+/)[0];
  return token === '' || !Number.isFinite(Number(token));
};

class AirQuality extends Component {

  render() {
    const { title, aqi, aqiText, aqiData, lastUpdate, isStale } = this.props;

    if (aqiData) { // outdoor
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
      const offline = isUnavailableValue(aqi);
      return (
        <div className={`info-card aqi text-center ${aqiClassName}`}>
          <h6>{title}</h6>
          <p className={`aqiVal ${offline ? 'aqiVal-offline' : ''}`}>{offline ? '—' : aqi}</p>
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
              if (isStale) {
                return (
                  <p className="p-1 aqi-stale">
                    <small>离线{lastUpdate ? ` · 上次更新 ${lastUpdate}` : ' · 暂无数据'}</small>
                  </p>
                )
              } else if (lastUpdate) {
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
  isStale: PropTypes.bool,
};

const mapStateToProps = state => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(AirQuality);
