const express = require('express');
const { verificaTokenImg } = require('../middlewares/autenticacion');
const fs = require('fs');
const path = require('path');
let app = express();

app.get('/imagen/:destino/:img', verificaTokenImg, (req, res) => {
    let destino = req.params.destino;
    let img = req.params.img;

    let pathImagen = path.resolve(__dirname, `../../uploads/${destino}/${img}`);
    if (fs.existsSync(pathImagen)) {
        res.sendFile(pathImagen);
    } else {
        let noImagePath = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(noImagePath);
    }
});

module.exports = app;