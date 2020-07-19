const iconv = require('iconv-lite');

module.exports = function(context, response) {
    const bodyBuffer = context.util.models.response.getBodyBuffer(response, '');
    const match = response.contentType.match(/charset=([\w-]+)/);
    const charset = match && match.length >= 2 ? match[1] : 'utf-8';

    // Sometimes iconv conversion fails so fallback to regular buffer
    try {
        result = iconv.decode(bodyBuffer, charset);
    }
    catch (err) {
        console.warn('[response] Failed to decode body', err);
        result = bodyBuffer.toString();
    }
};
