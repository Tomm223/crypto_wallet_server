const unixToMyDateObj = require("./unixToMyDateObj")

const buildChartData = (list) => {
   return list.map(([unix, price]) => {
      const { time, date } = unixToMyDateObj(unix)
      return {
         name: `${time} ${date}`,
         uv: price,
      }
   })
}

module.exports = buildChartData