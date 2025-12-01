const asyncHandler = require('express-async-handler')
const Producto = require('../models/productosModel')
const { sequelize } = require('../config/db_postgres');

const getProductos = asyncHandler(async(req, res)=>{
    const productos = await Producto.findAll({where:{estaactivo:true}})
    res.status(200).json(productos)
})

const getProductosAdmin = asyncHandler(async(req, res)=>{
    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const productos = await Producto.findAll()
    res.status(200).json(productos)
})

const getProducto = asyncHandler(async(req, res)=>{
    const producto = await Producto.findByPk(req.params.id)

    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    if(!producto.estaactivo){
        res.status(403)
        throw new Error('Producto no disponible')
    }

    res.status(200).json(producto)
})

const getProductoAdmin = asyncHandler(async(req, res)=>{
    const producto = await Producto.findByPk(req.params.id)

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    res.status(200).json(producto)
})

const createProductos = asyncHandler(async(req, res)=>{
    const {nombre, sku, marca, categoria, precio, stock, estaactivo} = req.body

    if (!nombre || !sku || !marca || !categoria || !precio || !stock){
        res.status(400)
        throw new Error('Faltan datos')        
    }

    if (!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const productoExists = await Producto.findOne({where:{sku}})
    if(productoExists){
        res.status(400)
        throw new Error('Ese producto ya esta registrado')
    }

    const producto = await Producto.create({
        nombre,
        sku,
        marca,
        categoria,
        precio,
        stock,
        estaactivo: estaactivo ==="true" || estaactivo === true
    })

    if (!producto){
        res.status(400)
        throw new Error('No se pudo crear el producto')
    }

    res.status(201).json(producto)
})

const deleteProductos = asyncHandler(async(req, res)=>{
    const producto = await Producto.findByPk(req.params.id)
    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    await producto.destroy()
    res.status(200).json({id: req.params.id})
})

const updateProductos = asyncHandler(async(req, res)=>{
    const producto = await Producto.findByPk(req.params.id)
    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    if (req.body.version === undefined) {
        res.status(400);
        throw new Error("Version no encontrada");
    }

    if (req.body.version != producto.version) {
        res.status(409);
        throw new Error("Versión desactualizada: conflicto de concurrencia");
    }
    
    const productoUpdated =  await producto.update({
        ...req.body,
        version: sequelize.literal('version + 1')
    })
    res.status(200).json(productoUpdated)
})

module.exports={
    getProductos,
    getProductosAdmin,
    getProducto,
    getProductoAdmin,
    createProductos,
    deleteProductos,
    updateProductos
}