require('./config/config');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Get
app.get('/usuario', function(req, res) {
    res.json('get usuario');
});

// Post
app.post('/usuario', function(req, res) {
    let body = req.body;
    // Validando
    if (body.nombre === undefined) {
        res.status(400).json({
            OK: false,
            mensaje: 'El nombre es necesario'
        });
    } else {
        res.json({
            body
        });
    }
});

// Put
app.put('/usuario/:id', function(req, res) {
    let id = req.params.id;
    res.json({
        id
    });
});

// Delete
app.delete('/usuario', function(req, res) {
    res.json('delete usuario');
});

app.listen(process.env.PORT, () => {
    console.log("Escuchando el puerto 3000");
});