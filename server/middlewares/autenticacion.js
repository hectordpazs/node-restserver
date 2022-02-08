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
            });
        }

        req.usuario = decoded.usuario;
        next();

    });
}


//VerifyRoleAdmin

const verificarAdminRol = (req, res, next)=>{
    let usuario = req.usuario;

    if(usuario.role ==='ADMIN_ROLE'){
        next();
    }else{
        return res.json({
            ok:false,
            err:{
                message: 'El usuario no es administrador'
            }
        });
    }

}

//VerificarTokenImg

const verificarTokenImg = (req, res, next)=>{
    let token = req.query.token;

    jwt.verify(token, process.env.SEED, (err, decoded)=>{
        if (err){
            return res.status(401).json({
                ok:false,
                err:{
                    message: 'Token no valido'
                }
            });
        }

        req.usuario = decoded.usuario;
        next();
    });
}

module.exports = {
    verificarToken,
    verificarAdminRol,
    verificarTokenImg
}