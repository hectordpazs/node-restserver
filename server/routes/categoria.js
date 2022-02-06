const {Router} = require('express');
const {verificarToken, verificarAdminRol} = require('../middlewares/autenticacion');
const Categoria = require('../models/Categoria');

const router = Router();

//Mostrar todas las categorias
router.get('/categoria', verificarToken, (req,res)=>{
    Categoria.find({})
    .sort('descripcion')
    .populate('usuario' , 'name')
    .exec((err, categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        res.json({
            ok:true,
            categoria: categoriaDB
        })
    })
})

//Mostrar una categoria por id
router.get('/categoria/:id', verificarToken, (req,res)=>{
    const id = req.params.id

    Categoria.findById(id).populate('usuario' , 'name')
    .exec((err, categoriaDB)=>{
        if(err){
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!categoriaDB){
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            })
        }

        res.json({
            ok:true,
            categoria: categoriaDB
        })

    })
})

//Crear Nueva categoria
router.post('/categoria', verificarToken, async (req,res)=>{
    const {descripcion} = req.body;

    let categoria = await Categoria.findOne({descripcion});

    if(categoria){
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Error, ya existe una categoria con esa descripcion'
            }
        })
    }

    categoria = new Categoria({
        descripcion,
        usuario: req.usuario
    });

    categoria.save((err, categoriaDB)=>{
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            })
        }else{
            res.status(201).json({
                ok:true,
                categoria: categoriaDB
            })
        }
    })

    

})

//actualiza Nueva categoria
router.put('/categoria/:id', [verificarToken, verificarAdminRol], async (req,res)=>{

    const id = req.params.id;
    const usuario = req.usuario._id;

    const {descripcion} = req.body
    const desc = {descripcion}

    let categoriaBDD = await Categoria.findById(id);

    if(!categoriaBDD){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'No existe esa categoria...'
            }
        })
    }

    if(categoriaBDD.usuario._id.toString() !== usuario){
        return res.status(403).json({
            ok:false,
            err: {
                message: 'No tienes privilegios para editar esta categoria...'
            }
        })
    }

    Categoria.findByIdAndUpdate(id, desc, {new:true, runValidators:true}, (err, categoriaDB)=>{
        if(err){
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok:true,
            categoria: categoriaDB
        });
        
    });
})

//borrar
router.delete('/categoria/:id', [verificarToken, verificarAdminRol], async(req,res)=>{
    
    const id = req.params.id;
    
    let categoriaBDD = await Categoria.findById(id);
    
    if(!categoriaBDD){
        return res.status(400).json({
            ok:false,
            err: {
                message: 'No existe esa categoria...'
            }
        })
    }

    await Categoria.findByIdAndRemove(id);

    res.json({
        ok:true,
        categoria: categoriaBDD,
        message: 'Categoria borrada Exitosamente'
    })
})


module.exports = router
