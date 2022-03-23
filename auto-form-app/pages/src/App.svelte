<script>
    import { fade } from "svelte/transition";
    import sections from "./sections/index";
    import Navigation from "./Navigation/Navigation.svelte";
    let actualPage = null;
    const changeNav = (newComponent) => {
        visible = false;
        if (newComponent) {
            actualPage = newComponent;
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
        <svelte:component this={actualPage} />
    </main>
{/if}

<style>
    .content {
        flex: 1;
        position: relative;
        overflow: hidden;
    }
</style>
