const got = require('../got/index')
const Market = require('../models/Market')
const getUnix = require('../utils')
const unixToObj = require('../utils/unixToObj')
class socketService {

   time_interval_ms = 300000
   time_interval_s = 300

   async updateData() {
      const resp1 = await got.getMarketCoins({ page: 1, limit: 250, currency: 'usd' })
      const resp2 = await got.getMarketCoins({ page: 2, limit: 250, currency: 'usd' })
      const resp3 = await got.getMarketCoins({ page: 3, limit: 250, currency: 'usd' })
      const resp4 = await got.getMarketCoins({ page: 4, limit: 250, currency: 'usd' })
      const resp5 = await got.getMarketCoins({ page: 5, limit: 250, currency: 'usd' })
      const resp6 = await got.getMarketCoins({ page: 6, limit: 250, currency: 'usd' })
      //const resp7 = await got.getMarketCoins({ page: 7, limit: 250, currency: 'usd' })
      //const resp8 = await got.getMarketCoins({ page: 8, limit: 250, currency: 'usd' })
      //const resp9 = await got.getMarketCoins({ page: 9, limit: 250, currency: 'usd' })
      //const resp10 = await got.getMarketCoins({ page: 10, limit: 250, currency: 'usd' })
      // получили монеты
      const newDate = getUnix()
      // save
      await this.saveMarket('global', newDate, [...resp1, ...resp2, ...resp3, ...resp4, ...resp5, ...resp6])
      const newMarket = await Market.findOne({ name: 'global' })
      console.log(newMarket.list.length, newMarket.name, newMarket.last_update);
      return {
         list: newMarket.list,
         last_update: newMarket.last_update
      }
   }
   async saveMarket(name, last_update, list) {
      try {
         await Market.updateOne({ name: name }, {
            $set: {
               last_update,
               list
            }
         })
      }
      catch (e) {
         console.log('При сохранении нового маркета произошла ошибка', e);
      }
   }
   validateLastUpdate(validatorUNIX, verifiableUNIX) {
      let isValid = validatorUNIX - this.time_interval_s >= verifiableUNIX ? false : true

      return isValid
   }
}

module.exports = new socketService()