require('./config/config');
require('dotenv').config();
const express = require('express');
const app = express();
const { dbConnection } = require('./database/config');


//MIDDLEWARES GLOBALES:
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static('public'));


//RUTAS
app.use('/', require('./routes/usuario'));
app.use('/auth' , require('./routes/login'));
app.use('/' , require('./routes/categoria'));
app.use('/', require('./routes/producto'));

//CONEXION A LA BASE DE DATOS:
dbConnection();

const port = process.env.PORT||'3000';

//ESCUCHAR PETICIONES:
app.listen(port, '0.0.0.0', ()=>{
    console.log('Escuchando puerto: ', process.env.PORT);
})