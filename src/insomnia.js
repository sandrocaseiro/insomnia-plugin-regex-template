async function getRequestAsync(context, requestId) {
    const request = await context.util.models.request.getById(requestId);
    if (!request)
        throw new Error(`Could not find request ${requestId}`);

    return request;
}

async function getResponseAsync(context, requestId) {
    await getRequestAsync(context, requestId);

    const environmentId = context.context.getEnvironmentId();
    let response = await context.util.models.response.getLatestForRequestId(requestId, environmentId);

    return response;
}

module.exports = {
    getRequestAsync,
    getResponseAsync
};
