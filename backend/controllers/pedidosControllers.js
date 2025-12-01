const asyncHandler = require('express-async-handler')
const Producto = require('../models/productosModel')
const Pedido = require('../models/pedidosModel')
const mongoose = require('mongoose')

const getPedidos = asyncHandler(async(req,res)=>{
    if(!req.usuario.esAdmin){
        const pedidos = await Pedido.find({usuario:req.usuario.id})
        res.status(200).json(pedidos)
    }
    const pedidos = await Pedido.find()
    res.status(200).json(pedidos)
})

const getPedido = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findById(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if(pedido.usuario.toString() !== req.usuario.id && !req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    res.status(200).json(pedido)
})

const createPedidos = asyncHandler(async(req,res)=>{
    const {productos} = req.body

    if(!productos){
        res.status(400)
        throw new Error('Faltan datos para completar el pedido')
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try{
        let pedido = await Pedido.create([{
            usuario:req.usuario.id,
            productos,
            total:0
        }], {session})

        pedido = pedido[0]

        pedido = await pedido.populate({
            path:"productos.producto",
            options: {session}
        })

        for (const item of pedido.productos) {
            if (!item.producto) { 
                throw new Error(`Producto con ID ${item} no existe`)
            }
        }

        for (const item of pedido.productos) {
            if (!item.producto.estaActivo) {
                throw new Error(`El producto '${item.producto.nombre}' no está activo`)
            }
        }

        const result = await Producto.bulkWrite(
            pedido.productos.map(item => ({
                updateOne: {
                filter: { _id: item.producto._id, stock: { $gte: item.cantidad } },
                update: { $inc: { stock: -item.cantidad } }
                }
            })), {session}
        )

        if (result.modifiedCount !== pedido.productos.length) {
            for (const item of pedido.productos) {
                const producto = await Producto.findById(item.producto._id).session(session)

                if (!producto || producto.stock < item.cantidad) {
                    throw new Error(`Stock insuficiente para '${producto?.nombre}' (ID: ${item.producto._id})`)
                }
            }
        }
        
        const total = pedido.productos.reduce((acum, item)=>{
            return acum + item.producto.precio*item.cantidad
        }, 0)

        pedido.total = total
        await pedido.save({session})

        res.status(201).json({
            _id: pedido._id,
            usuario: pedido.usuario,
            productos: pedido.productos.map(item => ({
            nombre: item.producto.nombre,
            cantidad: item.cantidad,
            categoria: item.producto.categoria,
            precio: item.producto.precio
            })),
            total:pedido.total,
            estado:pedido.estado
        })

        await session.commitTransaction()
        session.endSession()
    } catch (error){
        await session.abortTransaction()
        session.endSession()
        throw error
    }
})

const deletePedidos = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findById(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    await pedido.deleteOne()
    res.status(200).json({id: req.params.id})
})

const cancelarPedidos = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findById(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if(pedido.usuario.toString() !== req.usuario.id && !req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    if (pedido.estado === 'cancelado') {
        res.status(400)
        throw new Error('Este pedido ya fue cancelado')
    }

    if (pedido.estado === 'completado') {
        res.status(400)
        throw new Error('Este pedido ya fue completado')
    }

    const session = await mongoose.startSession()
    session.startTransaction()

    try{
        await Producto.bulkWrite(
            pedido.productos.map(item => ({
                updateOne: {
                filter: { _id: item.producto},
                update: { $inc: { stock: item.cantidad } }
                }
            })), {session}
        )

        const pedidoCancelado = await Pedido.findByIdAndUpdate(req.params.id, {estado:'cancelado'}, {new:true, runValidators:true, session})

        res.status(200).json(pedidoCancelado)

        await session.commitTransaction()
        session.endSession()
    } catch (error){
        await session.abortTransaction()
        session.endSession()
        throw error
    }
})

const completarPedidos = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findById(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if (pedido.estado === 'cancelado') {
        res.status(400)
        throw new Error('Este pedido ya fue cancelado')
    }

    if (pedido.estado === 'completado') {
        res.status(400)
        throw new Error('Este pedido ya fue completado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const pedidoCompletado = await Pedido.findByIdAndUpdate(req.params.id, {estado:'completado'}, {new:true, runValidators:true})
    res.status(200).json(pedidoCompletado)
})

module.exports={
    getPedido,
    getPedidos,
    createPedidos,
    cancelarPedidos,
    completarPedidos,
    deletePedidos
}