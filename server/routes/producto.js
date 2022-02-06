const {Router} = require('express');
const {verificarToken} = require('../middlewares/autenticacion');

const _ = require('underscore');
const router = Router();
const Producto = require('../models/Producto');

//Obtener Productos

router.get('/productos', verificarToken, (req,res)=>{
    //trae todos los productos
    //populate usuario y categoria
    //paginado

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({})
    .sort('nombre')
    .skip(desde)
    .limit(limite)
    .populate('usuario' , 'name')
    .populate('categoria', 'descripcion')
    .exec((err, productoDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            producto: productoDB
        })
    })
})

//obtener Producto por id
router.get('/productos/:id', verificarToken,  (req,res)=>{
    //populate usuario y categoria
    //paginado
    const id = req.params.id;

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.findById(id)
    .populate('usuario' , 'name')
    .populate('categoria' , 'descripcion')
    .skip(desde)
    .limit(limite)
    .exec((err, productoDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!productoDB){
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        res.json({
            ok:true,
            producto: productoDB
        })

    })
})

//BUSCAR PRODUCTOS

router.get('/productos/buscar/:termino', verificarToken, (req, res)=>{

    let termino = req.params.termino;
    let regex = new RegExp(termino, 'i');

    Producto.find({nombre:regex})
    .populate('categoria' , 'nombre')
    .exec((err, productos)=>{

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }

        res.json({
            ok:true,
            productos
        })
    })
})

//Crear producto
router.post('/productos', verificarToken,  async (req,res)=>{
    //grabar el usuario
    //grabar una categoria del listado

    const usuario = req.usuario._id;
    const {nombre, precioUni, descripcion, disponible, categoria} = req.body

    let producto = await Producto.findOne({nombre, categoria});

    if(producto){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'Ya existe ese producto en esa categoria!'
            }
        })
    }

    producto = new Producto({
        nombre,
        precioUni,
        descripcion,
        disponible,
        categoria,
        usuario
    });

    producto.save((err, productoDB)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }else{
            res.status(201).json({
                ok:true,
                producto: productoDB
            })
        }
    })


})

//actualizar el producto
router.put('/productos/:id', verificarToken, async (req,res)=>{
    //grabar el usuario
    //grabar una categoria del listado

    const id = req.params.id;
    const usuarioID = req.usuario._id
    let body = _.pick(req.body, ['nombre','precioUni','descripcion','disponible','categoria', 'usuario'])
    
    let producto = await Producto.findById(id);
    
    if(!producto){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'No existe ese producto...'
            }
        })
    }

    body.usuario = usuarioID;

    Producto.findByIdAndUpdate(id, body, {new:true, runValidators:true}, (err, productoDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true,
            producto: productoDB
        });
        
    });


})

//borrar un producto
router.delete('/productos/:id', (req,res)=>{
    //poner disponible a false
    const id = req.params.id;
    const state = { disponible: false}

    Producto.findByIdAndUpdate(id, state, {new:true}, (err, productoDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok:true,
            producto: productoDB,
            message: 'Producto borrado'
        });
    })

})

module.exports = router