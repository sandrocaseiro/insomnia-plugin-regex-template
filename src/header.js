module.exports = function (response, filter) {
    const sanitizedFilter = filter.trim();
    const headers = response.headers;
    if (!headers.length)
        throw new Error('No headers available');

    const header = headers.find(h => h.name.toLowerCase() === filter.toLowerCase());

    if (!header) {
        const names = headers.map(c => `"${c.name}"`).join(',\n\t');
        throw new Error(`No header with name "${filter}".\nChoices are [\n\t${names}\n]`);
    }

    return header.value;
};
