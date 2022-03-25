<script>
    export let changeNav = null;
    import { defaultMenus } from "./defaultMenus";
    import { translate } from "../../useful";
    import Pages from "../sections/index";
    const othersMenus = [];

    const menus = [...defaultMenus, ...othersMenus];

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
                {#each oneMenu.links as oneLinks}
                    <div
                        class="menu"
                        on:click={() => {
                            oneLinks.visible = !oneLinks.visible;
                        }}
                    >
                        <p type="button" class="nav-button">
                            {translate(oneLinks.title)}
                        </p>
                        <span>{oneLinks.visible ? "-" : "+"}</span>
                    </div>
                    {#if oneLinks.links && oneLinks.visible}
                        {#each oneLinks.links as oneSubLink}
                            <p
                                type="button"
                                on:click={() => {
                                    changeNav(oneSubLink.component);
                                }}
                                class="nav-button subMenus"
                            >
                                {translate(oneLinks.title)}
                            </p>
                        {/each}
                    {/if}
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
    .menu {
        display: flex;
        width: 100%;
        padding: 0.3rem;
        line-height: 2;
    }
    p {
        margin: 0px;
    }
    .menu > span {
        flex: 0.1;
    }
    .nav-button {
        background-color: transparent;
        padding-left: calc(2rem + 16px + 0.5rem);
        text-align: left;
        font: inherit;
        font-size: 13px;
        color: inherit;
        border: none;
        cursor: default;
        outline: none;
        flex: 0.9;
    }
    .menu:hover {
        background-color: hsla(0, 0%, 0%, 0.1);
    }
    .subMenus:hover {
        background-color: hsla(0, 0%, 0%, 0.1);
    }
    .subMenus {
        padding: 0.3rem;
        padding-left: calc(2rem + 4rem);
    }
    .nav-title {
        text-align: center;
    }
    /* .nav-button.is-selected {
        background-color: var(--color-accent);
    }
    .nav-button.is-selected,
    .nav-button.is-selected em {
        color: #fff;
    }
    .nav-button.is-selected:focus {
        opacity: 0.8;
    } */
</style>
