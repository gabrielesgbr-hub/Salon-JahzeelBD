const mongoose = require('mongoose')

const citaSchema = mongoose.Schema(
    {
        usuario: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario',
            required: true
        },

        servicio: {
            type: String,
            required: [true, 'Por favor ingresa el servicio a realizar']
        },

        fecha: {
            type: Date,
            required: [true, 'Por favor ingresa la fecha y hora de la cita']
        },

        hora: {
            type: String,
            required: [true, 'Por favor ingresa la hora de la cita (debe tener el formato HH:MM (24 horas))'],
            validate: {
                validator: function(v) {
                    return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v)
                },
                message: 'La hora debe tener el formato HH:MM (24 horas)'
            }
        },

        estilista: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Estilista",
            required: true 
        },

        notas: {
            type: String,
            default: ""
        },
        estado:{
            type:String,
            enum: ['agendada', 'cancelada', 'completada'],
            default: 'agendada'
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Cita', citaSchema)