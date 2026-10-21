const mongoose = require("mongoose");

const carteleraSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    tipo: {
        type: String,
        enum: ['pelicula', 'serie'], // Restringe a solo estas dos opciones
        required: true
    },
    genero: [{
        type: String,
        trim: true
    }], // Un arreglo de strings por si tiene múltiples géneros (ej: ["Acción", "Sci-Fi"])
    sinopsis: {
        type: String,
        required: true
    },
    precio: {
        type: Number,
        required: true,
        min: 0 // El precio de compra, 0 si es gratis
    },
    // --- Campos específicos según el tipo ---
    duracion_minutos: {
        type: Number, // Más útil para películas
        default: null
    },
    temporadas: {
        type: Number, // Más útil para series
        default: null
    },
    fecha_estreno: {
        type: Date
    },
    // --- Relaciones ---
    plataformas_disponibles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plataforma' // Lo enlaza con el modelo de Plataformas que crearemos luego
    }]
}, {
    timestamps: true // Crea automáticamente los campos createdAt y updatedAt
});

const Cartelera = mongoose.model("Cartelera", carteleraSchema);

module.exports = Cartelera;