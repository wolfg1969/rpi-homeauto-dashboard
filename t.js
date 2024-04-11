var moment = require('moment')
// import 'moment/locale/zh-cn';

var chineseLunar = require("chinese-lunar");
//var lunar = chineseLunar.solarToLunar(new Date(2017,9,2, 0,0,0), 'MD')

//moment.locale('zh-cn');
const now = moment();

var lunar = chineseLunar.solarToLunar(now.startOf('day').toDate(), 'TMD')

console.log(lunar)
