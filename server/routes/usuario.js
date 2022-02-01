const {Router} = require('express');
const Usuario = require ('../models/Usuario');
const bcrypt = require('bcryptjs');
const _ = require('underscore');

const router = Router();


router.get('/usuario', function (req, res) {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({estado:true}, 'name email role estado google img')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        Usuario.count({estado:true}, (err, conteo)=>{
            res.json({
                ok:true,
                usuarios,
                cuantos: conteo
            })
        })
    })

})
  
router.post('/usuario', async function (req, res) {

    let body = req.body;
    
    const {email, password} = body;
    
    let usuario = await Usuario.findOne({email})

    if(usuario){
        return res.status(400).json({
            ok: false,
            body: 'Ya existe un usuario con ese email'
        })
    }

    usuario = new Usuario({
        name: body.name,
        email: body.email,
        password: body.password,
        role: body.role
    })

    //Encriptar contraseña
    const salt = bcrypt.genSaltSync();
    usuario.password = bcrypt.hashSync( password, salt);

    usuario.save((err, usuarioDB)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }else{
            res.status(201).json({
                ok:true,
                usuario: usuarioDB
            })
        }
    })
})

router.put('/usuario/:id', function (req, res) {
    let id = req.params.id;
    let body = _.pick(req.body, ['name','email','img','role','estado'])

    Usuario.findByIdAndUpdate(id, body, {new:true, runValidators:true}, (err, usuarioDB)=>{
        
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok:true,
            usuario: usuarioDB
        })
        
    })

})

router.delete('/usuario/:id', function (req, res) {
    
    let id = req.params.id;
    let state = { estado: false}

    Usuario.findByIdAndUpdate(id, state, {new:true}, (err, usuarioDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok:true,
            usuario: usuarioDB
        })
    })

    /*Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            })
        }

        if(!usuarioBorrado){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            })
        }

        res.json({
            ok:true,
            usuario: usuarioBorrado
        });
    });*/

})

module.exports = router