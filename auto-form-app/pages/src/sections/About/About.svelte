<script>
    let output = "lol";
</script>

<p>About page !!</p>

<button
    on:mousedown={() => {
        fetch("http://localhost:3000/api/electron/startDrag", {
            headers: {
                authorization:
                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp0cnVlLCJpYXQiOjE2NTM3NjI5NTksImV4cCI6MTY1Mzg0OTM1OX0.nQZ9Q8UiduqX1YN5LWi_eVZfXEvNLnIv_8GAucROLqI",
            },
            method: "POST",
        });
    }}>drag</button
>

<button
    on:click={async () => {
        const resp = await fetch("http://localhost:3000/api/getFile", {
            headers: {
                "Content-type": "application/json",
                authorization:
                    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoIjp0cnVlLCJpYXQiOjE2NTM3NjI5NTksImV4cCI6MTY1Mzg0OTM1OX0.nQZ9Q8UiduqX1YN5LWi_eVZfXEvNLnIv_8GAucROLqI",
            },
            method: "POST",
            body: JSON.stringify({
                path: "general#trans:visa",
            }),
        });
        const name =
            resp.headers.get("Content-disposition").split("filename=")[1] ||
            "temp";
        const b = await resp.blob();
        var url = window.URL.createObjectURL(b);
        var a = document.createElement("a");
        a.href = url;
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }}>getFile</button
>
