<script>
    export let changeNav = null;
    import { defaultMenus } from "./defaultMenus";
    import { translate } from "../../useful";
    import Pages from "../sections/index";
    const othersMenus = [];

    const menus = [...defaultMenus, ...othersMenus];

    const changeNavClick = (indexMenu, indexLink) => {
        const component = menus[indexMenu].links[indexLink].component;
        changeNav(component);
    };
    let value = "";
    const test = () => {
        fetch("http://localhost:3000/api/method/openFileFolder", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ toto: "lol" }),
        }).then((e) => {
            value = "END";
        });
    };
</script>

<nav class="nav js-nav is-shown">
    <header class="nav-header">
        <h1 class="nav-title"><strong>Auto-Form</strong></h1>
        <img class="nav-header-icon" src="./img/auto_form.svg" alt="logo" />
    </header>
    {#if defaultMenus.length > 0}
        {#each defaultMenus as oneMenu, indexMenu}
            <div class="nav-item u-category-windows">
                <h5 class="nav-category">
                    <svg class="nav-icon">
                        <use xlink:href={oneMenu.icon} />
                    </svg>
                    {translate(oneMenu.title)}
                </h5>
                {#each oneMenu.links as oneLinks, indexLink}
                    <button
                        type="button"
                        on:click={() => {
                            changeNavClick(indexMenu, indexLink);
                        }}
                        class="nav-button"
                    >
                        {translate(oneLinks.title)}
                    </button>
                {/each}
            </div>
        {/each}
    {/if}

    <footer class="nav-footer">
        <button
            type="button"
            class="nav-footer-button"
            on:click={() => {
                changeNav(Pages.About);
            }}>About</button
        >
        <button
            type="button"
            on:click={() => {
                test();
            }}
            class="nav-footer-button">val : {value}</button
        >
    </footer>
</nav>

<style>
    .nav-title {
        text-align: center;
    }
</style>
