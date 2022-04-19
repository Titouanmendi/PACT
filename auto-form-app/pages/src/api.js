let access_token = "";

const URL_SERVER = "http://localhost:3000";

const getPassword = () => {
    if (
        window &&
        window.localStorage &&
        window.localStorage.getItem("password")
    ) {
        return window.localStorage.getItem("password");
    } else {
        return null;
    }
};

export const saveData = async (list) => {
    debugger;
    for (const oneElement of list) {
        if (oneElement.type === "file") {
            await setFile(oneElement.value, oneElement.name);
        } else {
            await setData(
                JSON.stringify({
                    name: oneElement.name,
                    value: oneElement.value,
                })
            );
        }
    }
};

export const setPassword = (password) => {
    if (window && window.localStorage) {
        window.localStorage.setItem("password", password);
    }
};

export const setData = async (body) => {
    const data = await fetch(`${URL_SERVER}/api/setData`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
        },
        method: "POST",
        body: body,
    });
    return await data.json();
};

export const getData = async (body) => {
    const data = await fetch(`${URL_SERVER}/api/getData`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`,
        },
        method: "POST",
        body: body,
    });
    return await data.json();
};

export const login = () => {
    const pass = getPassword();
    if (pass) {
        return fetch(`${URL_SERVER}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                password: pass,
            }),
        })
            .then(async (resp) => {
                const json = await resp.json();
                if (json.data !== null) {
                    access_token = json.data;
                    await openDB();
                } else {
                    throw "BAD_PASSWORD";
                }
            })
            .catch(() => {
                throw "ERROR";
            });
    } else {
        throw "NO_PASS";
    }
};

export const openDB = async () => {
    const data = await fetch(`${URL_SERVER}/api/open`, {
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
        method: "POST",
    });
    return await data.json();
};

export const setFile = async (body, nameOfField = "", nameOfFile = "") => {
    const data = await fetch(`${URL_SERVER}/api/setFile`, {
        headers: {
            "Content-Disposition": `attachment;fieldname=${nameOfField};filename=${nameOfFile}`,
            Authorization: `Bearer ${access_token}`,
        },
        method: "POST",
        body: body,
    });
    return await data.json();
};
