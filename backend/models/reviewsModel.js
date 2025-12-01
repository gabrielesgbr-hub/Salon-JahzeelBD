const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    puntaje:{
        type: Number,
        required: [true, 'Por favor ingresa un puntaje para la reseña'],
        min: [0, 'El puntaje minimo es 0'],
        max: [5, 'El puntaje maximo es 5']
    },
    contenido:{
        type: String,
        required: [true, 'Por favor ingresa el contenido de la reseña']
    },
    usuario:{
        type: String,
        required: [true, 'El nombre del usuario es requerido']
    },
    id_usuario:{
        type: mongoose.Types.ObjectId,
        ref:'Usuario',
        required:[true, 'El id del usuario es requerido']
    }
},{
    timestamps:true

})

module.exports = mongoose.model('Review', reviewSchema)
