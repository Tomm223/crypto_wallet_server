const express = require('express')
const mongoose = require('mongoose')
const authRouter = require('./routes/auth.js')
const PORT = process.env.PORT || 5000
const apiRouter = require('./routes/api.js')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authMiddleware = require('./middlewaree/authMiddleware.js')
const app = express()
const http = require('http')
const socketService = require('./service/socketService.js')
const getUnix = require('./utils/index.js')
const Market = require('./models/Market.js')
const GlobalMarketData = require('./data/market.js')
const Wallet = require('./models/Wallet.js')
const User = require('./models/User.js')
const History = require('./models/History.js')
const server = http.createServer(app)
// socket
const io = require('./libs/socket')(server);
//
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
app.use(cors({
    credentials: true,
    origin: "http://localhost:3000"
}));
app.use(cookieParser());
app.use(express.json())
app.use("/auth", authRouter)
app.use("/api", apiRouter)

//socket logic
async function updateServerData() {
    const { list, last_update } = await socketService.updateData()
    GlobalMarketData.update(list, last_update) // кладем данные
    io.emit('update_data')
}

const start = async () => {
    try {
        await mongoose.connect(`mongodb+srv://daniil:daniil@cluster0.06smrvn.mongodb.net/?retryWrites=true&w=majority`)
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





