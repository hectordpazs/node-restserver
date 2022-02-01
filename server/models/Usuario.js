const {Schema, model} = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const UsuarioSchema = Schema({
    name:{
        type: String,
        required: [true, 'El nombre es necesario']
    },
    email:{
        type: String,
        unique: true,
        required: [true, 'El correo es necesario'],
    },
    password:{
        type:String, 
        required: [true, 'La contraseña es obligatoria']
    },
    img:{
        type: String,
    },
    role:{
        type: String,
        enum: ['ADMIN_ROLE','USER_ROLE'],
        default: 'USER_ROLE',
    },
    estado:{
        type: Boolean,
        default: true
    },
    google:{
        type: Boolean,
        default: false
    }
});

UsuarioSchema.method('toJSON' , function () {
    let user = this;
    let userObject = user.toObject();
    delete userObject.password;

    return userObject
})

UsuarioSchema.plugin(uniqueValidator, {message: '{PATH} debe ser unico'})

module.exports = model('Usuario', UsuarioSchema);