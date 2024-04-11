import React, { Component } from 'react';
import { connect } from 'react-redux';

class ClassSchedule extends Component {
  
  render() {
    const { schedule, key } = this.props.classSchedule;
    return (
      <div className="info-card class-schedule">
        <h6>课程表 {key}</h6>
        <div>
        {
          (() => {
            if (!schedule) {
              return null
            }
            return schedule.map((item, index) => {
              return (
                <span className="chip text-large text-bold" key={index}>
                  <figure className="avatar avatar-sm" data-initial={index+1}></figure>
                  {item}
                </span>
              )
            })
          })()
        }
        </div>
      </div>
    )
  }
  
}

const mapStateToProps = state => {
  return {
    classSchedule: state.classSchedule,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {}
};

export default connect(mapStateToProps, mapDispatchToProps)(ClassSchedule);
