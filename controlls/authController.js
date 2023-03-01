const fs = require('fs')
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const authService = require('../service/authService')
const UserDto = require('../dto/UserDto')
const tokenService = require('../service/tokenService')
const WalletService = require('../service/WalletService')
const Wallet = require('../models/Wallet')
const History = require('../models/History')
const path = require('path')

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Ошибка при регистрации', errors })
      }
      const { email, username } = req.body
      const candidateEmail = await User.findOne({ email })
      const candidateUserName = await User.findOne({ username })
      if (candidateEmail) {
        return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
      }
      if (candidateUserName) {
        return res.status(400).json({ message: 'Пользователь с таким username уже существует' })
      }
      // create model user
      const { userDto, userModel, accessToken, refreshToken } = await authService.registration(
        req.body
      )
      console.log(userModel)
      await userModel.save()
      //create models wallets and history from wallets
      console.log('1')
      const { walletModel, historyModel } = WalletService.createWalletAndHistory(userDto.id)
      console.log('2')
      await walletModel.save()
      await historyModel.save()
      console.log('3')
      res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      const wallet = await Wallet.findOne({ userId: userDto.id })
      const history = await History.findOne({ userId: userDto.id })
      res.status(200).json({ user: userDto, token: accessToken, wallet, history })
    } catch (e) {
      console.log(e)
      res.status(400).json({ message: 'Registration error' })
    }
  }

  async login(req, res) {
    try {
      console.log(req.body)
      const { email, password } = req.body
      const user = await User.findOne({ email })
      if (!user) {
        return res.status(200).json({ message: `Пользователя с email ${email} не существует ` })
      }
      const validPassword = bcrypt.compareSync(password, user.password)
      if (!validPassword) {
        return res.status(400).json({ message: `Введен неверный пароль` })
      }
      const userDto = new UserDto(user)
      const { accessToken, refreshToken } = tokenService.generateTokens({ ...userDto })
      res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      res.json({ token: accessToken, user: userDto })
    } catch (e) {
      res.status(400).json({ message: 'Login error' })
    }
  }
  async logout(req, res) {
    try {
      res.clearCookie('refreshToken')
      res.json({ message: 'Вы вышли со своей учетной записи', logout: true })
    } catch (e) {
      res.status(400).json({ message: 'Что-то пошло не так' })
    }
  }
  async Change(req, res) {
    try {
      const body = req.body
      const userData = req.user
      if (body.hasOwnProperty('password')) {
        body.password = bcrypt.hashSync(body.password, 7)
      }
      //change
      await User.updateOne({ _id: userData.id }, { $set: body })
      //
      const resp = await User.findById(userData.id)
      const dto = new UserDto(resp)
      const { accessToken, refreshToken } = tokenService.generateTokens({ ...dto })
      res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
      res.json({ token: accessToken, user: dto })
    } catch (e) {
      console.log(e)
      res.json({ message: 'данные запроса неверны' })
    }
  }
  async getUsers(req, res) {
    try {
      const users = await User.find()
      res.json(users)
    } catch (e) {
      res.status(400).json('что-то пошло не так')
    }
  }
  async refresh(req, res) {
    try {
      const { refreshToken } = req.cookies
      const userData = await authService.refresh(refreshToken)
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      })
      res.json({ user: userData.user, token: userData.accessToken })
    } catch (e) {
      res.status(400).json({ message: 'что-то пошло не так' })
    }
  }
  async getAvatar(req, res) {
    const nameFile = req.params.file
    try {
      res.status(200).sendFile(path.resolve('img', nameFile))
    } catch (e) {
      res.status(400).json({ message: 'не нашли вашего аватара' })
    }
  }
  async postAvatar(req, res) {
    try {
    } catch (e) {}
  }
}

module.exports = new authController()
