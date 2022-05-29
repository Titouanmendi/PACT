import { ping, log, setToken, sendForm } from "./routes.js";
import { modifyDOM, fillDOM } from "./injection.js";

const button = document.getElementById("changeColor");
const bigContent = document.getElementById("big-content");
const defaultPart = document.getElementById("default-part");
const passwordPart = document.getElementById("password-part");
const result = document.getElementById("result");

button.addEventListener("click", async function (event) {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript(
        {
            target: { tabId: tab.id, allFrames: true },
            function: modifyDOM,
        },
        async (results) => {
            let res = {};
            if (typeof results !== "undefined" && results && results[0]) {
                res = results[0].result;
            }
            result.innerHTML = JSON.stringify(res, null, 4);
            const resp = await sendForm(res);
            if (resp && resp.data) {
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    function: fillDOM,
                    args: [resp.data],
                });
            }
        }
    );
});

const addPassword = () => {
    defaultPart.style.display = "none";
    passwordPart.style.display = "block";
    document.getElementById("set-password").onclick = async () => {
        const newPass = document.getElementById("password-input").value;
        await chrome.storage.local.set({ password: newPass });
        startLog();
    };
};

const startLog = () => {
    log().then((data) => {
        if (data && data.infos && data.infos.code === "INCORRECT_PASSWORD") {
            document.getElementById("password-txt").innerHTML = "Bad password";
            addPassword();
        } else if (typeof data === "string" && data === "NO_PASS") {
            addPassword();
        } else if (data && typeof data.data === "string") {
            setToken(data.data);
            bigContent.style.backgroundColor = "green";
        } else {
            bigContent.style.backgroundColor = "red";
        }
    });
};
startLog();
