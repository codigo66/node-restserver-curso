require('./config/config');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// Configuración global de rutas
app.use(require('./routes/index'));

// parse application/json
app.use(bodyParser.json());

mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true }, (err, resp) => {
    if (err) throw new Error();
    console.log('Base de datos online');
});

app.listen(process.env.PORT, () => {
    console.log("Escuchando el puerto 3000");
});