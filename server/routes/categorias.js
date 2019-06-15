const express = require('express');
const _ = require('underscore');
let { verificaToken } = require('../middlewares/autenticacion');
let app = express();
let Categoria = require('../models/categoria');

// mostrar todas las categorías
app.get('/categoria', verificaToken, (req, res) => {
    Categoria.find({})
        .sort('nombre')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }
            res.json({
                ok: true,
                categorias
            });
        });
});

// mostrar una categoría por ID
app.get('/categoria/:id', verificaToken, (req, res) => {
    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let id = req.params.id;
        Categoria.findById(id, (err, categoriaBD) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }
            if (!categoriaBD) {
                return res.status(400).json({
                    OK: false,
                    err: 'Categoría no encontrada',
                    id
                });
            }
            res.status(200).json({
                ok: true,
                categoriaBD
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispones de privilegios de administrador"
        });
    }
});

// crear nueva categoría
app.post('/categoria', verificaToken, (req, res) => {
    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let body = req.body;
        let categoria = new Categoria({
            nombre: body.nombre,
            usuario: req.usuario._id
        });
        categoria.save((err, categoriaBD) => {
            if (err) {
                return res.status(500).json({
                    OK: false,
                    err: err.message
                });
            }
            res.json({
                OK: true,
                categoria: categoriaBD
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispones de privilegios de administrador"
        });
    }
});

// actualizar categoría
app.put('/categoria/:id', verificaToken, (req, res) => {
    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let id = req.params.id;
        let body = _.pick(req.body, ['nombre', 'descripcion']);
        Categoria.findByIdAndUpdate(id, body, { new: true }, (err, categoriaBD) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }
            if (!categoriaBD) {
                return res.status(400).json({
                    OK: false,
                    err: 'Categoría no encontrada',
                    id
                });
            }
            res.status(200).json({
                ok: true,
                categoria: categoriaBD
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispones de privilegios de administrador"
        });
    }
});

// eliminar categoría (físicamente)
app.delete('/categoria/:id', verificaToken, (req, res) => {
    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let id = req.params.id;
        Categoria.findByIdAndRemove(id, (err, categoriaBD) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }
            if (!categoriaBD) {
                return res.status(400).json({
                    OK: false,
                    err: 'Categoría no encontrada',
                    id
                });
            }
            res.status(200).json({
                ok: true,
                message: 'Categoría borrada'
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispones de privilegios de administrador"
        });
    }
});

module.exports = app;