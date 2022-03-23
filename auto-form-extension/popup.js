import { allRoutes } from "./routes.js";

const button = document.getElementById("changeColor");
const bigContent = document.getElementById("big-content");
const result = document.getElementById("result");

function modifyDOM() {
    const forms = document.querySelectorAll("form input");
    return forms.length;
}

button.addEventListener("click", async function (event) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.scripting.executeScript({
        target: { tabId: tab.id, allFrames: true },
        function: modifyDOM
    }, (results) => {
        let res = {};
        if (typeof results !== "undefined" && results && results[0]) {
            res = results[0]
        }
        result.innerHTML = JSON.stringify(res, null, 4);
    });
});

allRoutes.ping().then(() => {
    bigContent.style.backgroundColor = "green";
}).catch((error) => {
    bigContent.style.backgroundColor = "red";
});