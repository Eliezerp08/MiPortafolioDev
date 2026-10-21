const mongoose = require("mongoose");

const plataformaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
        unique: true // Evita que registremos dos veces la misma plataforma
    },
    sitio_web: {
        type: String,
        trim: true
    },
    precio_mensual: {
        type: Number,
        default: 0 // Útil por si quieres mostrar cuánto cuesta suscribirse a esa plataforma
    },
    activa: {
        type: Boolean,
        default: true // Para poder deshabilitar una plataforma sin borrarla de la base de datos
    }
}, {
    timestamps: true // Agrega fecha de creación y actualización automáticamente
});

const Plataforma = mongoose.model("Plataforma", plataformaSchema);

module.exports = Plataforma;