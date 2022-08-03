const http = require('http');
const express = require('express');
const path = require("path");

const app = express();
const server = http.createServer(app);

const publicDirPath = path.join(__dirname, '../public');

app.use(express.static(publicDirPath));

module.exports = {
    app,
    server
};