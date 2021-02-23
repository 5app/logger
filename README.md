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
