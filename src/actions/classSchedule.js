import 'moment/locale/zh-cn';

import * as moment from 'moment';

export const classSchedule = [
  ['政治', '英语', '物理', '体育', '语文', '数学', '历史', '化学'],    // Mon
  ['语文', '语文', '物理', '音乐', '历史', '数学', '政治', '英语'],    // Tue
  ['语文', '化学', '数学', '数学', '英语', '美术', '物理', '体育'],    // Wed
  ['数学', '政治', '体育', '历史', '化学', '物理', '语文', '英语'],    // Thu
  ['英语', '化学', '数学', '语文', '班会', '体育', '自习', '自习']     // Fri
]

export const GET_CLASS_SCHEDULE = 'GET_CLASS_SCHEDULE';

export const getClassSchedule = () => {
  return (dispatch, getState) => {

    moment.locale('zh-cn');
    const now = moment();
    const day = now.day(); // 0-6, sunday is 0
    const hour = now.hour();

    let schedule, key;

    if (day === 0 || day === 6 || (day === 5 && hour >= 12)) { // 周末
      const nextMonday = now.add(1, 'weeks').startOf('isoWeek').format('YYYY/MM/DD')
      schedule = classSchedule[0];
      key = `下周一 (${nextMonday})`;
    } else {
      if (hour >= 12) { // 明日
        const tomorrow = now.add(1, 'd').format('YYYY/MM/DD')
        schedule = classSchedule[day];
        key = `明日 (${tomorrow})`;
      } else {  // 今日
        schedule = classSchedule[day - 1];
        const today = now.format('YYYY/MM/DD')
        key = `今日 (${today})`;
      }
    }

    dispatch({
      type: GET_CLASS_SCHEDULE,
      payload: {
        schedule,
        key,
      }
    })
  }
}
