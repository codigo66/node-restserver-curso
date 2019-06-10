const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const app = express();

app.post('/login', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }, (err, usuarioBD) => {
        // Valida si ocurre un error en e server
        if (err) {
            return res.status(500).json({
                OK: false,
                err: err.message
            });
        }
        // valida que el correo sea correcto
        if (!usuarioBD) {
            return res.status(400).json({
                OK: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }
        // valida que la contraseña sea correcta
        if (!bcrypt.compareSync(body.password, usuarioBD.password)) {
            return res.status(400).json({
                OK: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }
        // genera el token
        let token = jwt.sign({
            usuario: usuarioBD
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });

        // respuesta cuando todo es correcto
        res.json({
            ok: true,
            usuario: usuarioBD,
            token
        })
    });
});

module.exports = app;