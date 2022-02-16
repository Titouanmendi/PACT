<script>
    export let changeNav = null;
    const menus = [
        {
            icon: "../assets/img/icons.svg",
            title: "Papier",
            links: [
                {
                    title: "Create and manage <em>windows</em>",
                    link: "windows-windows",
                },
                {
                    title: "Handling window <em>crashes and hangs</em>",
                    link: "windows-crashHang",
                },
            ],
        },
        {
            icon: "../assets/img/icons.svg",
            title: "Papier 2",
            links: [
                {
                    title: "Create and manage <em>windows</em>",
                    link: "windows-windows",
                },
                {
                    title: "Handling window <em>crashes and hangs</em>",
                    link: "windows-crashHang",
                },
            ],
        },
    ];
    const changeNavClick = (indexMenu, indexLink) => {
        const string = menus[indexMenu].links[indexLink].link;
        changeNav(string);
    };
    console.log(menus);
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
        <img
            class="nav-header-icon"
            src="../assets/auto_form.svg#icon-windows"
            alt="logo"
        />
    </header>
    {#if menus.length > 0}
        {#each menus as oneMenu, indexMenu}
            <div class="nav-item u-category-windows">
                <h5 class="nav-category">
                    <svg class="nav-icon">
                        <use xlink:href={oneMenu.icon} />
                    </svg>
                    {oneMenu.title}
                </h5>
                {#each oneMenu.links as oneLinks, indexLink}
                    <button
                        type="button"
                        on:click={() => {
                            changeNavClick(indexMenu, indexLink);
                        }}
                        class="nav-button"
                    >
                        {@html oneLinks.title}
                    </button>
                {/each}
            </div>
        {/each}
    {/if}

    <footer class="nav-footer">
        <button type="button" class="nav-footer-button">About</button>
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
