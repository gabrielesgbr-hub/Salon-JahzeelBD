const express = require('express')
const router = express.Router()
const {createPedidos, deletePedidos, getPedido, getPedidos, cancelarPedidos, completarPedidos} = require('../controllers/pedidosControllers')
const {protect} = require('../middleware/authMiddleware')

router.get('/', protect, getPedidos)
router.get('/:id', protect, getPedido)
router.post('/', protect, createPedidos)
router.delete('/:id', protect, deletePedidos)
router.put('/cancelar/:id', protect, cancelarPedidos)
router.put('/completar/:id', protect, completarPedidos)

module.exports = router