const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const Producto = require('../models/Producto')
const Usuario = require('../models/Usuario');

// default options
app.use(fileUpload());

app.put('/upload/:tipo/:id', function (req, res){

    const tipo = req.params.tipo;
    const id = req.params.id;

    let sampleFile;
    let uploadPath;

    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            err:{
                message: "No se ha seleccionado ningun archivo!"
            }
        });
    }

    // validar tipo

    let tiposValidos = ['productos', 'usuarios'];
    if(tiposValidos.indexOf(tipo)<0){
        return res.status(400).json({
            ok:false,
            err:{
                message: 'Los tipos permitidos son ' + tiposValidos.join(',')
            }
        })
    }

    sampleFile = req.files.archivo;

    //Extensiones permitidas: 
    let extensionesValidas = ['png', 'jpg', 'gif', 'jepg'];
    let nombreArchivo = sampleFile.name.split('.');
    let extension = nombreArchivo[nombreArchivo.length - 1];

    //cambiar el nombre del archivo

    sampleFile.name = `${id}-${new Date().getMilliseconds()}.${extension}`;

    if (extensionesValidas.includes(extension)){
        
        uploadPath = `uploads/${tipo}/${sampleFile.name}`;

        sampleFile.mv(uploadPath, (err)=> {
            if (err)
            return res.status(500).json({
                ok:false,
                err
            });

            // AQUI IMAGEN CARGADA...
            (tipo==='usuario')
            ?imagenUsuario(id, res, nombreArchivo=sampleFile.name)
            :imagenProducto(id, res, nombreArchivo=sampleFile.name)
        });
    }else{
        return res.status(400).json({
            ok:false,
            err:{
                message: 'Las extensiones permitidas son ' + extensionesValidas.join(','),
                ext: extension
            }
        })
    }
    
});

function imagenUsuario(id, res, nombreArchivo){
    const state = {img: nombreArchivo};

    Usuario.findById(id).exec((err, usuarioDB)=>{

        if(err){
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok:false,
                err
            })
        }

        borraArchivo(usuarioDB.img, 'usuarios');
        
        
    })

    Usuario.findByIdAndUpdate(id,state,{new:true}, (err,usuarioDB)=>{
        if (err){
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!usuarioDB){
            borraArchivo(nombreArchivo, 'usuarios');
            return res.status(500).json({
                ok:false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }

        res.json({
            ok:true,
            usuario:usuarioDB,
            img: nombreArchivo
        })
    })
}

function imagenProducto(id, res, nombreArchivo){
    const state = {img: nombreArchivo};

    Producto.findById(id).exec((err, productoDB)=>{

        if(err){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok:false,
                err
            })
        }

        borraArchivo(productoDB.img, 'productos');
        
        
    })

    Producto.findByIdAndUpdate(id,state,{new:true}, (err,productoDB)=>{
        if (err){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok:false,
                err
            })
        }

        if(!productoDB){
            borraArchivo(nombreArchivo, 'productos');
            return res.status(500).json({
                ok:false,
                err: {
                    message: 'Usuario no existe'
                }
            })
        }

        res.json({
            ok:true,
            producto:productoDB,
            img: nombreArchivo
        })
    })
}

function borraArchivo(nombreImagen, tipo){
    let pathImagen = `uploads/${tipo}/${nombreImagen}`;
        
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;