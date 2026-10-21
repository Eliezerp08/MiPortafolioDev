const mongoose = require("mongoose");

const resenaSchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario', // Se enlaza con el usuario que escribe la reseña
        required: true
    },
    produccion_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cartelera', // Se enlaza con la película o serie que están calificando
        required: true
    },
    calificacion: {
        type: Number,
        required: true,
        min: 1, // Calificación mínima de 1 estrella
        max: 5  // Calificación máxima de 5 estrellas
    },
    comentario: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true // Para saber exactamente en qué fecha y hora se dejó el comentario
});

const Resena = mongoose.model("Resena", resenaSchema);

module.exports = Resena;