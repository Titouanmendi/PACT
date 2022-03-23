const allRoutes = {
    ping: async () => {
        let ans;
        await fetch("http://localhost:3000/api/setData", {
            method: "post"
        }).then(async (data) => {
            ans = await data.json();
        })
        return ans;
    }
}

export {
    allRoutes
}
