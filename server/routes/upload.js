const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');

const app = express();

// default options
app.use(fileUpload());

app.put('/upload/:destino/:id', function(req, res) {
    let destino = req.params.destino;
    let id = req.params.id;

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            err: 'No se ha seleccionado ningún archivo'
        });
    }

    // Validar destino
    let destinosValidos = ['productos', 'usuarios'];
    if (destinosValidos.indexOf(destino) === -1) {
        return res.status(400).json({
            ok: false,
            err: 'Destino no es válido'
        });
    }

    let archivo = req.files.archivo;
    let fullName = archivo.name.split('.');
    let extension = fullName[1];

    // Extensiones permitidas
    let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg', 'JPG', 'PNG', 'GIF', 'JPEG'];

    // Validaciones
    if (extensionesValidas.indexOf(extension) === -1) {
        return res.status(400).json({
            ok: false,
            err: 'Archivo no válido'
        });
    }

    // Renombrar archivo
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`;

    // Todo correcto
    archivo.mv(`uploads/${destino}/${nombreArchivo}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err: err.message
            });

        // La imagen ha sido cargada
        if (destino === "usuarios") {
            imagenUsuario(id, res, nombreArchivo);
        } else {
            imagenProducto(id, res, nombreArchivo);
        }
    });
});

function imagenUsuario(id, res, nombreArchivo) {
    Usuario.findById(id, (err, usuarioBD) => {
        if (err) {
            borraArchivo('usuarios', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err: err.message
            });
        }
        if (!usuarioBD) {
            borraArchivo('usuarios', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: 'Usuario no existe'
            });
        }

        // Elimina imagen si fuera necesario
        borraArchivo('usuarios', usuarioBD.img);

        usuarioBD.img = nombreArchivo;
        usuarioBD.save((err, usuarioActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err.message
                });
            }
            res.json({
                ok: true,
                usuario: usuarioActualizado
            });
        });
    });
}

function imagenProducto(id, res, nombreArchivo) {
    Producto.findById(id, (err, productoBD) => {
        if (err) {
            borraArchivo('productos', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err: err.message
            });
        }
        if (!productoBD) {
            borraArchivo('productos', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: 'Producto no existe'
            });
        }

        // Elimina imagen si fuera necesario
        borraArchivo('productos', productoBD.img);

        productoBD.img = nombreArchivo;
        productoBD.save((err, productoActualizado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err: err.message
                });
            }
            res.json({
                ok: true,
                producto: productoActualizado
            });
        });
    });
}

function borraArchivo(destino, img) {
    let pathImagen = path.resolve(__dirname, `../../uploads/${destino}/${img}`);
    if (fs.existsSync(pathImagen)) {
        fs.unlinkSync(pathImagen);
    }
}

module.exports = app;