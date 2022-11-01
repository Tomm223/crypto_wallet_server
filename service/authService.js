const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const UserDto = require('../dto/UserDto.js');
const Role = require('../models/Role');
const tokenService = require('../service/tokenService')

class authService {
   async registration({ email, username, lastname, password }) {
      const hashPassword = bcrypt.hashSync(password, 7);
      const userRole = await Role.findOne({ value: "USER" })
      const userModel = new UserModel({ email, username, lastname, password: hashPassword, roles: [userRole.value] })
      const userDto = new UserDto(userModel)
      const { accessToken, refreshToken } = tokenService.generateTokens({ ...userDto })
      return {
         userModel, userDto,
         accessToken, refreshToken
      }
   }
   async createNewUser({ email, name, lastname, password }) {
      try {
         const hashPassword = bcrypt.hashSync(password, 7);
         const userRole = await Role.findOne({ value: "USER" })
         const user = await UserModel.create({ email, name, lastname, password: hashPassword, role: userRole })
         return user
      }
      catch (e) {
         console.log(e);
      }
   }
   async refresh(refreshToken) {
      if (!refreshToken) {
         throw 'пользователь не авторизован'
      }
      const userData = tokenService.validateRefreshToken(refreshToken);

      if (!userData) {
         throw 'пользователь не авторизован'
      }
      const user = await UserModel.findById(userData.id);
      const userDto = new UserDto(user);
      const tokens = tokenService.generateTokens({ ...userDto });

      return { ...tokens, user: userDto }
   }
}


module.exports = new authService()