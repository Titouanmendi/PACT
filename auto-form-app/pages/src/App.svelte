<script>
    import { fade } from "svelte/transition";
    import sections from "./sections/index";
    import Navigation from "./Navigation/Navigation.svelte";
    import allDatas from "./data/index";
    import { login, setPassword } from "./api";
    let actualPage = null;
    let dataPage = null;
    let data_title = "";
    const changeNav = (newComponent, dataCode = "") => {
        visible = false;
        if (newComponent) {
            actualPage = newComponent;
        }
        if (dataCode && allDatas[dataCode]) {
            data_title = dataCode;
            dataPage = allDatas[dataCode];
        } else {
            dataPage = [];
        }
        timer();
    };
    let password = "";
    let needSetPassword = true;
    let visible = false;
    const timer = () => {
        setTimeout(() => {
            visible = true;
        }, 200);
    };
    changeNav(sections.About);
    const tryLogin = async () => {
        try {
            await login();
            needSetPassword = false;
        } catch (e) {
            debugger;
            if (e === "NO_PASS") {
                needSetPassword = true;
            } else if (e === "ERROR") {
                // wtf ?
            } else if (e === "BAD_PASSWORD") {
                needSetPassword = true;
            }
        }
    };
    tryLogin();
</script>

{#if needSetPassword}
    <p>password</p>
    <input bind:value={password} />
    <button
        on:click={(e) => {
            setPassword(password);
            tryLogin();
        }}
    >
        Ok
    </button>
{:else}
    <Navigation {changeNav} />

    {#if visible}
        <main in:fade class="content">
            <svelte:component
                this={actualPage}
                data={dataPage}
                name={data_title}
            />
        </main>
    {/if}
{/if}

<style>
    .content {
        flex: 1;
        position: relative;
        overflow: auto;
    }
</style>
