const {Router} = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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

//CONFIGURACIONES DE GOOGLE

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return{
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
  }

router.post('/google' , async (req, res)=>{
    let token = req.body.idtoken
    
    let googleUser = await verify(token)
    .catch(e=>{
        return res.status(403).json({
            ok:false,
            err: e
        })
    })

    Usuario.findOne({email: googleUser.email}, (err, usuarioDB)=>{
        if(err){
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(usuarioDB){
            if(!usuarioDB.google){
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'DEBE USAR SU AUTENTICACION NORMAL'
                    }
                });
            }else{
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})
                
                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                })
            }
        }else{

            let usuario = new Usuario();
            usuario.name = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';


            usuario.save((err, usuarioDB)=>{
                if(err){
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }

                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, {expiresIn: process.env.CADUCIDAD_TOKEN})
                
                return res.json({
                    ok:true,
                    usuario: usuarioDB,
                    token
                })
            })
        }
    })

    /*res.json({
        usuario: googleUser
    })*/
})








module.exports = router