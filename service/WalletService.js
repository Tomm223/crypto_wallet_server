const History = require('../models/History')
const Wallet = require('../models/Wallet')
const getUnix = require('../utils')
const gotingServer = require("../got/index")
const GlobalMarketData = require('../data/market')
const unixToObj = require('../utils/unixToObj')
const socketService = require('./socketService')

class WalletService {
   async UpdateWallet(userId, list, total, last_update) {
      await Wallet.findOneAndUpdate({ userId }, {
         $set: {
            list,
            total,
            last_update,
         }
      })
   }
   async updateTotal(userId) {
      const newWallet = await Wallet.findOne({ userId })
      await Wallet.findOneAndUpdate({ userId }, { $set: { total: this.calcTotal(newWallet.list) } })
   }
   calcTotal(list) {
      let startMoney = 0
      let endMoney = 0
      let percentage = 0
      let profit = 0
      let total = 0
      if (list.length) {
         list.forEach(wallet => {
            startMoney += wallet.analytics.price_start.currency_amount
            endMoney += wallet.analytics.price.currency_amount
         });
         profit = endMoney - startMoney
         percentage = endMoney / startMoney * 100 - 100
         total = endMoney
      }
      return {
         percentage,
         profit,
         total
      }
   }
   async buildWallet({ currency, wallet_id = null, userId, coin, amount }) {
      const { current_price } = await GlobalMarketData.getCoinById(coin.coinId)
      const longSparkline = Array(50).fill(current_price)
      const build = {
         //userId,
         coin,
         amount,
         date_start: getUnix(),
         analytics: {
            profit: 0,
            percentage: 0,
            sparkline: longSparkline,
            price: {
               currency_amount: current_price * amount,
               currency_coin: current_price,
            },
            price_start: {
               currency_amount: current_price * amount,
               currency_coin: current_price,
            }
         }
      }
      if (wallet_id) {
         build._id = wallet_id
      }
      return build
   }

   async getWallet(userId) {
      try {
         const wallet = await Wallet.findOne({ userId })

         return wallet
      }
      catch (e) {
         return { message: 'что-то пошло не так' }
      }
   }
   async walletListAnalytics(list, userData) {
      try {
         const total_wallet = {
            total: 0,
            percentage: 0,
            profit: 0
         }
         let startMoney = 0
         let newList = []
         const go = (i = 0) => {
            if (i < list.length) {
               this.walletAnalytics(list[i], userData.currency.value).then(({ wallet, amountCurrency }) => {
                  newList.push(wallet)
                  total_wallet.total += amountCurrency.end
                  startMoney += amountCurrency.start
                  console.log(i);
                  setTimeout(() => go(i + 1), 2000)
               })
            }
            else {
               total_wallet.profit = total_wallet.total - startMoney
               total_wallet.percentage = total_wallet.total / startMoney * 100 - 100
               return { list: newList, totalWallet: total_wallet }
            }
         }
      }
      catch (e) {
         console.log(e);
         return { message: 'при подсчета аналитики произошла ошибка' }
      }
   }
   async depositWithDraw(currency, isDeposit, wallet, diffNum, walletId) {
      let myElem = wallet.list.find(item => item.id == walletId)
      if (isDeposit) {
         myElem.amount += diffNum
      }
      else {
         myElem.amount -= diffNum
      }
      const newWallet = await this.buildWallet({
         currency, ...myElem._doc
      })
      console.log(newWallet);
      wallet.list = wallet.list.map((item) => {
         if (item.id !== walletId) return item
         return newWallet
      })
      wallet.total = this.calcTotal(wallet.list)
      return wallet
   }
   createWalletAndHistory(userId) {
      const walletModel = new Wallet({ userId: userId })
      const historyModel = new History({ userId: userId })
      return {
         walletModel,
         historyModel
      }
   }
   dateDifferenceInHours(larger, smaller) {
      const isValid = socketService.validateLastUpdate(larger, smaller)
      if (isValid) return null // проверка на валидность разности дат 
      const large = unixToObj(larger)
      const small = unixToObj(smaller)
      const { day, month, year } = large.date
      const { hours, minuts } = large.time
      const { day: day_small, month: month_small, year: year_small } = small.date
      const { hours: hours_small } = small.time

      const summHours_larger = hours + day * 24 + month * 24 * 30 + year * 24 * 30 * 12
      const summHours_smaller = hours_small + day_small * 24 + month_small * 24 * 30 + year_small * 24 * 30 * 12

      const diffLS = summHours_larger - summHours_smaller
      if (diffLS > 0) {
         return diffLS
      }
      else {
         return null // smaller больше larger не валидно
      }
   }
   async walletAnalytics(wallet) {
      const { coin: { coinId }, date_start, analytics, amount } = wallet
      const { price_start: { currency_amount, currency_coin } } = analytics
      let sparkline = await GlobalMarketData.getSparkLineById(coinId)
      const lastPrice_sparkline = sparkline[sparkline.length - 1]
      const Coin = await GlobalMarketData.getCoinById(coinId)
      const diffHours = this.dateDifferenceInHours(GlobalMarketData.last_update, date_start)
      console.log(lastPrice_sparkline);


      const mySparkLine = diffHours >= sparkline.length ? sparkline : diffHours > 2 ? sparkline.slice(-diffHours) : sparkline.fill(lastPrice_sparkline)
      const myCoin_Currency = Coin.current_price
      const lastAmountCurr = myCoin_Currency * amount
      const profit = lastAmountCurr - currency_amount
      const percentage = lastAmountCurr / currency_amount * 100 - 100

      return {
         sparkline: mySparkLine,
         profit,
         percentage,
         price_start: { currency_amount, currency_coin },
         price: {
            currency_amount: lastAmountCurr,
            currency_coin: myCoin_Currency
         }
      }
   };

}

module.exports = new WalletService()