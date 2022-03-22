import Windows from "../sections/windows/windows.svelte"
import ProcessCrash from "../sections/windows/process-crash.svelte"

const defaultMenus = [
    {
        icon: "../assets/img/icons.svg",
        title: "Papier",
        links: [
            {
                title: "Create and manage <em>windows</em>",
                component: Windows,
            },
            {
                title: "Handling window <em>crashes and hangs</em>",
                component: ProcessCrash,
            },
        ],
    },
    {
        icon: "../assets/img/icons.svg",
        title: "Papier 2",
        links: [
            {
                title: "Create and manage <em>windows</em>",
                link: Windows,
            },
            {
                title: "Handling window <em>crashes and hangs</em>",
                link: ProcessCrash,
            },
        ],
    },
];

export {
    defaultMenus
}