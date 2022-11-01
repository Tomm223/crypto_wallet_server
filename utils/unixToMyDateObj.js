const unixToObj = require('./unixToObj')

function unixToMyDateObj(unix) {
   const { date, time } = unixToObj(unix)
   const { day, month, year } = date
   const { hours, minuts } = time

   const myhours = isZero(hours)
   const myminuts = isZero(minuts)
   const myday = isZero(day)
   let mymonth = isZero(month)
   return {
      time: `${myhours}:${myminuts}`,
      date: `${myday}.${mymonth}.${year}`
   }
}

function isZero(num) {
   if (num < 10) {
      return `0${num}`
   }
   return num
}


module.exports = unixToMyDateObj