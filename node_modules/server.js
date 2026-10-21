const express = require("express");
const mongoose = require("mongoose");
const sanitize = require('mongo-sanitize');
const bcrypt = require('bcrypt'); // Añadido para hashear contraseñas
require("dotenv").config();

// Importación de modelos
const Usuario = require("./models/usuarios"); 
const Cartelera = require("./models/cartelera"); // Asegúrate de crear este modelo
const Plataforma = require("./models/plataformas"); // Asegúrate de crear este modelo
const Resena = require("./models/resenas"); // Asegúrate de crear este modelo

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
    if (req.body) req.body = sanitize(req.body);
    if (req.params) req.params = sanitize(req.params);
    if (req.query) {
        for (const key in req.query) {
            req.query[key] = sanitize(req.query[key]);
        }
    }
    next();
});

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log("Conexión exitosa a MongoDB");
})
.catch((error) => {
    console.error("Error al conectar con MongoDB", error);
});

// Rutas de prueba
app.get("/api/saludo", (req, res) => {
    res.send("Hola Backend, El servidor está funcionando");
});

app.get("/api/pin", (req, res) => {
    res.send("PONG");
});

// ==========================================
// --- CRUD DE USUARIOS ---
// ==========================================

// Crear un nuevo usuario (Corregido y unificado)
app.post('/api/users', async (req, res) => {
    try {
        const {nombre, apellido, correo, cedula, fecha_nacimiento, password} = req.body;
        const salt = await bcrypt.genSalt(10);
        const passwordHasheado = await bcrypt.hash(password, salt);

        const newUser = new Usuario({ 
            nombre, apellido, correo, cedula, fecha_nacimiento, password: passwordHasheado 
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        res.status(400).json({ message: 'Error al crear el usuario', error: error.message });
    }
});

// ==========================================
// --- INICIO DE SESIÓN (LOGIN) ---
// ==========================================

app.post('/api/login', async (req, res) => {
    try {
        const { correo, password } = req.body;

        // 1. Verificar si el usuario existe en la base de datos
        const user = await Usuario.findOne({ correo });
        
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 2. Comparar la contraseña ingresada con la contraseña encriptada (hash)
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // 3. Inicio de sesión exitoso (Devolvemos datos básicos, SIN la contraseña)
        res.status(200).json({
            message: "Inicio de sesión exitoso",
            usuario: {
                id: user._id,
                nombre: user.nombre,
                apellido: user.apellido,
                correo: user.correo,
                rol: user.rol // Para saber si es cliente o admin
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Error en el servidor al iniciar sesión", error: error.message });
    }
});

// Obtener todos los Usuarios
app.get('/api/users', async (req, res) => {
    try {
        const users = await Usuario.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor", error });
    }
});

// Obtener Usuario por ID
app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await Usuario.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error en la base de datos", error });
    }
});

// Actualizar Usuario
app.put('/api/users/:id', async (req, res) => {
    try {
        const updatedUser = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedUser) return res.status(404).json({ message: "Usuario no encontrado" });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar", error });
    }
});

// Eliminar Usuario
app.delete('/api/users/:id', async (req, res) => {
    try {
        const deletedUser = await Usuario.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: "Usuario no encontrado" });
        res.status(200).json({ message: "Usuario eliminado con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar", error });
    }
});

// ==========================================
// --- CRUD DE CARTELERA (Series y Películas) ---
// ==========================================

app.post('/api/cartelera', async (req, res) => {
    try {
        const nuevaProduccion = await Cartelera.create(req.body);
        res.status(201).json(nuevaProduccion);
    } catch (error) {
        res.status(400).json({ message: "Error al crear en cartelera", error: error.message });
    }
});

app.get('/api/cartelera', async (req, res) => {
    try {
        const producciones = await Cartelera.find();
        res.status(200).json(producciones);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la cartelera", error: error.message });
    }
});

app.get('/api/cartelera/:id', async (req, res) => {
    try {
        const produccion = await Cartelera.findById(req.params.id);
        if (!produccion) return res.status(404).json({ message: "Producción no encontrada" });
        res.status(200).json(produccion);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la producción", error: error.message });
    }
});

app.put('/api/cartelera/:id', async (req, res) => {
    try {
        const actualizada = await Cartelera.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(404).json({ message: "Producción no encontrada" });
        res.status(200).json(actualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar", error: error.message });
    }
});

app.delete('/api/cartelera/:id', async (req, res) => {
    try {
        const eliminada = await Cartelera.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ message: "Producción no encontrada" });
        res.status(200).json({ message: "Producción eliminada de la cartelera" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar", error: error.message });
    }
});

// ==========================================
// --- CRUD DE PLATAFORMAS STREAMING ---
// ==========================================

app.post('/api/plataformas', async (req, res) => {
    try {
        const nuevaPlataforma = await Plataforma.create(req.body);
        res.status(201).json(nuevaPlataforma);
    } catch (error) {
        res.status(400).json({ message: "Error al crear la plataforma", error: error.message });
    }
});

app.get('/api/plataformas', async (req, res) => {
    try {
        const plataformas = await Plataforma.find();
        res.status(200).json(plataformas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener plataformas", error: error.message });
    }
});

app.get('/api/plataformas/:id', async (req, res) => {
    try {
        const plataforma = await Plataforma.findById(req.params.id);
        if (!plataforma) return res.status(404).json({ message: "Plataforma no encontrada" });
        res.status(200).json(plataforma);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la plataforma", error: error.message });
    }
});

app.put('/api/plataformas/:id', async (req, res) => {
    try {
        const actualizada = await Plataforma.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(404).json({ message: "Plataforma no encontrada" });
        res.status(200).json(actualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar plataforma", error: error.message });
    }
});

app.delete('/api/plataformas/:id', async (req, res) => {
    try {
        const eliminada = await Plataforma.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ message: "Plataforma no encontrada" });
        res.status(200).json({ message: "Plataforma eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar plataforma", error: error.message });
    }
});

// ==========================================
// --- CRUD DE RESEÑAS ---
// ==========================================

app.post('/api/resenas', async (req, res) => {
    try {
        const nuevaResena = await Resena.create(req.body);
        res.status(201).json(nuevaResena);
    } catch (error) {
        res.status(400).json({ message: "Error al crear la reseña", error: error.message });
    }
});

app.get('/api/resenas', async (req, res) => {
    try {
        // En una app real, podrías usar .populate() aquí para traer datos del usuario y la película
        const resenas = await Resena.find();
        res.status(200).json(resenas);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener reseñas", error: error.message });
    }
});

app.get('/api/resenas/:id', async (req, res) => {
    try {
        const resena = await Resena.findById(req.params.id);
        if (!resena) return res.status(404).json({ message: "Reseña no encontrada" });
        res.status(200).json(resena);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener la reseña", error: error.message });
    }
});

app.put('/api/resenas/:id', async (req, res) => {
    try {
        const actualizada = await Resena.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!actualizada) return res.status(404).json({ message: "Reseña no encontrada" });
        res.status(200).json(actualizada);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la reseña", error: error.message });
    }
});

app.delete('/api/resenas/:id', async (req, res) => {
    try {
        const eliminada = await Resena.findByIdAndDelete(req.params.id);
        if (!eliminada) return res.status(404).json({ message: "Reseña no encontrada" });
        res.status(200).json({ message: "Reseña eliminada con éxito" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar reseña", error: error.message });
    }
});


// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});