const Wallet = require("../models/Wallet")
const WalletService = require("../service/WalletService")
const historyService = require("../service/historyService")
const getUnix = require("../utils")


class walletController {
   async addNewWallet(req, res) {
      try {
         const userData = req.user
         const body = req.body
         if (userData) {
            const wallet = await WalletService.buildWallet({
               currency: userData.currency.value,
               amount: body.amount,
               coin: body.coin,
               //userId: body.userId
            })
            await Wallet.findOneAndUpdate({ userId: userData.id }, { $push: { 'list': wallet } })
            await WalletService.updateTotal(userData.id)
            await historyService.saveHistory(userData.id, req.history)
            const mywallet = await Wallet.findOne({ userId: userData.id })
            res.status(200).json(mywallet)
         }
         else {
            return res.status(403).json({ message: 'не авторизован' })
         }
      }
      catch (e) {
         res.status(400).json({ message: 'что-то пошло не так' })
      }
   }
   async deposit(req, res) {
      const userData = req.user
      const walletId = req.params.id
      const diffNum = parseFloat(req.params.difference) // 
      try {
         const myWallet = await Wallet.findOne({ userId: userData.id })
         const newWallet = await WalletService.depositWithDraw(userData.currency.value, true, myWallet, diffNum, walletId)
         console.log('new', newWallet);
         await newWallet.save()
         await historyService.saveHistory(userData.id, req.history)
         const resWallet = await Wallet.findOne({ userId: userData.id })
         res.status(200).json(resWallet)
      }
      catch (e) {
         console.log(e);
         res.status(400).json({ message: 'что-то пошло не так' })
      }
   }
   async withdraw(req, res) {
      const userData = req.user
      const walletId = req.params.id
      const diffNum = parseFloat(req.params.difference) // разница
      try {
         const myWallet = await Wallet.findOne({ userId: userData.id })
         const newWallet = await WalletService.depositWithDraw(userData.currency.value, false, myWallet, diffNum, walletId)
         await newWallet.save()
         await historyService.saveHistory(userData.id, req.history)
         const resWallet = await Wallet.findOne({ userId: userData.id })
         res.status(200).json(resWallet)
      }
      catch (e) {
         res.status(400).json({ message: 'что-то пошло не так' })
      }
   }

   async removeWallet(req, res) {
      try {
         const userData = req.user
         const id = req.params.id
         if (userData) {
            await Wallet.findOneAndUpdate({ userId: userData.id }, { $pull: { 'list': { _id: id } } })
            const newWallet = await Wallet.findOne({ userId: userData.id })
            await WalletService.updateTotal(userData.id)
            await historyService.saveHistory(userData.id, req.history)
            const myWallet = await Wallet.findOne({ userId: userData.id })
            res.status(200).json(myWallet)
         }
         else {
            return res.status(403).json({ message: 'не авторизован' })
         }
      }
      catch (e) {
         res.status(400).json({ message: 'что-то пошло не так' })
      }
   }

   async walletListAnalytics(req, res) {
      try {
         const list = req.body
         const userData = req.user

         const total_wallet = {
            total: 0,
            percentage: 0,
            profit: 0
         }
         let startMoney = 0
         let newList = []
         const go = (i = 0) => {
            if (i < list.length) {
               WalletService.walletAnalytics(list[i], userData.currency.value).then(({ wallet, amountCurrency }) => {
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
               res.json({ list: newList, totalWallet: total_wallet })
            }
         }
         go()


      }
      catch (e) {
         console.log(e);
         res.status(400).json({ message: 'при подсчета аналитики произошла ошибка' })
      }
   }
}

module.exports = new walletController()


