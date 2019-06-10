const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();

// Get (select sólo activos)
app.get('/usuario', verificaToken, (req, res) => {

    // Prueba res verificaToken
    /* return res.json({
        id: req.usuario._id,
        nombre: req.usuario.nombre,
        email: req.usuario.email
    }); */

    let skip = parseInt(req.query.desde || 0);
    let limit = parseInt(req.query.limite || 5);
    let estado = req.query.estado || true;

    Usuario.find({ estado: estado }, 'nombre email role estado google img')
        .skip(skip)
        .limit(limit)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }

            Usuario.countDocuments({ estado: estado }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });
        });
});

// Post (insert)
app.post('/usuario', verificaToken, (req, res) => {

    // Es posible verificar el rol mediante otro middleware
    // [verificaToken,verificaRole]
    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let body = req.body;

        let usuario = new Usuario({
            nombre: body.nombre,
            email: body.email,
            password: bcrypt.hashSync(body.password, 10),
            role: body.role
        });

        usuario.save((err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }

            res.json({
                OK: true,
                usuario: usuarioDB
            });
        });

        // Validando
        if (body.nombre === undefined) {
            res.status(400).json({
                OK: false,
                mensaje: 'El nombre es necesario'
            });
        }
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispone de privilegios de administrador"
        });
    }
});

// Put (update)
app.put('/usuario/:id', verificaToken, (req, res) => {

    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let id = req.params.id;
        let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

        Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispone de privilegios de administrador"
        });
    }
});

// Delete (borrar completamente)
app.delete('/usuario/:id', verificaToken, (req, res) => {

    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let id = req.params.id;
        Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }

            if (!usuarioBorrado) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Usuario no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                usuario: usuarioBorrado
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispone de privilegios de administrador"
        });
    }
});

// Delete (marcar estado)
app.put('/usuario/:id', verificaToken, (req, res) => {

    let userRole = req.usuario.role;
    if (userRole === "ADMIN_ROLE") {
        let id = req.params.id;
        let body = _.pick(req.body, ['estado']);

        Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, usuarioDB) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }

            res.json({
                ok: true,
                usuario: usuarioDB
            });
        });
    } else {
        return res.status(403).json({
            OK: false,
            err: "No dispone de privilegios de administrador"
        });
    }
});

module.exports = app;