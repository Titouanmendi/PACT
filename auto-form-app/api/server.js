const polka = require("polka");
const send = require("@polka/send-type");
const { json, urlencoded } = require("body-parser");
const fileUpload = require("express-fileupload");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { join } = require("path");
const { randomBytes } = require("crypto");
const process = require("process");
const methods = require("./methods");
const { getFromStore, Store, getFromStoreCallback } = require("./store");
const CODES = require("./error-codes");
const DB = require("./db");
const dir = join(__dirname, "..", "public");
const serve = require("serve-static")(dir);

let PORT = 3000;
if (process.env.PORT) {
    PORT = 4000;
}

let db = null;
let SECRET_KEY = getFromStore("SECRET_KEY", randomBytes(32).toString("base64"));

const server = polka({
    onNoMatch: (req, res, next) => {
        console.log("404 - " + req.originalUrl);
        next();
    },
});

function authFunction(req, res, next) {
    // make auth here
    // console.log(req.originalUrl + " -> " + "AUTH HERE")
    let token = req.headers["authorization"];
    if (!token) {
        return send(res, 403); // when no token
    }
    if (!token.startsWith("Bearer ")) {
        return send(res, 400, {
            data: null,
            infos: {
                code: CODES.BAD_HEADER,
            },
        });
    }
    token = token.slice(7, token.length);
    try {
        jwt.verify(token, SECRET_KEY);
    } catch (err) {
        return send(res, 403);
    }
    next();
}

const login = async (req, res, next) => {
    let password = req.body.password;
    if (password) {
        const passwordHash = await getFromStoreCallback(
            "PASSWORD",
            async () => {
                return await bcrypt.hash("PASSWORD", 10);
            }
        );
        const match = await bcrypt.compare(password, passwordHash);
        if (match) {
            const token = jwt.sign(
                {
                    auth: true,
                },
                SECRET_KEY,
                {
                    expiresIn: 24 * 60 * 60,
                }
            );
            return send(res, 200, {
                data: token,
                infos: null,
            });
        }
        return send(res, 400, {
            data: null,
            infos: {
                code: CODES.INCORRECT_PASSWORD,
            },
        });
    }
    return send(res, 400, {
        data: null,
        infos: {
            code: CODES.NO_PASSWORD,
        },
    });
};

server
    .use(fileUpload())
    .use(json())
    .use(urlencoded({ extended: true }))
    .use("/login", login)
    .use("/api", authFunction)
    .use("/", serve);

server.post("/api/electron/:methodName", async (req, res, next) => {
    try {
        if (
            req.params &&
            req.params.methodName &&
            methods[req.params.methodName]
        ) {
            await methods[req.params.methodName]();
        }
    } catch (e) {}
    return;
});

server.post("/api/isOpen", (req, res) => {
    if (db === null) {
        return send(res, 200, {
            data: false,
            infos: null,
        });
    }
    return send(res, 200, {
        data: true,
        infos: null,
    });
});

server.post("/api/open", async (req, res) => {
    if (db !== null) {
        return send(res, 400, {
            data: null,
            infos: {
                code: CODES.DB_ALREADY_OPEN,
            },
        });
    }
    db = await DB.open();
    send(res, 200, {
        data: true,
        infos: null,
    });
});

server.post("/api/close", async (req, res) => {
    await DB.save(db); // save
    db = null; // close db
    send(res, 200, {
        data: true,
        infos: null,
    });
});

server.post("/api/sendForm", (req, res) => {
    // analyse les données envoyé
    // renvoie les données stocké (selon les champs)
    res.end("data here");
});

server.post("/api/getData", (req, res) => {
    if (db === null) {
        return send(res, 400, {
            data: null,
            infos: {
                code: CODES.DB_NOT_OPEN,
            },
        });
    }
    if (req.body && req.body.path) {
        const data = DB.get(db, req.body.path);
        return send(res, 200, {
            data: data || [],
            infos: null,
        });
    }
    return send(res, 400, {
        data: null,
        infos: {
            code: CODES.EMPTY_BODY,
        },
    });
});

server.post("/api/setData", async (req, res) => {
    if (db === null) {
        return send(res, 400, {
            data: null,
            infos: {
                code: CODES.DB_NOT_OPEN,
            },
        });
    }
    if (req.body && req.body.name) {
        await DB.set(db, req.body.name, req.body.value);
        return send(res, 200, {
            data: true,
            infos: null,
        });
    }
    return send(res, 400, {
        data: null,
        infos: {
            code: CODES.EMPTY_BODY,
        },
    });
});

server.post("/api/changeListen", (req, res) => {
    const store = new Store();
    const listen = store.get("listen");
    if (listen && listen === "127.0.0.1") {
        store.set("listen", "0.0.0.0");
    } else {
        store.set("listen", "127.0.0.1");
    }
    return send(res, 200, {
        data: true,
        infos: null,
    });
});

server.post("/api/setFile", (req, res) => {
    if (db === null) {
        return send(res, 400, {
            data: null,
            infos: {
                code: CODES.DB_NOT_OPEN,
            },
        });
    }
    let file = null;
    let fieldName = "";
    let fileName = "";
    if (req.files) {
        if (req.files.uploaded && req.files.uploaded.data) {
            file = req.files.uploaded.data;
            if (req && req.headers && req.headers["content-disposition"]) {
                fieldName =
                    req.headers["content-disposition"]
                        .split("fieldname=")[1]
                        .split(";")[0] || "";
                fileName =
                    req.headers["content-disposition"].split("filename=")[1] ||
                    "";
            }
        }
    }
    if (file) {
        db.addFile(fieldName, file, `file;filename=${fileName}`);
        DB.save(db);
        return send(res, 200, {
            data: true,
            infos: null,
        });
    }
    return send(res, 400, {
        data: false,
        infos: null,
    });
});

const listen = getFromStore("listen", "127.0.0.1");

server.listen(PORT, listen);

module.exports = server;
