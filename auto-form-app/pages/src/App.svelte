<script>
    import { fade } from "svelte/transition";
    import sections from "./sections/index";
    import Navigation from "./Navigation/Navigation.svelte";
    import allDatas from "./data/index";
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
    let visible = false;
    const timer = () => {
        setTimeout(() => {
            visible = true;
        }, 200);
    };
    changeNav(sections.About);
</script>

<Navigation {changeNav} />

{#if visible}
    <main in:fade class="content">
        <svelte:component this={actualPage} data={dataPage} name={data_title} />
    </main>
{/if}

<style>
    .content {
        flex: 1;
        position: relative;
        overflow: auto;
    }
</style>
