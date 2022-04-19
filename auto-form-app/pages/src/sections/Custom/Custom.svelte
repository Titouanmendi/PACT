<script>
    import { onMount } from "svelte";

    import { translate } from "../../../useful";
    import { getData, saveData } from "../../api";
    export let data = [];
    export let name = "";
    let listData = [];
    onMount(() => {
        getData(JSON.stringify({ path: name })).then((res) => {
            if (res && res.data && res.data.length > 0) {
                for (const oneElement of res.data) {
                    // put in data;
                    const correctName =
                        oneElement.entryName.split(";")[1] || "";
                    const index = data.findIndex((el) => {
                        return el.translate == correctName;
                    });
                    if (index > -1) {
                        if (
                            oneElement.comment &&
                            oneElement.comment.startsWith("file")
                        ) {
                            data[index].value = true;
                        } else {
                            data[index].value = oneElement.value;
                        }
                    }
                }
            }
        });
    });

    const addToList = (data) => {
        const index = listData.findIndex((el) => {
            return el.name === data.name;
        });
        if (index > -1) {
            listData[index] = data;
        } else {
            listData.push(data);
        }
    };
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
                            addToList({
                                name: `${name};${oneInput.translate}`,
                                type: oneInput.type,
                                value: formData,
                            });
                        }}
                    />
                {:else}
                    <input
                        type={oneInput.type}
                        value={oneInput.value || null}
                        on:input={(e) => {
                            // TODO check if already in array
                            addToList({
                                name: `${name};${oneInput.translate}`,
                                type: oneInput.type,
                                value: e.target.value,
                            });
                        }}
                    />
                {/if}
            </div>
        {/each}
        <button
            on:click={() => {
                console.log(listData);
                saveData(listData);
            }}
        >
            Save
        </button>
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
