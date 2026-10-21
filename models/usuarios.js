const mongoose = require("mongoose");

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    cedula: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    is_verifed: {
        type: Boolean,
        default: false
    },
    fecha_nacimiento: {
        type: Date
    },
    fecha_registro: {
        type: Date,
        default: Date.now
    },
    password: {
        type: String,
        required: true
    },
    token: {
        type: String,
        default: null
    },
    // --- NUEVAS INTEGRACIONES PARA EL CINE ---
    
    // 1. Rol para saber si es cliente o administrador del cine
    rol: {
        type: String,
        enum: ['cliente', 'admin'],
        default: 'cliente'
    },
    
    // 2. Relación con las películas/series que el usuario ha comprado
    peliculas_compradas: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cartelera' // Se enlaza con el modelo de Cartelera
    }]
});

const Usuario = mongoose.model("Usuario", usuarioSchema);

module.exports = Usuario;