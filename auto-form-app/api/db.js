const fs = require("fs");
const AdmZip = require("adm-zip");
const { cipherFile, decipherFile } = require("./lib");
const { Store } = require("./store");
const { resolve } = require("path");

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
    let tempBuffer = null;
    try {
        if (db === null) {
            return "DB_IS_NULL";
        }
        let currentConfig = new Store();
        const fileName = currentConfig.get("fileName");
        const key = currentConfig.get("key");
        const iv = currentConfig.get("iv");
        tempBuffer = db.toBuffer();
        await cipherFile(key, iv, tempBuffer, fileName);
    } catch (e) {
        console.log(e);
    }
};

// const toBuffer = async (db) => {
//     return new Promise((resolve, reject) => {
//         db.toAsyncBuffer(
//             (buff) => {
//                 resolve(buff);
//             },
//             (e) => {
//                 console.log(e);
//                 reject(null);
//             }
//         );
//     });
// };

const get = (db, name) => {
    if (db === null) {
        return "DB_IS_NULL";
    }
    let results = [];
    const entries = db.getEntries();
    entries.forEach(function (zipEntry) {
        if (zipEntry.entryName.startsWith(name)) {
            if (zipEntry.entryName == name) {
                // need to JSON.parse
                let data = zipEntry.getData().toString();
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    data = [];
                }
                for (const oneData of data) {
                    results.push({
                        entryName: oneData.name,
                        name: oneData.name,
                        value: oneData.value,
                    });
                }
            } else {
                results.push(zipEntry);
            }
        }
    });
    return results;
};

const set = async (db, key, value) => {
    const entryName = key.split(";")[0];
    const correctEntry = db.getEntries().find(function (zipEntry) {
        if (zipEntry.entryName == entryName) {
            return true;
        }
        return false;
    });
    let arrayData = [];
    if (correctEntry) {
        try {
            arrayData = JSON.parse(correctEntry.getData().toString());
        } catch (e) {
            arrayData = [];
        }
    }
    // check if present
    const index = arrayData.findIndex((el) => {
        return el.name === key;
    });
    if (index > -1) {
        arrayData[index] = {
            name: key,
            value: value,
        };
    } else {
        arrayData.push({
            name: key,
            value: value,
        });
    }
    const str = JSON.stringify(arrayData);
    // save
    if (correctEntry) {
        db.deleteFile(correctEntry);
    }
    db.addFile(entryName, Buffer.from(str, "utf8"), `var`);
    await save(db);
};

module.exports = {
    open,
    save,
    get,
    set,
};
