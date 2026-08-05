# logger

> Simple console logger that outputs json in prod and pretty messages on dev

## Usage
```sh
npm install --save @5app/logger
```

```javascript
const logger = require('@5app/logger');

logger.info('An email was sent', {
  email: 'customer@5app.com',
  template: 'template1',
});

logger.error(new Error('Unknown playlist 123'));
```

## Options

The logger can optionally be customised using the following environment variables:

- `LOGS_FORMAT`: if set to `json`, the logger will log messages in json format instead of pretty messages (default behaviour).
- `LOGS_LEVEL`: minimum logging level, by default it will be `debug`. Accepted values are `'debug'`, `'info'`, `'warn'`, and `'error'`
- `TAG`: release tag (e.g. docker image tag) to be added to the log messages

## Logging levels

Logging levels are (from lower to higher priority): `'debug'`, `'info'`, `'warn'`, and `'error'`.
The logger provides the logging functions with the following signatures: `logger.<level>(message, objectOrError)`

Here is an example of how the logger can be used:
```javascript
logger.error('An error happened', new ApiError('The api call failed', 404)); // will log the message, the error message, the stack trace, and the statusCode error property
logger.warn('Be warned', {a: 1, b: Date.now(), c: 'some string'});
logger.info('An event happened', {a: 1, b: Date.now(), c: 'some string'});
logger.debug('A minor operation', {a: 1, b: Date.now(), c: 'some string'});
```

## Slack alerts

`logger.slackAlert([level], message, ...)` logs like the regular level functions above, but prepends `slackAlert ` to the message and adds a random `slackAlertId` (via [`crypto.randomUUID()`](https://nodejs.org/api/crypto.html#cryptorandomuuidoptions)) to the logged context, generating one even if no context is provided. `level` is optional and defaults to `'error'`; when provided it must be one of `'debug'`, `'info'`, `'warn'`, or `'error'`. Any remaining arguments are forwarded as-is to `logger.<level>`, so they follow that level's own signature (e.g. `context` and `errorObject` for `'error'`, just `context` for the others).

This is intended for hooking up a log-shipping pipeline (e.g. a log processor that watches for the `slackAlert ` prefix) to post the message to Slack, using `slackAlertId` to correlate the Slack post back to the original log line, while still logging it at the given severity.

```javascript
logger.slackAlert('Payment provider is down', error); // level defaults to "error"
logger.slackAlert('warn', 'Queue depth is high', {depth: 1200}); // context is merged with {slackAlertId: '...'}
logger.slackAlert('warn', 'Queue depth is high'); // context defaults to {slackAlertId: '...'}
logger.slackAlert('error', 'Payment provider is down', {provider: 'stripe'}, error);
logger.slackAlert('error', 'Payment provider is down', error); // the (message, errorObject) shorthand also works; slackAlertId is added alongside the error details
```

Note: because `level` is detected by checking if the first argument is a known level string, passing an unrecognised level (e.g. a typo like `'eror'`) is not an error — it's silently read as `message` instead, with `level` defaulting to `'error'`.

## Fetching context dynamically

In addition to providing a context object, you can also use `logger.addContext` to provide a function which will be called on every log to get a context object.

This can be helpful if you are using [async_hooks](https://nodejs.org/docs/latest/api/async_hooks.html) or [cls-hooked](https://www.npmjs.com/package/cls-hooked) to store request metadata similarly to thread-local storage.

For instance, you can do the following without having to explicitly pass the `correlationId` to each log:
```javascript
const asyncLocalStorage = new AsyncLocalStorage();

expressApp.use((req, res, next) {
  const correlationId = req.get('X-Correlation-Id') || uuidV4();
  asyncLocalStorage.run({correlationId}, () => next());
});

logger.addContext(() => asyncLocalStorage.getStore());
logger.info('User profile updated', {userId: 1234});
```

And the output will look like:
```json
{"level":"info","timestamp":"2021-02-23T17:55:43.011Z","correlationId":"12bf5b37-e0b8-56e0-8dcf-dc8c4aefc123","userId":1234}
```
