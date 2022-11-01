const Router = require('express')
const router = new Router()
const apiController = require('../controlls/apiController')
const walletController = require('../controlls/walletController')
const authMiddleware = require('../middlewaree/authMiddleware')
const historyMiddleware = require('../middlewaree/historyMiddleware')

router.get('/user/:id', authMiddleware, apiController.getUser)
router.get('/wallet', authMiddleware, apiController.getWallet)
router.get('/wallet/:id/chart', authMiddleware, apiController.getChartWallet)
router.post('/wallet/analytics', authMiddleware, walletController.walletListAnalytics)
router.post('/wallet', authMiddleware, historyMiddleware, walletController.addNewWallet)
router.put('/wallet/:id/deposit/:difference', authMiddleware, historyMiddleware, walletController.deposit)
router.put('/wallet/:id/withdraw/:difference', authMiddleware, historyMiddleware, walletController.withdraw)
router.post('/wallet/:id/delete', authMiddleware, historyMiddleware, walletController.removeWallet)
router.get('/history', authMiddleware, apiController.getHistory)
router.get('/convert/:crypto/:currency', apiController.ConvertCrypto)
router.get('/coins/list', apiController.GetCoinList)

module.exports = router



