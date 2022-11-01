
class GlobalMarketData {

   list = []
   last_update = 0
   constructor() {
      this.list = this.list
      this.last_update = this.last_update
   }
   update(list, last_update) {
      this.list = list
      this.last_update = last_update
   }
   getMarketList(page, limit) {
      const start = limit * (page - 1)
      const end = limit * page
      const target = [...this.list.slice(start, end)]
      return target
   }
   getTotalPages(limit) {
      const total = Math.ceil((this.list.length + 1) / limit)
      return total
   }
   getCoinById(id) {
      return this.list.find(elem => elem.id === id)
   }
   getSparkLineById(id) {
      const elem = this.getCoinById(id)
      const sparkline = elem.sparkline_in_7d.price.slice(2, 169) // округляем до 1час = 1elem , summ = 7day
      return sparkline
   }

}

module.exports = new GlobalMarketData()