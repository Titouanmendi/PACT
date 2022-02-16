<script>
    import sections from "./sections/index";
    import Navigation from "./navigation.svelte";
    console.log(window);
    let actualPage = sections.About;
    const changeNav = (newComponent) => {
        const [firstFolder, secondElement] = newComponent.split("-");
        if (sections[firstFolder][secondElement]) {
            actualPage = sections[firstFolder][secondElement];
            setTimeout(() => {
                const el = document.getElementsByClassName("section");
                if (el.length > 0) {
                    el[0].classList.add("is-shown");
                }
            }, 200);
        } else {
            actualPage = sections.About;
        }
    };
</script>

<Navigation {changeNav} />

<main class="content js-content is-shown">
    <svelte:component this={actualPage} />
</main>
