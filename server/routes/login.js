const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Usuario = require ('../models/Usuario');

const router = Router();

router.post('/login', (req, res)=>{

    const {email, password} = req.body;

    Usuario.findOne({email}, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o contraseña incorrectos'
                }
            })
        }

        const validPassword = bcrypt.compareSync(password, usuarioDB.password);

        if(!validPassword){
            return res.status(400).json({
                ok:false,
                msg: 'Usuario o contraseña incorrectos'
            })
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})

        res.json({
            ok:true,
            usuario: usuarioDB,
            token
        })

    })
})






module.exports = router