const polka = require("polka");
const send = require('@polka/send-type');
const { json, urlencoded } = require('body-parser');
const fileUpload = require('express-fileupload');
const { join } = require('path');
const methods = require("./methods");
const DB = require("./db");
const dir = join(__dirname, '..', 'public');
const serve = require('serve-static')(dir);

let db = null;

const server = polka({
    onNoMatch: (req, res, next) => {
        console.log("404 - " + req.originalUrl);
        next();
    }
});

function authFunction(req, res, next) {
    // make auth here
    console.log(req.originalUrl + " -> " + "AUTH HERE")
    next();
}

server
    .use('/api', authFunction)
    .use(fileUpload())
    .use(json())
    .use(urlencoded({ extended: true }))
    .use('/', serve);


server.post("/api/electron/:methodName", async (req, res, next) => {
    try {
        if (req.params && req.params.methodName && methods[req.params.methodName]) {
            await methods[req.params.methodName]();
        }
    } catch (e) {

    }
    return;
});

server.post('/api/isOpen', (req, res) => {
    if (db === null) {
        return send(res, 200, {
            data: false,
            infos: null
        });
    }
    return send(res, 200, {
        data: true,
        infos: null
    });
});

server.post('/api/open', async (req, res) => {
    if (db !== null) {
        return send(res, 400, {
            data: null,
            infos: {
                code: "DB_ALREADY_OPEN"
            }
        });
    }
    db = await DB.open();
    send(res, 200, {
        data: true,
        infos: null
    });
});

server.post('/api/close', async (req, res) => {
    await DB.save(db); // save
    db = null; // close db
    send(res, 200, {
        data: true,
        infos: null
    });
});

server.post('/api/sendForm', (req, res) => {
    // analyse les données envoyé
    // renvoie les données stocké (selon les champs)
    res.end("data here");
});

server.post('/api/getData', (req, res) => {
    if (req.body) {
        // TODO
        return send(res, 200, {
            data: "TODO",
            infos: null
        });
    }
    return send(res, 400, {
        data: null,
        infos: {
            code: "EMPTY_BODY"
        }
    });
});

server.post('/api/setData', (req, res) => {
    if (req.body) {
        return send(res, 200, {
            data: true,
            infos: null
        });
    }
    return send(res, 400, {
        data: null,
        infos: {
            code: "EMPTY_BODY"
        }
    });
});
server.post('/api/setFile', (req, res) => {
    if (db === null) {
        return send(res, 400, {
            data: null,
            infos: {
                code: "DB_NOT_OPEN"
            }
        });
    }
    let file = null;
    if (req.files) {
        if (req.files.uploaded && req.files.uploaded.data) {
            file = req.files.uploaded.data;
        }
    }
    if (file) {
        db.addFile("test.txt", file, "");
        // TODO save
        return send(res, 200, {
            data: true,
            infos: null
        });
    }
    return send(res, 400, {
        data: false,
        infos: null
    });
});

server.listen(3000);

module.exports = server;