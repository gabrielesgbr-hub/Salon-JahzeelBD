const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/db_postgres')

const Producto = sequelize.define("producto",{
    id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    sku:{
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },
    marca:{
        type: DataTypes.STRING(50),
        allowNull: false
    },
    categoria:{
        type: DataTypes.STRING(100),
        allowNull: false
    },
    stock:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    precio:{
        type: DataTypes.DECIMAL(10,2),
        allowNull: false,
    },
    estaActivo:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
    },
    version: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
},{
    timestamps:true,
})

module.exports = Producto