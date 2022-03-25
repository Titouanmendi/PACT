
import Pages from "../sections/index"

const defaultMenus = [
    {
        icon: "../public/img/icons.svg",
        title: "Papier",
        links: [
            {
                title: "trans:identity-papers-citizenship",
                component: Pages.IdentityCard,
                links: [
                    {
                        title: "trans:house",
                        component: Pages.House,
                    }
                ]
            },
            {
                title: "trans:family-JENESAISPAS",
                component: Pages.House,
            },
            {
                title: "trans:transports",
                component: Pages.House,
            },
            {
                title: "trans:work-unemployment-income",
                component: Pages.House,
            },
            {
                title: "trans:housing",
                component: Pages.House,
            },
            {
                title: "trans:taxes",
                component: Pages.House,
            },
            {
                title: "trans:healthcare",
                component: Pages.House,
            },
            {
                title: "trans:leisure",
                component: Pages.House,
            },
            {
                title: "trans:foreigner",
                component: Pages.House,
            },
            {
                title: "trans:identification",
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