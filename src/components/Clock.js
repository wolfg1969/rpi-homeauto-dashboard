import React, { Component } from 'react';
import { connect } from 'react-redux';

class Clock extends Component {
  
  render() {
    const { clock } = this.props;
    return (
      <div className="info-card clock">
        <p className="date">{ clock.currentDate }</p>
        <p className="time">{ clock.currentTime }</p>
        <p className="lunar-date">{ clock.lunar }</p>
      </div>
    )
  }
  
}

const mapStateToProps = state => {
  return {
    clock: state.clock,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(Clock);
