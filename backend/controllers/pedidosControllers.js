const asyncHandler = require('express-async-handler')
const Producto = require('../models/productosModel')
const Pedido = require('../models/pedidosModel')
const Pedido_Producto = require('../models/pedido_productoModel')

const getPedidos = asyncHandler(async(req,res)=>{
    if(!req.usuario.esAdmin){
        const pedidos = await Pedido.findAll({where:{usuario:req.usuario.id}})
        res.status(200).json(pedidos)
    }
    const pedidos = await Pedido.findAll()
    res.status(200).json(pedidos)
})

const getPedido = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findByPk(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if(pedido.usuario !== req.usuario.id && !req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    res.status(200).json(pedido)
})

const createPedidos = asyncHandler(async(req,res)=>{
    const {productos} = req.body

    if(!productos || !Array.isArray(productos) || productos.length === 0){
        res.status(400)
        throw new Error('El pedido no puede estar vacío')
    }

    const t = await Producto.sequelize.transaction()

    try{
        const pedido = await Pedido.create({
            usuario:req.usuario.id,
            total:0,
        }, {transaction:t},)

        let total = 0

        for (const item of productos){
            const producto = await Producto.findByPk(item.id_producto, {transaction:t},)

            if(!producto || !producto.estaactivo){
                res.status(400)
                throw new Error('El producto solicitado no está disponible')
            }

            await producto.increment({ stock: -item.cantidad},{transaction:t},)

            await Pedido_Producto.create({
                id_pedido: pedido.id_pedido,
                id_producto:item.id_producto,
                cantidad:item.cantidad
            }, {transaction:t},)

            total += Number(producto.precio)*item.cantidad
        }

        pedido.total = total
        await pedido.save({transaction: t})

        const pedidoCompleto = await Pedido.findByPk(pedido.id_pedido, {
            transaction:t,
            include: [
                {
                    model: Producto,
                    attributes: ['id_producto'],
                    through: {
                        attributes: ['cantidad']
                    }
                }
            ]
        })

        const productosLimpios = pedidoCompleto.productos.map(p => ({
            id_producto: p.id_producto,
            cantidad: p.pedido_producto.cantidad
        }))

        await t.commit()

        res.status(201).json({
            id_pedido: pedidoCompleto.id_pedido,
            usuario: pedidoCompleto.usuario,
            total: pedidoCompleto.total,
            estado: pedidoCompleto.estado,
            productos: productosLimpios,
            createdAt: pedidoCompleto.createdAt,
            updatedAt: pedidoCompleto.updatedAt
        })
    } catch (error){
        await t.rollback()
        throw error
    }
})

const deletePedidos = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findByPk(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    await pedido.destroy()
    res.status(200).json({id: req.params.id})
})

const cancelarPedidos = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findByPk(req.params.id)

    if(!pedido){
        res.status(404)
        throw new Error('Pedido no encontrado')
    }

    if(pedido.usuario !== req.usuario.id && !req.usuario.esAdmin){
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

    const t = await Producto.sequelize.transaction()

    try{
        const productos = await Pedido_Producto.findAll({
            where:{id_pedido:pedido.id_pedido},
            transaction: t
        })

        for (const item of productos){
            const producto = await Producto.findByPk(item.id_producto, {transaction:t})

            await producto.increment({stock:item.cantidad}, {transaction:t},)
        }

        const pedidoCancelado = await pedido.update({estado:'cancelado'}, {transaction:t})

        await t.commit()

        res.status(200).json(pedidoCancelado)
    } catch (error){
        await t.rollback()
        throw error
    }
})

const completarPedidos = asyncHandler(async(req,res)=>{
    const pedido = await Pedido.findByPk(req.params.id)

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

    const pedidoCompletado = await pedido.update({estado:'completado'})
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