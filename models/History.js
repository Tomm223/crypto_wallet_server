const { Schema, model } = require('mongoose')

const historyItem = new Schema({
   statusWord: { type: String, required: true, default: 'done' },
   type: { type: String, required: true },
   status: { type: Boolean, required: true },
   coin: {
      coinId: { type: String, required: true },
      label: { type: String, required: true },
      symbol: { type: String, required: true },
   },
   amount: { type: Number, required: true },
   date: { type: Number, required: true }
})

const History = new Schema({
   userId: { type: String, required: true },
   list: [historyItem]
})

module.exports = model('History', History)
//module.exports = model('History', History)
