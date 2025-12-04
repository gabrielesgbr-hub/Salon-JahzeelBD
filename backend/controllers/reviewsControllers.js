const asyncHandler = require('express-async-handler')
const Review = require('../models/reviewsModel')

const getReviews = asyncHandler(async(req, res)=>{
    const reviews = await Review.find()
    res.status(200).json(reviews)
})

const createReview = asyncHandler(async(req, res)=>{
    if(req.usuario.esAdmin){
        res.status(401)
        throw new Error('Solo un cliente puede crear una reseña') 
    }
    
    if(!req.body.puntaje || !req.body.contenido){
        res.status(400)
        throw new Error('Por favor llena todos los campos requeridos')
    }

    const review = await Review.create({
        puntaje: req.body.puntaje,
        contenido: req.body.contenido,
        usuario: req.usuario.nombre,
        id_usuario:req.usuario.id
    })

    res.status(201).json(review)
})

const updateReview = asyncHandler(async(req, res)=>{
    const review = await Review.findById(req.params.id)

    if(!review){
        res.status(404)
        throw new Error('Reseña no encontrada')
    }

    if(review.id_usuario != req.usuario.id){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    review.puntaje = req.body.puntaje || review.puntaje
    review.contenido = req.body.contenido || review.contenido

    const updatedReview = await review.save()
    res.status(200).json(updatedReview)
})

const deleteReview = asyncHandler(async(req, res)=>{
    const review = await Review.findById(req.params.id)

    if(!review){
        res.status(404)
        throw new Error('Reseña no encontrada')
    }

    if(review.id_usuario != req.usuario.id && !req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    await review.deleteOne()
    res.status(200).json({message: 'Reseña eliminada'})
})

module.exports = {
    getReviews,
    createReview,
    updateReview,
    deleteReview
}