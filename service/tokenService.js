const jwt = require('jsonwebtoken');
const { secretAccess, secretRefresh } = require('../config.js')

class TokenService {
    generateTokens(dto) {
        const accessToken = jwt.sign(dto, secretAccess, { expiresIn: '1d' })
        const refreshToken = jwt.sign(dto, secretRefresh, { expiresIn: '30d' })
        return {
            accessToken,
            refreshToken
        }
    }
    decode(token) {
        const resp = jwt.decode(token)

        return resp
    }
    validateAccessToken(token) {
        try {
            const userData = jwt.verify(token, secretAccess);
            return userData;
        } catch (e) {
            return null;
        }
    }

    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, secretRefresh);
            return userData;
        } catch (e) {
            return null
        }
    }

    /*async saveToken(userId, refreshToken) {
        const tokenData = await tokenModel.findOne({ user: userId })
        if (tokenData) {
            tokenData.refreshToken = refreshToken;
            return tokenData.save();
        }
        const token = await tokenModel.create({ user: userId, refreshToken })
        return token;
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({ refreshToken })
        return tokenData;
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({ refreshToken })
        return tokenData;
    }*/
}

module.exports = new TokenService();
