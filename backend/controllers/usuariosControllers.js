const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler') 
const Usuario = require ('../models/usuariosModel')

const login = asyncHandler(async(req,res) => {
    const {telefono, password} = req.body

    if(!telefono || !password){
        res.status(400)
        throw new Error('Faltan datos')
    }

    //verificar que el usuario exista
    const usuario = await Usuario.findOne({telefono})

    if(!usuario){
        res.status(404)
        throw new Error('Ese telefono no esta registrado')
    }

    //Si el usuario existe verifico el hash
    if (usuario && (await bcrypt.compare(password, usuario.password))){
        res.status(200).json({
            _id: usuario.id,
            nombre: usuario.nombre,
            telefono: usuario.telefono,
            esAdmin: usuario.esAdmin, //PRUEBA
            token: generarToken(usuario.id)
        })
    } else{
        res.status(400)
        throw new Error('La contraseña es incorrecta')
    }
})

const register = asyncHandler(async(req,res) => {
    //desestructurar el body
    const {nombre, telefono, password, esAdmin} = req.body
    //verificamos que se pasen todos los campos
    if (!nombre || !telefono || !password){
        res.status(400)
        throw new Error('Faltan datos')
    }
    //verificamos que ese usuario no existe y si no existe guardarlo
    const usuarioExists = await Usuario.findOne({telefono})
    if (usuarioExists){
        res.status(400)
        throw new Error('Ese número ya está registrado')
    } else{
        //hash al password
        const salt = await bcrypt.genSalt(10)
        const passwordHashed = await bcrypt.hash(password, salt)
        
        //crear el usuario
        const usuario = await Usuario.create({
            nombre,     //nombre:nombre
            telefono,      //telefono:telefono
            password: passwordHashed,
            esAdmin: esAdmin === true || esAdmin === "true" 
        })

        //Si el usuario se creo correctamente lo muestro
        if (usuario){
            res.status(201).json({
                _id: usuario.id,
                nombre: usuario.nombre,
                telefono: usuario.telefono
            })
        } else{
            res.status(400)
            throw new Error ('No se pudieron guardar los datos')
        }
    }
})

const deleteUsuarios = asyncHandler(async(req, res) =>{
    const usuario = await Usuario.findById(req.params.id)
    if(!usuario){
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    if(usuario.id !== req.usuario.id && !req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    } 

    await usuario.deleteOne()
    res.status(200).json({id: req.params.id})
})

const getUsuarios = asyncHandler(async(req, res)=>{
    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const usuarios = await Usuario.find().select('-password')

    res.status(200).json(usuarios)
})

const getUsuario = asyncHandler(async(req, res)=>{
    if(!req.usuario.esAdmin){
        res.status(401)
        throw new Error('Acceso no autorizado')
    }

    const usuario = await Usuario.findById(req.params.id).select('-password')

    if(!usuario){
        res.status(404)
        throw new Error('Usuario no encontrado')
    }

    res.status(200).json(usuario)
})

const data = asyncHandler(async(req,res) => {
    res.status(200).json(req.usuario)
})

const generarToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d'
    })
}

module.exports = {
    login, register, data, deleteUsuarios, getUsuarios, getUsuario
}