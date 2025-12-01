const express = require('express')
const router = express.Router()
const {getProducto, getProductos, createProductos, deleteProductos, updateProductos, getProductoAdmin, getProductosAdmin} = require('../controllers/productosControllers')
const {protect} = require('../middleware/authMiddleware')

router.get('/', getProductos)
router.get('/admin', protect, getProductosAdmin)
router.get('/:id', getProducto)
router.get('/admin/:id', protect, getProductoAdmin)
router.post('/', protect, createProductos)
router.put('/:id', protect, updateProductos)
router.delete('/:id', protect, deleteProductos)

module.exports = router