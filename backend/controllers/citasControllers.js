    const asyncHandler = require('express-async-handler')
    const Cita = require('../models/citasModel')
    const Estilista = require('../models/estilistaModel')

    const createCita = asyncHandler(async (req, res) => {

        const usuarioId = req.usuario._id   // viene del token
        const { servicio, fecha, hora, id_estilista, notas } = req.body

        // Validación de campos obligatorios
        if (!servicio || !fecha || !hora || !id_estilista) {
            res.status(400)
            throw new Error("Faltan datos obligatorios: servicio, fecha, hora y estilista")
        }

        // Validar que el estilista exista
        const estilista = await Estilista.findById( id_estilista)

        if (!estilista) {
            res.status(404)
            throw new Error("El estilista no existe")
        }

        // que el estilista no tenga cita en la misma fecha/hora
        const conflicto = await Cita.findOne({
            estilista: id_estilista,
            fecha: new Date(fecha),
            hora: hora 
        })

        if (conflicto) {
            res.status(400)
            throw new Error("Este estilista ya tiene una cita en ese horario")
        }

        // Crear la cita
        const nuevaCita = await Cita.create({
            usuario: usuarioId,
            servicio,
            fecha: new Date(fecha),
            estilista: id_estilista,
            hora,
            notas
        })
        
        const citaCreada = await Cita.findById(nuevaCita._id).populate("estilista", "nombre");
        res.status(201).json(citaCreada)
    })

    const getCitas = asyncHandler(async (req, res) => {

        let citas;

        // Admin ve todas las citas
        if (req.usuario.esAdmin) {
            citas = await Cita.find().populate("usuario", "nombre telefono").populate("estilista", "nombre")
        }
        // Usuario normal solo sus citas
        else {
            citas = await Cita.find({ usuario: req.usuario._id }).populate("estilista", "nombre")
        }

        res.status(200).json(citas)
    })

    // GET CITA POR ID
    const getCitaPorId = asyncHandler(async (req, res) => {
        const cita = await Cita.findById(req.params.id).populate("estilista", "nombre")

        if (!cita) {
            res.status(404)
            throw new Error("Cita no encontrada")
        }

        // Usuario solo puede ver su cita
        if (!req.usuario.esAdmin && cita.usuario.toString() !== req.usuario._id.toString()) {
            res.status(401)
            throw new Error("Acceso no autorizado")
        }

        res.status(200).json(cita)
    })

    // UPDATE CITA
    const updateCita = asyncHandler(async (req, res) => {

        const cita = await Cita.findById(req.params.id)

        if (!cita) {
            res.status(404)
            throw new Error("Cita no encontrada")
        }

        // Usuario solo puede modificar su cita
        if (!req.usuario.esAdmin && cita.usuario.toString() !== req.usuario.id.toString()) {
            res.status(401)
            throw new Error("Acceso no autorizado")
        }

        const { servicio, fecha, hora, id_estilista, notas } = req.body

        // Si cambia el estilista validar
        if (id_estilista) {
            const estilista = await Estilista.findId({ nombre: estilista })

            if (!estilista) {
                res.status(404)
                throw new Error("El estilista no existe")
            }
        }

        if (fecha || hora || id_estilista) {

            const conflicto = await Cita.findOne({
                _id: { $ne: cita._id }, 
                fecha: fecha ? new Date(fecha) :cita.fecha,
                hora: hora || cita.hora,
                estilista: id_estilista || cita.estilista
            });

            if (conflicto) {
                res.status(400);
                throw new Error("El estilista ya tiene una cita en ese horario");
            }
        }

        // Actualizar datos
        cita.servicio = servicio || cita.servicio;
        cita.fecha = fecha ? new Date(fecha) : cita.fecha;
        cita.hora = hora || cita.hora;
        cita.estilista = id_estilista || cita.estilista;
        cita.notas = notas || cita.notas;

        const citaActualizada = await cita.save();
        const citaActualizadaPop = await Cita.findById(citaActualizada._id).populate("estilista", "nombre")
        res.status(200).json(citaActualizadaPop);
    });

    // DELETE CITA
    const deleteCita = asyncHandler(async (req, res) => {

        const cita = await Cita.findById(req.params.id)

        if (!cita) {
            res.status(404)
            throw new Error("Cita no encontrada")
        }

        // Permite que el admin o al dueño espeficiamente de la cuenta
        if (!req.usuario.esAdmin && cita.usuario.toString() !== req.usuario._id.toString()) {
            res.status(401)
            throw new Error("Acceso no autorizado")
        }

        await cita.deleteOne()

        res.status(200).json({ message: "Cita eliminada correctamente", id: req.params.id })
    })

    const cancelarCita = asyncHandler(async(req, res)=>{
        const cita = await Cita.findById(req.params.id)

        if(!cita){
            res.status(404)
            throw new Error('Cita no encontrada')
        }

        if(cita.usuario.toString() !== req.usuario.id && !req.usuario.esAdmin){
            res.status(401)
            throw new Error('Acceso no autorizado')
        }

        const citaCancelada = await cita.findByIdAndUpdate(req.params.id, {estado:'cancelada'}, {new:true, runValidators:true}).populate("estilista", "nombre")

        res.status(200).json(citaCancelada)
    })

    const completarCita = asyncHandler(async(req, res)=>{
        const cita = await Cita.findById(req.params.id)

        if(!cita){
            res.status(404)
            throw new Error('Cita no encontrada')
        }

        if(!req.usuario.esAdmin){
            res.status(401)
            throw new Error('Acceso no autorizado')
        }

        const citaCompletada = await cita.findByIdAndUpdate(req.params.id, {estado:'completada'}, {new:true, runValidators:true}).populate("estilista", "nombre")

        res.status(200).json(citaCompletada)
    })


    module.exports = {
        createCita,
        getCitas,
        getCitaPorId,
        updateCita,
        deleteCita,
        cancelarCita,
        completarCita
    }