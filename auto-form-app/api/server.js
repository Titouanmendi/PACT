const polka = require("polka");
const { json, urlencoded } = require('body-parser');
const fileUpload = require('express-fileupload');
const fs = require("fs");
const { join } = require('path');
const AdmZip = require("adm-zip");
const methods = require("./methods");
const { cipherFile, decipherFile } = require("../lib");
const Store = require("./store");

let db;
let currentConfig = new Store();

const activate = async () => {
    const fileName = currentConfig.get("fileName");
    const key = currentConfig.get("key");
    const iv = currentConfig.get("iv");
    if (fs.existsSync(fileName)) {
        try {
            const buff = await decipherFile(key, iv, fileName, null);
            db = new AdmZip(buff);
        } catch (e) {
            db = new AdmZip();
        }
    } else {
        fs.writeFileSync(fileName, "");
        db = new AdmZip();
        const tempBuffer = db.toBuffer()
        await cipherFile(key, iv, tempBuffer, fileName);
    }
}

activate();



const dir = join(__dirname, '..', 'public');
const serve = require('serve-static')(dir);

const server = polka({
    onNoMatch: (req, res, next) => {
        console.log("404 - " + req.originalUrl);
        next();
    }
});

function authFunction(req, res, next) {
    // make auth here
    console.log("AUTH HERE")
    next();
}

server
    .use('/api', authFunction)
    .use(fileUpload())
    .use(json())
    .use(urlencoded({ extended: true }))
    .use('/', serve);


server.post("/api/method/:methodName", async (req, res, next) => {
    try {
        if (req.params && req.params.methodName && methods[req.params.methodName]) {
            await methods[req.params.methodName]();
        }
    } catch (e) {

    }
    return;
});

server.post('/api/sendForm', (req, res) => {
    // analyse les données envoyé
    // renvoie les données stocké (selon les champs)
    res.end("data here");
});

server.post('/api/getData', (req, res) => {
    res.end("data here");
});

server.post('/api/setData', (req, res) => {
    // TODO
    req.body;
    res.end("data here");
});
server.post('/api/setFile', (req, res) => {
    let file = null;
    if (req.files) {
        if (req.files.uploaded && req.files.uploaded.data) {
            file = req.files.uploaded.data;
        }
    }
    if (file) {
        db.addFile("test.txt", file, ""); // TODO save
    }
    if (file) {
        res.end("file received");
    } else {
        res.end("file not received");
    }
});

server.listen(3000);

module.exports = server;