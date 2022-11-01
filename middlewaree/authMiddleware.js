const jwt = require('jsonwebtoken')
const { secretAccess } = require('../config')

module.exports = function (req, res, next) {
    if (req.method === "OPTIONS") {
        next()
    }
    try {
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            res.status(403).json({ message: "Пользователь не авторизован нет токена" })
        }
        const decodedData = jwt.verify(token, secretAccess)
        req.user = decodedData
        next()
    } catch (e) {
        return res.status(403).json({ message: "Пользователь не авторизован, истекло время токена" })
    }
};
