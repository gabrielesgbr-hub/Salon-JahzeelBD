const express = require('express')
const router = express.Router()
const {createCita, getCitas, getCitaPorId, updateCita, deleteCita, cancelarCita, completarCita} = require('../controllers/citasControllers')
const {protect} = require('../middleware/authMiddleware')

router.post('/', protect, createCita)
router.get('/', protect, getCitas)
router.get('/:id', protect, getCitaPorId)
router.put('/:id', protect, updateCita)
router.put('/cancelar/:id', protect, cancelarCita)
router.put('/completar/:id', protect, completarCita)
router.delete('/:id',protect, deleteCita)

module.exports = router