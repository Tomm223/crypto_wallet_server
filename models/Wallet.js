const { Schema, model } = require('mongoose')
const getUnix = require('../utils')

const walletItem = new Schema({
   // userId: { type: String, required: true },
   coin: {
      coinId: { type: String, required: true },
      label: { type: String, required: true },
      symbol: { type: String, required: true },
      img: { type: String, required: true },
   },
   amount: { type: Number, required: true },
   analytics: {
      percentage: { type: Number, required: true },
      profit: { type: Number, required: true },
      sparkline: [Number],
      price: {
         currency_amount: { type: Number, required: true },
         currency_coin: { type: Number, required: true }
      },
      price_start: {
         currency_amount: { type: Number, required: true },
         currency_coin: { type: Number, required: true }
      }
   },
   date_start: { type: Number, required: true }
})
const Wallet = new Schema({
   userId: { type: String, required: true },
   last_update: { type: Number, default: getUnix(), required: true },
   total: {
      total: { type: Number, default: 0, required: true },
      percentage: { type: Number, default: 0, required: true },
      profit: { type: Number, default: 0, required: true }
   },
   list: [walletItem]
})


module.exports = model('Wallet', Wallet)
//module.exports = model('Wallet', Wallet)
