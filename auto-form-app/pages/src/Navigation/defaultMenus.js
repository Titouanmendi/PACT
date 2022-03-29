
import Pages from "../sections/index"

const defaultMenus = [

    {
        icon: "../public/img/icons.svg",
        links: [
            {
                title: "trans:identity-papers-citizenship",
                links: [
                    {
                        title: "trans:general",
                        component: Pages.Custom,
                    },
                    {
                        title: "trans:contact",
                        component: Pages.Custom,
                    }
                ]
            },
            {
                title: "trans:family-dependent",
                links: [
                    {
                        title: "trans:booklet",
                        component: Pages.Custom,
                    },
                    {
                        title: "trans:partner",
                        component: Pages.Custom,
                    },
                    {
                        title: "trans:kids_Id",
                        component: Pages.Custom,
                    },
                    {
                        title: "trans:dependent_Id",
                        component: Pages.Custom,
                    },

                ],
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
                        title: "trans:principal_residence",
                        component: Pages.House,
                    },
                    {
                        title: "trans:secondary_residence",
                        component: Pages.House,
                    },
                ],
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:taxes-money",
                component: Pages.TaxesMoney,
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:healthcare",
                component: Pages.Healthcare,
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:leisure",
                component: Pages.Leisure,
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:foreigner",
                component: Pages.Foreigner,
            },
            {
                icon: "../public/img/icons.svg",
                title: "trans:identification",
                component: Pages.Identification,
            },
        ],
    },
];

export {
    defaultMenus
}