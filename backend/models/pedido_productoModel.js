const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db_postgres')
const Pedido = require('./pedidosModel')
const Producto = require('./productosModel')

const Pedido_Producto = sequelize.define("pedido_producto",{
    id_pedido:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull:false
    },
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull:false
    },
    cantidad:{
        type: DataTypes.INTEGER,
        allowNull:false
    }
},{
    tableName: "pedido_producto",
    timestamps:false
})

Pedido.belongsToMany(Producto, {
    through: Pedido_Producto,
    foreignKey: "id_pedido",
    onDelete: "CASCADE"
})

Producto.belongsToMany(Pedido, {
    through: Pedido_Producto,
    foreignKey: "id_producto"
})

module.exports = Pedido_Producto