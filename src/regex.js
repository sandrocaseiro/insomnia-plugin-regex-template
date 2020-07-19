const insomnia = require('./insomnia');
const validate = require('./validate');
const trigger = require('./trigger');

const headerFilter = require('./header');
const urlFilter = require('./url');
const rawFilter = require('./raw');
const bodyFilter = require('./body');

module.exports = {
    name: 'regex',
    displayName: 'Regex',
    description: 'Extract a value via regular expression',
    args: [
        {
            displayName: 'Attribute',
            type: 'enum',
            options: [
                {
                    displayName: 'Reponse - Body Attribute',
                    description: 'value of response body',
                    value: 'body',
                },
                {
                    displayName: 'Reponse - Raw Body',
                    description: 'entire response body',
                    value: 'raw',
                },
                {
                    displayName: 'Reponse - Header',
                    description: 'value of response header',
                    value: 'header',
                },
                {
                    displayName: 'Reponse - Request URL',
                    description: 'Url of initiating request',
                    value: 'url',
                },
            ],
        },
        {
            displayName: 'Request',
            type: 'model',
            model: 'Request',
        },
        {
            type: 'string',
            encoding: 'base64',
            hide: args => !validate.isFilterableField(args[0].value),
            defaultValue: '',
            displayName: args => {
                switch (args[0].value) {
                    case 'body':
                        return 'Filter (JSONPath or XPath)';
                    case 'header':
                        return 'Header Name';
                    default:
                        return 'Filter';
                }
            },
        },
        {
            displayName: 'Regex Pattern',
            encoding: 'base64',
            type: 'string',
            defaultValue: ''
        },
        {
            displayName: 'Regex Group Index',
            type: 'number',
            defaultValue: 0
        },
        {
            displayName: 'Trigger Behavior',
            help: 'Configure when to resend the dependent request',
            type: 'enum',
            defaultValue: 'never',
            options: [
                {
                    displayName: 'Never',
                    description: 'never resend request',
                    value: 'never',
                },
                {
                    displayName: 'No History',
                    description: 'resend when no responses present',
                    value: 'no-history',
                },
                {
                    displayName: 'When Expired',
                    description: 'resend when existing response has expired',
                    value: 'when-expired',
                },
                {
                    displayName: 'Always',
                    description: 'resend request when needed',
                    value: 'always',
                },
            ],
        },
        {
            displayName: 'Max age (seconds)',
            help: 'The maximum age of a response to use before it expires',
            type: 'number',
            hide: args => args[6].value !== 'when-expired',
            defaultValue: 60,
        },
    ],
    async run(context, field, requestId, filter, regexPattern, regexGroup, triggerBehavior, maxAgeSeconds) {
        validate.validateArgs(field, requestId, filter, regexGroup);

        let response = await insomnia.getResponseAsync(context, requestId);
        const shouldResend = trigger.shouldResend(context, response, triggerBehavior, maxAgeSeconds);

        if (shouldResend && context.renderPurpose === 'send') {
            console.log('[response tag] Resending dependency');
            response = await context.network.sendRequest(request, [
                { name: 'fromResponseTag', value: true },
            ]);
        }

        validate.validateResponse(response);

        let result = '';
        if (field === 'header')
            result = headerFilter(response, filter);
        else if (field === 'url')
            result = urlFilter(response);
        else if (field === 'raw')
            result = rawFilter(context, response);
        else if (field === 'body')
            result = bodyFilter(context, response, filter);
        else
            throw new Error(`Unknown field ${field}`);
        
        if (!regexPattern)
            return result;
        
        const match = result.match(regexPattern);
        if (!match)
            throw new Error(`Regex pattern not found in "${result}".`);
        else if (match.length < regexGroup - 1)
            throw new Error(`Regex group index ${regexGroup} not found. Regex pattern returned ${match.length} groups.`)
        
        return match[regexGroup];
    }
};
