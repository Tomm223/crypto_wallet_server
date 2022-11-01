const { Schema, model } = require('mongoose')

const Coin = new Schema({
   id: { type: String, require: true },
   symbol: { type: String, require: true },
   name: { type: String, require: true },
   image: { type: String, require: true },
   current_price: { type: Number, require: true },
   market_cap: { type: Number, require: true },
   market_cap_rank: { type: Number, require: true },
   fully_diluted_valuation: { type: Number, require: true },
   total_volume: { type: Number, require: true },
   high_24h: { type: Number, require: true },
   low_24h: { type: Number, require: true },
   price_change_24h: { type: Number, require: true },
   price_change_percentage_24h: { type: Number, require: true },
   market_cap_change_24h: { type: Number, require: true },
   market_cap_change_percentage_24h: { type: Number, require: true },
   circulating_supply: { type: Number, require: true },
   total_supply: { type: Number, require: true },
   max_supply: { type: Number, require: true },
   ath: { type: Number, require: true },
   ath_change_percentage: { type: Number, require: true },
   ath_date: { type: Date, require: true },
   atl: { type: Number, require: true },
   atl_change_percentage: { type: Number, require: true },
   atl_date: { type: Date, require: true },
   roi: { require: false },
   last_updated: { type: Date, require: true },
   sparkline_in_7d: {
      price: [Number]
   },
   price_change_percentage_1h_in_currency: { type: Number, require: true },
   price_change_percentage_24h_in_currency: { type: Number, require: true },
   price_change_percentage_7d_in_currency: { type: Number, require: true },
}

)

const Market = new Schema({
   name: { type: String, default: 'global' },
   last_update: { type: Number, required: true },
   list: [Coin]
})


module.exports = model('Market', Market)



