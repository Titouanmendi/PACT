const modifyDOM = () => {
    const forms = document.querySelectorAll("form");
    const interrestings = [
        "for",
        "value",
        "name",
        "type",
        "pattern",
        "placeholder",
        "localName",
        "id",
    ];
    const destroyItem = (item) => {
        debugger;
        let res = {};
        if (item.children) {
            res.children = [];
            for (const oneChild of item.children) {
                res.children.push(destroyItem(oneChild));
            }
        }
        for (const oneInterest of interrestings) {
            if (item[oneInterest]) {
                res[oneInterest] = item[oneInterest];
            }
        }
        return res;
    };
    const results = [];
    for (const oneForm of forms) {
        results.push(destroyItem(oneForm));
    }
    return results;
};

export { modifyDOM };
