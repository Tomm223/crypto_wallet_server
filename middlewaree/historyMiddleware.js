const historyService = require('../service/historyService');
const getUnix = require('../utils');

module.exports = function (req, res, next) {
   try {
      const user = req.user
      const wallet = req.body
      // для deposit + withdraw  diffNum === true
      // delete addNewWallet diffNum !== true
      // доделали history build
      const status =
         req.route.path === '/wallet/:id/deposit/:difference' ? true :
            req.route.path === '/wallet' && req.route.methods.post ? true : false
      let diffNum = req.path === '/wallet' || req.route.path === '/wallet/:id/delete' ?
         wallet.amount : parseFloat(req.params.difference)

      if (!status) diffNum = -diffNum

      //установили новое время отсчета 
      wallet.date = getUnix()

      //build history
      const buildHistory = historyService.buildHistory({ ...wallet, status, diffNum })
      req.history = buildHistory

      next()
   } catch (e) {
      return res.status(400).json({ message: "в запросе ошибка" })
   }
};


