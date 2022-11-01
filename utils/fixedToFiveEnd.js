const fixedToFiveEnd = (num) => {
   if (typeof num === 'number') {
      //округляем до двух знаков после запятой
      return Math.round(num * Math.pow(10, 5)) / Math.pow(10, 5);
   }
   return num
}

module.exports = fixedToFiveEnd