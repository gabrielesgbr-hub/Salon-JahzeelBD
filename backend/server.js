const express = require('express')
const colors = require('colors')
const dotenv = require('dotenv').config()
const connectMongo = require('./config/db_mongo')
const {connectPostgres} = require('./config/db_postgres')
const cors = require('cors')
const {errorHandler} = require('./middleware/errorMiddleware')

const port = process.env.PORT || 5000

connectMongo()
connectPostgres() 

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended:false}))

app.use('/api/usuarios', require('./routes/usuariosRoutes'))
app.use('/api/citas', require('./routes/citasRoutes'))
app.use('/api/productos', require('./routes/productosRoutes'))
app.use('/api/pedidos', require('./routes/pedidosRoutes'))
app.use('/api/reviews', require('./routes/reviewsRoutes')) 
app.use('/api/estilista', require('./routes/estilistaRoutes'))

app.use(errorHandler)

app.listen(port, ()=>console.log(`Servidor Iniciado en el puerto: ${port}`))