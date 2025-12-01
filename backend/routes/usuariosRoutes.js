const express = require('express')
const router = express.Router()
const {login, register, data, getUsuarios, deleteUsuarios, getUsuario} = require('../controllers/usuariosControllers')
const {protect} = require('../middleware/authMiddleware')

router.post('/login', login)
router.post('/register', register)

router.get('/data', protect, data)
router.get('/', protect, getUsuarios) 
router.get('/:id', protect, getUsuario)
router.delete('/:id', protect, deleteUsuarios)

module.exports = router