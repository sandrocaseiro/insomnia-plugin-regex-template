function isFilterableField(field) {
    return field !== 'raw' && field !== 'url';
}

function validateArgs(field, requestId, filter, regexGroup) {
    if (!['body', 'header', 'raw', 'url'].includes(field))
        throw new Error(`Invalid response field ${field}`);

    if (!requestId)
        throw new Error('No request specified');

    if (isFilterableField(field) && !filter)
        throw new Error(`No ${field} filter specified`);

    if (regexGroup < 0)
        throw new Error(`Regex group index must be greater than or equal to 0.`);
}

function validateResponse(response) {
    if (!response) {
        console.log('[response tag] No response found');
        throw new Error('No responses for request');
    }

    if (response.error) {
        console.log('[response tag] Response error ' + response.error);
        throw new Error('Failed to send dependent request ' + response.error);
    }

    if (!response.statusCode) {
        console.log('[response tag] Invalid status code ' + response.statusCode);
        throw new Error('No successful responses for request');
    }
}

module.exports = {
    isFilterableField,
    validateArgs,
    validateResponse
};
