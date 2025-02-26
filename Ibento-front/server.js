const express = require("express");
const path = require("path");

const app = express();

// Servir archivos estáticos (index.js, sw.js, manifest.json)
app.use(express.static(__dirname));

// Servir index.js como la "página principal"
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.js"));
});

// Servir el Service Worker
app.get("/sw.js", (req, res) => {
    res.sendFile(path.join(__dirname, "sw.js"));
});

// Servir el Manifest
app.get("/manifest.json", (req, res) => {
    res.sendFile(path.join(__dirname, "manifest.json"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor frontend corriendo en http://localhost:${PORT}`);
});
