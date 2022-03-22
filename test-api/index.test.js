const URL = "http://localhost:3000";

const axios = require("axios");
const fetchData = (obj = {}) => {
    return axios(obj);
}

test('Test si le serveur est en ligne', () => {
    return fetchData({ url: `${URL}` }).then(data => {
        expect(data.status).toBe(200);
        expect(data.data).toMatch("<!DOCTYPE html>");
    })
});

test('Test /api/getData', () => {
    return fetchData({
        url: `${URL}/api/getData`,
        method: "post"
    }).then(data => {
        expect(data.data).toBe('data here');
    })
});