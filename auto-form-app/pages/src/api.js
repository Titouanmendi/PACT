export const setFile = async (body) => {
    const data = await fetch("http://localhost:3000/api/setFile", {
        method: "POST",
        body: body,
    })
    return await data.json();
};