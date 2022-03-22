const polka = require("polka");
const { json } = require('body-parser');
const methods = require("./methods");

const { join } = require('path');
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
    .use(json())
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

server.post('/api/setData', (req, res) => {
    res.end("data here");
});
server.post('/api/getData', (req, res) => {
    res.end("data here");
});

server.listen(3000);