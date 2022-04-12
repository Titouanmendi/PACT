const FormData = require('form-data');
const fs = require('fs');
const URL = "http://localhost:3000";

const axios = require("axios");
const fetchData = (obj = {}) => {
    return axios(obj);
}

const server = require("../auto-form-app/api/server");

test('Test si le serveur est en ligne', () => {
    return fetchData({ url: `${URL}` }).then(data => {
        expect(data.status).toBe(200);
        expect(data.data).toMatch("<!DOCTYPE html>");
    })
});


test('Test /api/getData', () => {
    return fetchData({
        url: `${URL}/api/getData`,
        method: "POST"
    }).then(data => {
        expect(data.data).toBe('data here');
    })
});


test('Test /api/setData', () => {
    return fetchData({
        url: `${URL}/api/setData`,
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify({
            "name": "toto",
            "value": 'lol'
        })
    }).then(data => {
        expect(data.data).toBe('data here');
    })
});

test('Test /api/setFile', () => {
    var form = new FormData();
    const file = fs.createReadStream('./temp.txt');
    form.append('uploaded', file, {
        filename: 'temp.tx',
        filepath: '/temp.txt',
        contentType: 'text/plain',
        knownLength: fs.statSync("./temp.txt").size
    });
    return fetchData({
        url: `${URL}/api/setFile`,
        method: "POST",
        data: form,
        headers: {
            ...form.getHeaders(),
            "Content-Length": form.getLengthSync(),
        },
    }).then(data => {
        expect(data.data).toBe('file received');
    })
});

test('Close server', () => {
    server.server.close();
});