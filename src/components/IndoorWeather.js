import React, { Component } from 'react';

import { connect } from 'react-redux';

class IndoorWeather extends Component {  
  
  render() {
    
    const { Temp, Humidity, HumidityStatus, Barometer } = this.props.indoorWeather;
    
    return (
      <div className="info-card weather indoor text-center">
        <h6>室内温度</h6>
        <p><i className="wi wi-thermometer"></i> {Temp} <span>&#x2103;</span></p>
        <p><i className="wi wi-humidity"></i> {Humidity} <span>%</span></p>
        <p><i className="wi wi-barometer"></i> {Barometer} <span>hPa</span> </p>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    indoorWeather: state.indoorWeather,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(IndoorWeather);
