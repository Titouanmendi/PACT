<script>
    import { fade } from "svelte/transition";
    import sections from "./sections/index";
    import Navigation from "./Navigation/Navigation.svelte";
    import allDatas from "./data/index";
    let actualPage = null;
    let dataPage = null;
    const changeNav = (newComponent, data = "") => {
        visible = false;
        if (newComponent) {
            actualPage = newComponent;
        }
        if (data && allDatas[data]) {
            dataPage = allDatas[data];
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
        <svelte:component this={actualPage} data={dataPage} />
    </main>
{/if}

<style>
    .content {
        flex: 1;
        position: relative;
        overflow: hidden;
    }
</style>
