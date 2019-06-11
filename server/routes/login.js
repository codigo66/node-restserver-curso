const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);
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

// Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }
}
//verify().catch(console.error);

// Google
app.post('/google', async(req, res) => {
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            })
        });

    // Validación en la BD de googleUser
    Usuario.findOne({ email: googleUser.email }, (err, usuarioBD) => {
        if (err) {
            return res.status(500).json({
                OK: false,
                err: err.message
            });
        }

        // Verifica si existe usuario
        if (usuarioBD) {
            // Verifica si el usuario ya se había creado mediante Google
            if (usuarioBD.google === false) {
                return res.status(400).json({
                    OK: false,
                    err: 'Debe usar su autenticación normal'
                });
            } else {
                // genera el token
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                })
            }
        } else {
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioBD) => {
                if (err) {
                    return res.status(500).json({
                        OK: false,
                        err: err.message
                    });
                }
                // genera el token
                let token = jwt.sign({
                    usuario: usuarioBD
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.status(200).json({
                    ok: true,
                    usuario: usuarioBD,
                    token
                })
            });
        }
    });



    // res.json({
    //     usuario: googleUser
    // });
});

module.exports = app;