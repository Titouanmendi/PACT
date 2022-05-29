<script>
    let output = "lol";
</script>

<div>
    <img src="./img/auto_form.svg" alt="logo" />
    <p class="title">Marre de remplir des formulaires ? AutoForm !</p>
    <hr />
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
</div>

<style>
    div {
        width: 100%;
        height: 100%;
        font-size: 20px;
        text-align: center;
        margin-top: 20%;
    }
    .title {
        font-weight: bold;
        font-family: "BlinkMacSystemFont", "Lucida Grande", "Segoe UI", Ubuntu, Cantarell, sans-serif;
        margin: 0px;
    }
</style>
