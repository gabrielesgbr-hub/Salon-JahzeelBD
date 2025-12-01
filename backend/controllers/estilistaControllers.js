const asyncHandler = require('express-async-handler')
const Estilista = require('../models/estilistaModel')

// admin
const createEstilista = asyncHandler(async (req, res) => {
    if (!req.usuario || !req.usuario.esAdmin) {
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const { nombre, telefono } = req.body

    if (!nombre || !telefono) {
        res.status(400)
        throw new Error('Nombre y teléfono son obligatorios')
    }

    //nombre = nombre.trim()
    //telefono = telefono.trim()

    const telefonoValido = /^[0-9]{10}$/.test(telefono)
    if(!telefonoValido){
        res.status(400)
        throw new Error('El teléfono debe tener 10 dígitos')
    }

    //telefono unico
    const existeTelefono = await Estilista.findOne({ telefono })
    if(existeTelefono){
        res.status(400)
        throw new Error('Ya existe un estilista con es número de telefono')
    }

    const estilista = await Estilista.create({ nombre, telefono })
    res.status(201).json(estilista)
})

// búsqueda por nombre
const getEstilistas = asyncHandler(async (req, res) => {
    const { nombre } = req.query

    if (nombre) {
        if (!req.usuario || !req.usuario.esAdmin) {
            res.status(401)
            throw new Error('Acceso no autorizado')
        }

        const buscado = nombre.trim()
        const estilista = await Estilista.findOne({ nombre: { $regex: `^${escapeRegex(buscado)}$`, $options: 'i' } })
        if (!estilista) {
            res.status(404)
            throw new Error('Estilista no encontrado')
        }

        return res.status(200).json(estilista)
    }

    // admin puede ver todos
    if (req.usuario && req.usuario.esAdmin) {
        const estilistas = await Estilista.find()
        return res.status(200).json(estilistas)
    }

    // usuario normal solo activos
    const estilistasActivos = await Estilista.find({ activo: true })
    return res.status(200).json(estilistasActivos)
})

// nombre, telefono, activo
const updateEstilista = asyncHandler(async (req, res) => {
    if (!req.usuario || !req.usuario.esAdmin) {
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const { id } = req.params
    const { nombre, telefono, activo } = req.body

    const estilista = await Estilista.findById(id)
    if (!estilista) {
        res.status(404)
        throw new Error('Estilista no encontrado')
    }

    // validar nombre único si cambia
    if (nombre && nombre.trim() !== estilista.nombre) {
        const existeNombre = await Estilista.findOne({ nombre: nombre.trim() })
        if (existeNombre && existeNombre._id.toString() !== id) {
            res.status(400)
            throw new Error('Ese nombre ya está en uso')
        }
        estilista.nombre = nombre.trim()
    }

    //darle formato al telefono
    if (telefono) {
        telefono = telefono.trim()
        const validPhone = /^[0-9]{10}$/.test(telefono)
        if (!validPhone) {
            res.status(400)
            throw new Error('El teléfono debe tener 10 dígitos')
        }
        // verificar que no exista en otro registro
        const existeTel = await Estilista.findOne({ telefono })
        if (existeTel && existeTel._id.toString() !== id) {
            res.status(400)
            throw new Error('Ese número de teléfono ya está en uso')
        }
        estilista.telefono = telefono
    }

    if (activo !== undefined) {
        estilista.activo = activo === true || activo === 'true'
    }

    const estilistaActualizado = await estilista.save()
    res.status(200).json(estilistaActualizado)
})

// despedir
const deleteEstilista = asyncHandler(async (req, res) => {
    if (!req.usuario || !req.usuario.esAdmin) {
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const { id } = req.params

    const estilista = await Estilista.findById(id)
    if (!estilista) {
        res.status(404)
        throw new Error('Estilista no encontrado')
    }

    await estilista.deleteOne()
    res.status(200).json({ id })
})

module.exports = {
    createEstilista,
    getEstilistas,
    updateEstilista,
    deleteEstilista
}