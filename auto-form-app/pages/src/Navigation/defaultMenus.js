
import Pages from "../sections/index"

const defaultMenus = [
    {
        icon: "../public/img/icons.svg",
        title: "Papier",
        links: [
            {
                title: "trans:identity-card",
                component: Pages.IdentityCard,
                links: [
                    {
                        title: "trans:house",
                        component: Pages.House,
                    }
                ]
            },
            {
                title: "trans:house",
                component: Pages.House,
            },
        ],
    },
    {
        icon: "../public/img/icons.svg",
        title: "Papier 2",
        links: [
            {
                title: "Create and manage <em>windows</em>",
                link: Pages.IdentityCard,
            },
            {
                title: "Handling window <em>crashes and hangs</em>",
                link: Pages.House,
            },
        ],
    },
];

export {
    defaultMenus
}