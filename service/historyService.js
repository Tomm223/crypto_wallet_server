const History = require("../models/History")

class historyService {

   async addHistory(data) {
      try {
         const body = this.buildHistory(data)
      }
      catch (e) {

      }
   }

   async saveHistory(id, body) {
      try {
         await History.findOneAndUpdate({ userId: id },
            {
               $push:
               {
                  'list': {
                     $each: [body],
                     $position: 0
                  }
               }
            })
      }
      catch (e) {
         res.status(400).json({ message: 'При сохранении истории произошла ошибка' })
      }
   }
   async addHistoryChangeWallet(data) {
      try {
         const body = this.buildHistory(data)
         await History.findOneAndUpdate({ userId: data.userId }, {
            $push:
            {
               'list': {
                  $each: [body],
                  $position: 0
               }
            }
         })
      }
      catch (e) {
         res.status(400).json({ message: 'При сохранении истории произошла ошибка' })
      }
   }

   buildHistory(data) {
      return {
         status: data.status,
         type: data.status ? 'deposit' : 'withdraw',
         coin: {
            symbol: data.coin.symbol,
            coinId: data.coin.coinId,
            label: data.coin.label,
         },
         date: data.date,
         amount: data.diffNum
      }
   }

}

module.exports = new historyService()