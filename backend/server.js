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
const { authenticate } = require('./src/middlewares/auth');

// Note: webhookRoutes has internal routes like /webhook/stripe
const webhookRoutes = require('./src/routes/webhooks');

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

// ==============================
// CONFIGURACIÓN GLOBAL
// ==============================
app.use(cors());

// Webhooks mounted at root to allow /webhook/stripe 
app.use(webhookRoutes);

// JSON Parsing must come AFTER webhooks to avoid signature breakdown
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// CONECTAR A LA BASE DE DATOS (Mismo Clúster, Nueva Base de Datos SaaS)
mongoose.connect(process.env.MONGO_URI_SAAS)
    .then(() => console.log('✅ Glassy conectado a MongoDB'))
    .catch(err => console.error('❌ Error de BD en Glassy:', err.message));

// ==============================
// RUTAS PRINCIPALES
// ==============================
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/tenant', tenantRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/stripe', stripeRoutes);

// Ruta de Salud del SaaS
app.get('/', (req, res) => {
    res.send({ status: 'Glassy SaaS Platform Online', version: '1.0.0', time: new Date().toISOString() });
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
