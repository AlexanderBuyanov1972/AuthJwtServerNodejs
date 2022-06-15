require('dotenv').config()
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddlewares = require('./middlewares/error-middleware')


const PORT = process.env.PORT || 5000

const app = express();

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: process.env.API_URL_CLIENT
}))
app.use('/', router)
app.use(errorMiddlewares)

const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(5000, () => console.log(`Server started on port = ${PORT}.`))
    } catch (error) {
        console.log(error)
    }
}

start()