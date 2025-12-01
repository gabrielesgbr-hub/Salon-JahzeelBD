const mongoose = require('mongoose')

const estilistaSchema = mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'Por favor ingresa el nombre del estilista']
        },

        telefono: {
            type: String,
            required: [true, 'Por favor ingresa el número de teléfono del estilista'],
            unique: true,
            validate: {
                validator: v => /^[0-9]{10}$/.test(v),
                message: 'El teléfono debe contener 10 dígitos'
            }
        },

        activo: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Estilista', estilistaSchema)