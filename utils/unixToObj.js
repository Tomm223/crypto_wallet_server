function unixToObj(unix) {
   const DateNow = unixToDate(unix)
   const hours = DateNow.getHours()
   const minuts = DateNow.getMinutes()
   const day = DateNow.getDate()
   let month = DateNow.getMonth()
   //пофиксить
   const year = DateNow.getFullYear()//[2] + DateNow.getFullYear()[3]
   return {
      time: { hours, minuts },
      date: { day, month, year }
   }
}

function unixToDate(unixTimestamp) {
   return new Date(
      unixTimestamp * 1000
   )
}

module.exports = unixToObj