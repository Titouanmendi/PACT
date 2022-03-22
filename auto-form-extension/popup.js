document.getElementById("changeColor").addEventListener("click", function (event) {
    event.target.style.color = "red";
    fetch("http://localhost:3000/api/setData", {
        method: "post"
    }).then(() => {
        debugger;
        event.target.style.color = "blue";
        document.getElementById("changeColor").innerHTML = "OK";
    });
});
