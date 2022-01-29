require('./config/config')
const express = require('express')
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.get('/usuario', function (req, res) {
  res.json('GET usuario')
})

app.post('/usuario', function (req, res) {

    if (req.body.nombre === undefined){
        return res.status(400).json({
            ok: false,
            body: 'No existe el nombre'
        })
    }

    res.status(201).json({
        ok: true,
        persona: req.body
    })
})

app.put('/usuario/:id', function (req, res) {
    let id = req.params.id;

    res.json({
        id,
    })
})

app.delete('/usuario', function (req, res) {
    res.json('DELETE usuario')
})

app.listen(process.env.PORT, ()=>{
    console.log('Escuchando puerto: ', process.env.PORT);
})