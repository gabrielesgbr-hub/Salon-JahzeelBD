const express = require('express')
const router = express.Router()
const {getEstilistas, createEstilista, updateEstilista, deleteEstilista} = require('../controllers/estilistaControllers')
const {protect} = require('../middleware/authMiddleware')

router.get('/', protect, getEstilistas)
router.post('/', protect, createEstilista)  
router.put('/:id', protect, updateEstilista)
router.delete('/:id', protect, deleteEstilista)

module.exports = router