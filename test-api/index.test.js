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
        body: JSON.stringify({
            "name": "toto",
            "value": 'lol'
        })
    }).then(data => {
        expect(data.data).toBe('data here');
    })
});

test('Close server', () => {
    server.server.close();
});