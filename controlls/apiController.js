const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { secretAccess } = require('../config');
const Wallet = require('../models/Wallet');
const History = require('../models/History');
const gotingServer = require('../got/index');
const getUnix = require('../utils');
const tokenService = require('../service/tokenService');

class apiController {
   async getUser(req, res) {
      const { id } = req.params
      try {
         const user = await User.findById(id)
         res.json(user)
      }
      catch {
         res.status(400).json({ message: "Данные запроса неверны" })
      }
   }

   async getWallet(req, res) {
      const userData = req.user
      try {
         if (userData) {
            const wallet = await Wallet.findOne({ userId: userData.id })
            res.status(200).json(wallet)
         }
         else {
            throw 'неполадки'
         }
      }
      catch (e) {
         res.status(400).json({ message: 'что-то пошло не так' })
      }
   }
   async getHistory(req, res) {
      try {
         const userData = req.user
         if (userData) {
            const history = await History.findOne({ userId: userData.id })
            res.status(200).json(history)
         }
         else {
            throw 'неполадки'
         }
      }
      catch (e) {
         res.status(400).json({ message: 'что-то пошло не так' })
      }
   }
   async getChartWallet(req, res) {
      try {
         const userData = req.user
         const { id } = req.params
         const myWalletList = await Wallet.findOne({ userId: userData.id })
         const myWallet = myWalletList.list.find((i) => i.id == id)
         const dateEnd = getUnix()
         const dateStart = myWallet.date  //1661289329
         const resp = await gotingServer.getChartPriceWallet(myWallet.coin.coinId, userData.currency.value, dateStart, dateEnd)
         res.status(200).json(resp)
      }
      catch (e) {
         console.log(e);
         res.status(400).json({ message: `при вычислении статистики кошелька произошла ошибка` })
      }
   }
   async ConvertCrypto(req, res) {
      try {
         const { currency, crypto } = req.params
         const resp = await gotingServer.convert(crypto, currency)
         res.status(200).json(resp)
      }
      catch {
         res.status(400).json({ message: 'при вычислении произошла цены ошибка' })
      }
   }
   async GetCoinList(req, res) {
      try {
         const resp = await gotingServer.getCoinsList()
         res.json(resp)
      }
      catch (e) {
         res.status(404).json({ message: 'произошла ошибка при запросе на монету' })
      }
   }
}

module.exports = new apiController()

