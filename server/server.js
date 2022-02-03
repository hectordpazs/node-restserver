require('./config/config')
const express = require('express');
const app = express();
const { dbConnection } = require('./database/config');
require('dotenv').config();



app.use(express.json());
app.use(express.urlencoded({extended: false}))
app.use(express.static('public'));


//RUTAS
app.use('/', require('./routes/usuario'));
app.use('/auth' , require('./routes/login'))


dbConnection()

const port = process.env.PORT||'3000';

app.listen(port, '0.0.0.0', ()=>{
    console.log('Escuchando puerto: ', process.env.PORT);
})