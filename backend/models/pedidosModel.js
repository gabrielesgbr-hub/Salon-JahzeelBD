const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db_postgres')

const Pedido = sequelize.define("pedido",{
    id_pedido:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    usuario:{
        type: DataTypes.STRING(24),
        allowNull: false
    },
    total:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
    },
    estado:{
        type: DataTypes.ENUM('pendiente','cancelado','completado'), 
        defaultValue:'pendiente',
        allowNull:false
    }
},{
    tableName: "pedido",
    timestamps: true,
}) 

module.exports = Pedido