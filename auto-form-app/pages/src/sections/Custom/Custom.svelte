<script>
    import { translate } from "../../../useful";
    import { setFile } from "../../api";
    export let data = [];
    export let name = "";
</script>

<div id="main">
    <div class="header-top">
        <h2>{translate(`trans:${name}`)}</h2>
    </div>
    <hr />
    <div class="body">
        {#each data as oneInput}
            <div class="one-input">
                <p>{translate(oneInput.translate)}</p>
                {#if oneInput.type == "file"}
                    <input
                        type="file"
                        on:input={(e) => {
                            const file = e.target.files[0];
                            const formData = new FormData();
                            formData.append("uploaded", file);
                            setFile(formData);
                        }}
                    />
                {:else}
                    <input type={oneInput.type} />
                {/if}
            </div>
        {/each}
    </div>
</div>

<style>
    input {
        font-family: inherit;
        font-size: inherit;
        -webkit-padding: 0.4em 0;
        padding: 0.4em;
        margin: 0 0 0.5em 0;
        box-sizing: border-box;
        border: 1px solid #ccc;
        border-radius: 2px;
    }

    input:disabled {
        color: #ccc;
    }
    #main {
        overflow: auto;
    }
    .header-top {
        padding: 20px;
    }
    .header-top > h2 {
        text-align: center;
        margin: 0px;
        text-transform: uppercase;
    }
    hr {
        margin: 0px;
    }
    .body {
        padding: 20px;
    }
    .one-input {
        margin-bottom: 10px;
    }
    .one-input > p {
        margin: 0px;
        text-transform: capitalize;
    }
</style>
