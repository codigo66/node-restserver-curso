const jwt = require('jsonwebtoken');

// Verificar token
let verificaToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: err.message
            });
        }
        req.usuario = decoded.usuario;
        next();
    });
};

let verificaRole = (req, res, next) => {
    let usuario = req.usuario;
    if (usuario.role !== "ADMIN_ROLE") {
        return res.status(401).json({
            ok: false,
            err: 'Necesita privilegios de administrador'
        });
    }
    next();
};

module.exports = {
    verificaToken,
    verificaRole
}