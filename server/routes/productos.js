const express = require('express');
const _ = require('underscore');
const { verificaToken, verificaRole } = require('../middlewares/autenticacion');
let app = express();
let Producto = require('../models/producto');

// Obtener todos los productos paginado (trae los productos populate(usuario y categoria))
app.get('/productos', verificaToken, (req, res) => {

    let skip = parseInt(req.query.desde || 0);
    let limit = parseInt(req.query.limite || 5);
    let disponible = req.query.disponible || true;

    Producto.find({ disponible: disponible }, 'nombre precioUni descripcion categoria usuario')
        .skip(skip)
        .limit(limit)
        .sort('nombre')
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    OK: false,
                    err: err.message
                });
            }
            res.json({
                ok: true,
                productos
            });
        });
});

// Obtener producto por ID populate(usuario y categoria)
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id, (err, productoBD) => {
            if (err) {
                return res.status(400).json({
                    OK: false,
                    err: err.message
                });
            }
            if (!productoBD) {
                return res.status(400).json({
                    OK: false,
                    err: 'Producto no encontrado',
                    id
                });
            }
            res.status(200).json({
                ok: true,
                productoBD
            });
        })
        .populate('categoria', 'nombre')
        .populate('usuario', 'nombre email')
});

// Buscar productos
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;
    let regEx = new RegExp(termino, 'i');

    Producto.find({ nombre: regEx })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    OK: false,
                    err: err.message
                });
            }
            res.status(200).json({
                ok: true,
                productos
            });
        });
});

// Crear un producto (grabar usuario, grabar categoria)
app.post('/productos', [verificaToken, verificaRole], (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    producto.save((err, productoBD) => {
        if (err) {
            return res.status(500).json({
                OK: false,
                err: err.message
            });
        }
        res.json({
            OK: true,
            producto: productoBD
        });
    });
});

// Actualizar producto
app.put('/productos/:id', [verificaToken, verificaRole], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    // Podría buscar primero el ID con findByID y después hacer el grabado si lo encuentra
    // Así se evita el error de cast ObjectID al no encontrar el producto

    Producto.findByIdAndUpdate(id, body, { new: true, useFindAndModify: false }, (err, productoBD) => {
        if (err) {
            return res.status(400).json({
                OK: false,
                err: err.message
            });
        }
        if (!productoBD) {
            return res.status(400).json({
                OK: false,
                err: 'Producto no encontrado',
                id
            });
        }
        res.status(200).json({
            ok: true,
            producto: productoBD
        });
    });
});

// Borrar un producto (campo disponible -> false)
app.delete('/productos/:id', [verificaToken, verificaRole], (req, res) => {
    let id = req.params.id;

    // Podría buscar primero el ID con findByID y después hacer el cambio si lo encuentra

    Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, useFindAndModify: false }, (err, productoBD) => {
        if (err) {
            return res.status(400).json({
                OK: false,
                err: err.message
            });
        }

        res.json({
            ok: true,
            productoBD,
            message: 'Producto no disponible'
        });
    });
});

module.exports = app;