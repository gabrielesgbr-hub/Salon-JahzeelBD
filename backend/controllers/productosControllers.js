const asyncHandler = require('express-async-handler')
const Producto = require('../models/productosModel')

const getProductos = asyncHandler(async(req, res)=>{
    const productos = await Producto.find({estaActivo:true})
    res.status(200).json(productos)

})

const getProductosAdmin = asyncHandler(async(req, res)=>{
    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const productos = await Producto.find()
    res.status(200).json(productos)
})

const getProducto = asyncHandler(async(req, res)=>{
    const producto = await Producto.findById(req.params.id)

    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    if(!producto.estaActivo){
        res.status(403)
        throw new Error('Producto no disponible')
    }

    res.status(200).json(producto)
})

const getProductoAdmin = asyncHandler(async(req, res)=>{
    const producto = await Producto.findById(req.params.id)

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
    const {nombre, sku, marca, categoria, precio, stock, estaActivo} = req.body

    if (!nombre || !sku || !marca || !categoria || !precio || !stock){
        res.status(400)
        throw new Error('Faltan datos')        
    }

    if (!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const productoExists = await Producto.findOne({sku})
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
        estaActivo: estaActivo ==="true" || estaActivo === true
    })

    if (!producto){
        res.status(400)
        throw new Error('No se pudo crear el producto')
    }

    res.status(201).json(producto)
})

const deleteProductos = asyncHandler(async(req, res)=>{
    const producto = await Producto.findById(req.params.id)
    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    await producto.deleteOne()
    res.status(200).json({id: req.params.id})
})

const updateProductos = asyncHandler(async(req, res)=>{
    const producto = await Producto.findById(req.params.id)
    if(!producto){
        res.status(404)
        throw new Error('Producto no encontrado')
    }

    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }
    
    const productoUpdated =  await Producto.findByIdAndUpdate(req.params.id, req.body, {new:true, runValidators:true})
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