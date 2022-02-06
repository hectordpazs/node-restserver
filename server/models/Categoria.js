const {Schema, model} = require('mongoose');

const CategoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique:true,
        required: [true, 'La descripcion es requerida y debe ser unica']
    },
    usuario:{
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    }
});

module.exports = model('Categoria' , CategoriaSchema);

