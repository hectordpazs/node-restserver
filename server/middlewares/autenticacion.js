//VERIFICAR TOKEN
const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next)=>{

    let token = req.header('token');

    jwt.verify(token, process.env.SEED, (err, decoded)=>{
        if (err){
            return res.status(401).json({
                ok:false,
                err:{
                    message: 'Token no valido'
                }
            })
        }

        req.usuario = decoded.usuario
        next()

    })
}


//VerifyRoleAdmin

const verificarAdminRol = (req, res, next)=>{
    let usuario = req.usuario;

    if(usuario.role ==='ADMIN_ROLE'){
        next()
    }else{
        return res.json({
            ok:false,
            err:{
                message: 'El usuario no es administrador'
            }
        })
    }

}

module.exports = {
    verificarToken,
    verificarAdminRol
}