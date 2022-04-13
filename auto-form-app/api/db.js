
const fs = require("fs");
const AdmZip = require("adm-zip");
const { cipherFile, decipherFile } = require("./lib");
const { Store } = require("./store");

const open = async () => {
    let currentConfig = new Store();
    const fileName = currentConfig.get("fileName");
    const key = currentConfig.get("key");
    const iv = currentConfig.get("iv");
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
        await save(db);
    }
    return db;
};

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
    save,
}