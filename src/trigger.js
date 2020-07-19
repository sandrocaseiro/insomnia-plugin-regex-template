function shouldResend(context, response, triggerBehavior, maxAgeSeconds) {
    let shouldResend = false;
    if (context.context.getExtraInfo('fromResponseTag'))
        shouldResend = false;
    else if (triggerBehavior === 'never')
        shouldResend = false;
    else if (triggerBehavior === 'no-history')
        shouldResend = !response;
    else if (triggerBehavior === 'when-expired') {
        if (!response)
            shouldResend = true;
        else {
            const ageSeconds = (Date.now() - response.created) / 1000;
            shouldResend = ageSeconds > maxAgeSeconds;
        }
    }
    else if (triggerBehavior === 'always')
        shouldResend = true;

    const fromResponseTag = context.context.getExtraInfo('fromResponseTag');
    if (fromResponseTag) {
        console.log('[response tag] Preventing recursive render');
        shouldResend = false;
    }

    return shouldResend;
}


module.exports = {
    shouldResend
};
