const jwt = require('jsonwebtoken');

/**
 * Middleware de Autenticación Progresiva para SaaS
 * 1. Verifica el token JWT
 * 2. Extrae el userId, username, role Y tenantId
 * 3. Inyecta req.user para que todas las rutas lo usen.
 */
function authenticate(req, res, next) {
    const token = req.headers.authorization;
    if (!token) return res.status(401).send({ message: 'Acceso denegado: Se requiere Token' });

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        
        // Bloque seguridad SaaS: req.user ahora TIENE el tenantId.
        // Toda consulta a la BD usará este tenantId para filtrar.
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            tenantId: decoded.tenantId,
            fullName: decoded.fullName
        };
        
        next();
    } catch (err) {
        res.status(401).send({ message: 'Token inválido o expirado' });
    }
}

/**
 * Filtro de Roles para SaaS
 * Permite definir qué roles pueden acceder a una ruta específica.
 */
function authorize(roles = []) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ message: 'Acceso restringido: No tienes permisos suficientes.' });
        }
        next();
    };
}

module.exports = { authenticate, authorize };
