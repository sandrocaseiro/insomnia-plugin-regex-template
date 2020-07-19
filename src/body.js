const iconv = require('iconv-lite');
const jq = require('jsonpath');
const { query: queryXPath } = require('insomnia-xpath');

function matchJSONPath(bodyStr, query) {
    let body;
    let results;

    try {
        body = JSON.parse(bodyStr);
    }
    catch (err) {
        throw new Error(`Invalid JSON: ${err.message}`);
    }

    try {
        results = jq.query(body, query);
    }
    catch (err) {
        throw new Error(`Invalid JSONPath query: ${query}`);
    }

    if (results.length === 0)
        throw new Error(`Returned no results: ${query}`);
    else if (results.length > 1)
        throw new Error(`Returned more than one result: ${query}`);

    if (typeof results[0] !== 'string')
        return JSON.stringify(results[0]);
    else
        return results[0];
}

function matchXPath(bodyStr, query) {
    const results = queryXPath(bodyStr, query);

    if (results.length === 0)
        throw new Error(`Returned no results: ${query}`);
    else if (results.length > 1)
        throw new Error(`Returned more than one result: ${query}`);

    return results[0].inner;
}

module.exports = function(context, response, filter) {
    const sanitizedFilter = filter.trim();
    const bodyBuffer = context.util.models.response.getBodyBuffer(response, '');
    const match = response.contentType.match(/charset=([\w-]+)/);
    const charset = match && match.length >= 2 ? match[1] : 'utf-8';

    // Sometimes iconv conversion fails so fallback to regular buffer
    let body;
    try {
        body = iconv.decode(bodyBuffer, charset);
    }
    catch (err) {
        body = bodyBuffer.toString();
        console.warn('[response] Failed to decode body', err);
    }

    if (sanitizedFilter.indexOf('$') === 0)
        return matchJSONPath(body, sanitizedFilter);
    else
        return matchXPath(body, sanitizedFilter);
};
