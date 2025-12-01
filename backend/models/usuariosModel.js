const mongoose = require('mongoose')

const usuarioSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: [true, 'Por favor ingresa tu nombre']
    },
    telefono:{
        type: String,
        required: [true, 'Por favor ingresa tu telefono'],
        unique: true,
        validate: {
            validator: v => /^[0-9]{10}$/.test(v),
            message: 'El teléfono debe contener exactamente 10 dígitos numéricos'
        }
    },
    password:{
        type: String,
        required: [true, 'Por favor ingresa tu contraseña']
    },
    esAdmin:{
        type: Boolean,
        default: false
    }
},{
    timestamps:true
})

module.exports = mongoose.model('Usuario', usuarioSchema)