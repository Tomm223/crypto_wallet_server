const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth.js')
const PORT = process.env.PORT || 5000
const apiRouter = require('./routes/api.js')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const app = express()
const http = require('http')
const socketService = require('./service/socketService.js')
const getUnix = require('./utils/index.js')
const Market = require('./models/Market.js')
const GlobalMarketData = require('./data/market.js')

const server = http.createServer(app)
// socket
const io = require('./libs/socket')(server)
//
mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)
mongoose.set('useUnifiedTopology', true)
app.use(
  cors({
    credentials: true,
    origin: 'https://crypto-wallet-app.vercel.app/', //true //"http://localhost:3000",
  })
)
app.use(cookieParser())
app.use(express.json())
app.use('/auth', authRouter)
app.use('/api', apiRouter)

//socket logic
async function updateServerData() {
  const { list, last_update } = await socketService.updateData()
  GlobalMarketData.update(list, last_update) // кладем данные
  io.emit('update_data')
}

const start = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://daniil:daniil@cluster0.06smrvn.mongodb.net/?retryWrites=true&w=majority`
    )
    server.listen(PORT, async () => {
      console.log(`server started on port ${PORT}`)
      // забираем из монго данные для пользования
      const { last_update, list } = await Market.findOne({ name: 'global' })
      GlobalMarketData.update(list, last_update) // кладем данные
      //проверка на валидност данных
      //если с монго придут данные старее чем время сейчас больше чем на 5 мин то updateserver()
      const isValid = socketService.validateLastUpdate(getUnix(), last_update)
      if (!isValid) {
        updateServerData()
      }
      //обновление сервер данных
      setTimeout(updateServerData, socketService.time_interval_ms)
    })
  } catch (e) {
    console.log(e)
  }
}

start()

/*
 Построение на стеке Heroku-22
-----> Определение того, какой пакет сборки использовать для этого приложения
-----> Обнаружено приложение Node.js
       
-----> Создание среды выполнения
       
       NPM_CONFIG_LOGLEVEL=ошибка
       NODE_VERBOSE=ложь
       NODE_ENV=производство
       NODE_MODULES_CACHE=истина
       
-----> Установка бинарников
       engine.node (package.json): не указано
       Engines.npm (package.json): не указано (используйте по умолчанию)
       
       Разрешение узла версии 18.x...
       Загрузка и установка узла 18.12.0...
       Использование версии npm по умолчанию: 8.19.2
       
-----> Установка зависимостей
       Установка узловых модулей
       
       added 260 packages, and audited 261 packages in 4s
       
       20 packages are looking for funding
         run `npm fund` for details
       
       14 vulnerabilities (7 moderate, 4 high, 3 critical)
       
       To address all issues, run:
         npm audit fix
       
       Run `npm audit` for details.
       
-----> Build
       
-----> Caching build
       - npm cache
       
-----> Pruning devDependencies
       
       up to date, audited 261 packages in 2s
       
       20 packages are looking for funding
         run `npm fund` for details
       
       14 vulnerabilities (7 moderate, 4 high, 3 critical)
       
       To address all issues, run:
         npm audit fix
       
       Run `npm audit` for details.
       
-----> Build succeeded!
-----> Discovering process types
       Procfile declares types     -> (none)
       Default types for buildpack -> web
-----> Compressing...
       Done: 45.3M
*/
