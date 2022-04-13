
const fs = require("fs");
const AdmZip = require("adm-zip");
const bcrypt = require("bcrypt");
const { randomBytes } = require("crypto");
const { cipherFile, decipherFile } = require("../lib");
const Store = require("./store");

const open = async (password = "") => {
    let currentConfig = new Store();
    const fileName = currentConfig.get("fileName");
    const key = currentConfig.get("key");
    const iv = currentConfig.get("iv");
    const passwordHash = currentConfig.get("passwordHash") || "";
    const match = await bcrypt.compare(password, passwordHash);
    if (match) {
        console.log("open")
    }
    let db = null;
    if (fs.existsSync(fileName)) {
        try {
            const buff = await decipherFile(key, iv, fileName, null);
            db = new AdmZip(buff);
        } catch (e) {
            db = new AdmZip();
        }
    } else {
        db = new AdmZip();
        save(db);
    }
    return db;
};

const setPassword = async (password = randomBytes(32).toString()) => {
    let currentConfig = new Store();
    const hash = await bcrypt.hash(password, 10);
    currentConfig.set("hash", hash);
}

const save = async (db) => {
    if (db === null) {
        return "DB_IS_NULL";
    }
    let currentConfig = new Store();
    const fileName = currentConfig.get("fileName");
    const key = currentConfig.get("key");
    const iv = currentConfig.get("iv");
    const tempBuffer = db.toBuffer();
    await cipherFile(key, iv, tempBuffer, fileName);
}

module.exports = {
    open,
    setPassword,
    save,
}