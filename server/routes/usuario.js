const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const Usuario = require('../models/usuario');

const app = express();

// Get (select todos)
/* app.get('/usuario', function(req, res) {
    let skip = parseInt(req.query.desde || 0);
    let limit = parseInt(req.query.limite || 5);

    Usuario.find({}, 'nombre email role estado google img')
        .skip(skip)
        .limit(limit)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }
            Usuario.count({}, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });
        });
}); */

// Get (select sólo activos)
app.get('/usuario', function(req, res) {
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
            Usuario.count({ estado: estado }, (err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });
            });
        });
});

// Post (insert)
app.post('/usuario', function(req, res) {
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
});

// Put (update)
app.put('/usuario/:id', function(req, res) {
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

});

// Delete (borrar completamente)
app.delete('/usuario/:id', function(req, res) {
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
});

// Delete (marcar estado)
app.put('/usuario/:id', function(req, res) {
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
});

module.exports = app;