import * as moment from 'moment';
import 'moment/locale/zh-cn';
import * as chineseLunar from 'chinese-lunar';

export const CLOCK_TICK = 'CLOCK_TICK';

export const tick = () => {
  return dispatch => {
    
    moment.locale('zh-cn');
    const now = moment();
    const lunar = chineseLunar.solarToLunar(moment(now).startOf('day').toDate(), 'TMD') // remove time to compute lunar correctly.
    
    dispatch({ 
      type: CLOCK_TICK,
      payload: {
        currentDate: now.format('LL dddd'),
        currentTime: now.format('HH:mm:ss'),
        lunar: `农历${lunar}`,
      }
    })
  }
};