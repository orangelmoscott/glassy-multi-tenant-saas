/**
 * server.js — GLASSY SAAS CORE (Multi-tenant Architecture)
 * 1. Professional branding and scalable infrastructure
 * 2. JWT Data Isolation for individual cleaning companies
 * 3. Base64 Enterprise Assets
 */
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Middlewares locales
const { authenticate } = require('./src/middlewares/auth');

// Rutas locales
const authRoutes = require('./src/routes/auth');
const clientRoutes = require('./src/routes/clients');
const tenantRoutes = require('./src/routes/tenant');
const assignmentRoutes = require('./src/routes/assignments');
const userRoutes = require('./src/routes/users');
const dashboardRoutes = require('./src/routes/dashboard');
const expenseRoutes = require('./src/routes/expenses');
const stripeRoutes = require('./src/routes/stripe');

const app = express();

const webhookRoutes = require('./src/routes/webhooks');

// ==============================
// CONFIGURACIÓN GLOBAL
// ==============================
app.use(cors());

// Se declara la ruta antes que cualquier middleware global de JSON
app.use('/webhooks', webhookRoutes);

// Una vez declarada la ruta de webhooks, habilitamos JSON con límites
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// CONECTAR A LA BASE DE DATOS (Mismo Clúster, Nueva Base de Datos SaaS)
mongoose.connect(process.env.MONGO_URI_SAAS)
    .then(() => console.log('✅ Glassy conectado a MongoDB'))
    .catch(err => console.error('❌ Error de BD en Glassy:', err.message));

// ==============================
// RUTAS PRINCIPALES
// ==============================
app.use('/auth', authRoutes);
app.use('/clients', clientRoutes);
app.use('/tenant', tenantRoutes);
app.use('/assignments', assignmentRoutes);
app.use('/users', userRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/expenses', expenseRoutes);
app.use('/stripe', stripeRoutes);

// Ruta de Salud del SaaS
app.get('/', (req, res) => {
    res.send({ status: 'Glassy SaaS Platform Online', version: '1.0.0' });
});

// Middleware de manejo de errores profesional 404
app.use((req, res) => {
    res.status(404).send({ message: 'Ruta del SaaS no encontrada' });
});

// ==============================
// LANZAMIENTO
// ==============================
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`🚀 Glassy SaaS ejecutándose en el puerto ${PORT}`);
});
