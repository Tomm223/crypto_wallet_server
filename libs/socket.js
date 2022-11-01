const tokenService = require('../service/tokenService');
const WalletService = require('../service/WalletService');
const gotingServer = require('../got/index')
const GlobalMarketData = require('../data/market')
const Floor = require('../utils/floor')
const fixedToFiveEnd = require('../utils/fixedToFiveEnd')
const toUnix = require('../utils/toUnix')
const buildChartData = require('../utils/buildChartData');
const Wallet = require('../models/Wallet');
const socketService = require('../service/socketService');
const getUnix = require('../utils');
const walletController = require('../controlls/walletController');


const SocketLogic = (server) => {
   const io = require('socket.io')(server, {
      cors: {
         origin: "*",
         methods: ["PUT", "GET", "POST", "DELETE", "OPTIONS"],
         allowedHeaders: ["secretHeader"],
         credentials: true
      }
   })
   const toLoading = (io_client) => io_client.emit('update_pending')
   const toUnLoading = (io_client) => io_client.emit('update_fullfield')
   const updateWallet = async (client, userData, wallet) => {
      try {
         if (!wallet) {
            wallet = await WalletService.getWallet(userData)
         }
         //analytics
         if (!wallet.list.length) return
         toLoading(client)
         const newList = []
         const list = wallet.list
         let total_wallet = null
         const go = async (i = 0) => {
            if (i < list.length) {
               await WalletService.walletAnalytics(list[i])
                  .then((analytics) => {
                     list[i].analytics = { ...analytics }
                     newList.push(list[i])
                     go(i + 1)
                  })
            }
            else {
               total_wallet = WalletService.calcTotal(newList)
               await WalletService.UpdateWallet(userData.id, newList, total_wallet, GlobalMarketData.last_update)
               await getWallet(client, userData.id)
               toUnLoading(client)
            }
         }
         go()
      }
      catch (e) {
         console.log('error_update_wallet');
      }
   }
   const getWallet = async (client, userId) => {
      const wallet = await WalletService.getWallet(userId)
      client.emit('wallet', wallet)
      return wallet
   }

   io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      const user = tokenService.validateAccessToken(token)
      if (user) {
         socket.userData = user
      }
      if (token && !user) {
         socket.reToken = true
      }
      next();
   })
   io.on('connection', (client) => {
      // идет ответ на то чтобы клиент мог запрашивать 
      const userData = client.userData
      if (userData) {
         setTimeout(() => client.emit('authorization_true'), 500)
      }
      if (!userData) {
         setTimeout(() => client.emit('authorization_false'), 500)
      }
      const reToken = client?.reToken
      if (reToken) {
         client.emit('auth', { status: 403 })
      }

      client.on('wallet', async (socket) => {
         try {
            if (!userData) throw ''

            const wallet = await getWallet(client, userData.id)

            if (!wallet.list.length) return
            // проверка на  update
            const isValidData = socketService.validateLastUpdate(GlobalMarketData.last_update, wallet.last_update)

            if (!isValidData) {
               await updateWallet(client, userData, wallet)
            }

         }
         catch {

         }
      })
      client.on('wallet_update', async () => {
         try {
            if (!userData) {
               console.log('err');
               throw ''
            }
            await updateWallet(client, userData)
         }
         catch (e) {

         }

      })

      // markets 
      client.on('dashboard_market', async ({ page, limit, currency }) => {
         try {
            const resp = GlobalMarketData.getMarketList(page, limit)
            client.emit('dashboard_market', resp)
         }
         catch (e) {
            client.emit('error', e)
         }

      })
      client.on('market', async ({ page, limit, currency }) => {
         const resp = GlobalMarketData.getMarketList(page, limit)
         const total_page = GlobalMarketData.getTotalPages(limit)
         io.emit('market', { list: resp, total_page })
      })
      //chart
      client.on('dashboard_chart', async (body) => {
         try {
            const { date, order, coinId, currency } = body
            const { start, end } = date
            const resp = await gotingServer.getChartPriceWallet(coinId, currency, start, end)
            let needResp = resp.filter((elem, index) => index % order === 0 ? true : false)
            needResp.push(resp[resp.length - 1])
            needResp = needResp.map((elem) => {
               const price = elem[1] > 1 ? Floor(elem[1]) : fixedToFiveEnd(elem[1])
               return [toUnix(elem[0]), price]
            })
            needResp = buildChartData(needResp)
            client.emit('dashboard_chart', needResp)
         }
         catch (e) {
            console.log(e);
            client.emit('error', { message: 'при получении графика произошла ошибка' })
         }

      })
      //
      client.on('disconnect', () => {
         console.log('end');
      })
      //
      client.on('convert', async ({ crypto, currency }) => {
         const { target } = await gotingServer.convert(crypto, currency)
         io.emit('convert', target)
      })
   });

   return io
}

module.exports = SocketLogic
