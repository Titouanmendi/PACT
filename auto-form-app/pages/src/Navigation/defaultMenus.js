
import Pages from "../sections/index"

const defaultMenus = [
    /* {
         icon: "../public/img/icons.svg",
         title: "Papier",
         links: [
             {
                 title: "trans:identity-papers-citizenship",
                 component: Pages.IdentityCard,
                 links: [
                     {
                         title: "trans:housing",
                         component: Pages.House,
                     }
                 ]
             },
             {
                 title: "trans:family-dependent",
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
                 title: "trans:taxes-money",
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
     },*/
    {
        icon: "../public/img/icons.svg",
        links: [
            {
                title: "trans:general",
                links: [
                    {
                        title: "trans:housing",
                        component: Pages.House,
                    }
                ]
            },
            {
                title: "trans:family-dependent",
                links: [
                    {
                        title: "trans:booklet",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:partner",
                        component: Pages.House,
                    },
                    {
                        title: "trans:kids_Id",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:dependent_Id",
                        component: Pages.House,
                    },

                ],
            },
            {
                title: "trans:contact",
                links: [
                    {
                        title: "trans:housing",
                        component: Pages.House,
                    }
                ]
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:transports",
                links: [
                    {
                        title: "trans:drivers_license",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:vehicle",
                        component: Pages.House,
                    },
                    {
                        title: "trans:public_transports",
                        component: Pages.House,
                    },

                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:work-unemployment-income",
                links: [
                    {
                        title: "trans:schooling",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:degrees",
                        component: Pages.House,
                    },
                    {
                        title: "trans:scholarship",
                        component: Pages.House,
                    },

                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:housing",
                links: [
                    {
                        title: "trans:",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:",
                        component: Pages.House,
                    },

                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:taxes-money",
                links: [
                    {
                        title: "trans:",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:",
                        component: Pages.House,
                    },

                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:healthcare",
                links: [
                    {
                        title: "trans:",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:",
                        component: Pages.House,
                    },

                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:leisure",
                links: [
                    {
                        title: "trans:",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:",
                        component: Pages.House,
                    },
                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:foreigner",
                links: [
                    {
                        title: "trans:",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:",
                        component: Pages.House,
                    },
                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:identification",
                links: [
                    {
                        title: "trans:",
                        component: Pages.IdentityCard,
                    },
                    {
                        title: "trans:",
                        component: Pages.House,
                    },
                ],
            },
        ],
    },
];

export {
    defaultMenus
}