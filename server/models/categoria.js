const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;
let categoriaSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
        required: [true, 'Es necesario el nombre de la categoría']
    },
    usuario: {
        type: ObjectId,
        ref: 'Usuario'
    }
});
categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe ser único' });
module.exports = mongoose.model('Categoria', categoriaSchema);