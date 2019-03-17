# Proyecto Final - Sistema de Posicionamiento en Interiores | Final Project - Indoor Positioning System

## API

API for estimating indoor location based on sensor data received by
mobile devices.

## Getting Started

These instructions will get you a copy of the project up and running on
your local machine for development and testing purposes.

### Prerequisites

- Node >= 10.9.0 < 11 - [downloads for 10.9.0](https://nodejs.org/dist/v10.9.0/)
  - **NOTE:** Node Version Manager (NVM) is highly recommended to use
  multiple versions of Node without conflict.  Use [nvm](https://github.com/creationix/nvm)
  for Linux/OS X, or [nvm-windows](https://github.com/coreybutler/nvm-windows)
  for Windows.
- MongoDB - [download link](https://www.mongodb.com/download-center/community)


### Installing

1. Clone repo
1. If you don't have the correct version of Node already, `nvm install 10.9.0`
1. `npm install`

## Environment setup

This app uses `.env` files to set environment-specific (and potentially
secret) settings. **All fields specified in `.env.example` must be present
and not empty either in an `.env[.ENVIRONMENT]` file or set externally
for the app to start**. See [dotenv-safe](https://www.npmjs.com/package/dotenv-safe#example) for
more details.

Each environment has its own `.env.ENVIRONMENT` file, except for
`development` which uses plain `.env`.

## Running

0. Copy `.env.example` to `.env[.ENVIRONMENT]` and set appropriate values
(see [Environment Setup](#environment-setup) for more details) 
1. Start the app:
    - Development mode: `npm run start:dev`
    - Production mode: `npm run start:prod`
1. Browse the interactive documentation by visiting `/api-docs`

## Running the tests

1. `npm test`

There's no step 2!

## Coding style

We use `eslint` extending rules from [standard](https://standardjs.com/rules.html#javascript-standard-style).
For development, we use `pre-commit` to automatically run the linter before
committing. While this cam be skipped (with `git commit -n` or `git commit --no-verify`),
the linter must pass in CI before merging pull requests.

The API's endpoints are documented following the OpenAPI 2.0 spec (formerly
known as Swagger).  We use `swagger-express-router` to map the endpoints
to code, so all routing is driven from the Swagger documentation.  Also
thanks to this the API has a browsable, interactive documentation endpoint
`/api-docs` powered by `swagger-ui-express`.

## Authentication

Most endpoints require authentication via a JWT sent in the traditional way
(ie. HTTP header `Authorization: Bearer <TOKEN>`). Note that **the api does
not provide a login endpoint**. The JWTs are signed and verified with a
public/private keypair (asymmetric cryptography). The process is as follows:
1. Both the [admin app](https://github.com/PF-ITBA-SPI/SPI-calibracion)
and the [user app](https://github.com/PF-ITBA-SPI/SPI-android-app) each
have a private key
1. The API has both corresponding public keys
1. When an app makes a request to the API, the app signs a JWT with its
private key and sends it with the HTTP header `Authorization: Bearer <TOKEN>`
1. When the API receives a request, it checks the `Authorization` HTTP header
and, if present, decodes the JWT with each public key. Decodification will
only succeed for the matching public key, if any. This way, the API can:
    - Certify whether the request comes from an authorized user
    - If the request comes from an authorized user, know which user
    (ie. which app) the request comes from
1. The API sets the permissions corresponding to the authenticated user,
and checks whether the user  has permission to access the requested endpoint

### Auth Setup
1. Generate an RSA keypair with `ssh-keygen`. You will get a private key
(no extension) and a public key (`.pub` extension).
1. Copy the private key to the app's `secret.properties` file. See the app's
README for details about this.
1. Convert the public key to PEM format (the private key is already in PEM format):
`ssh-keygen -f PUBLIC_KEY_PATH -m "PEM" -e > OUTPUT_FILE`. If you want
to output to stdout, leave out the redirection (`> OUTPUT_FILE`), but
file output is recommended for the next step
1. Replace all newlines with `\n`, so that everything is in one line. For example:
```text
-----BEGIN RSA PUBLIC KEY-----
line1
line2
...
-----END RSA PUBLIC KEY-----
```
becomes
```text
-----BEGIN RSA PUBLIC KEY-----\nline1\nline2\n...\n-----END RSA PUBLIC KEY-----
```
5. Copy the result into the `.env` file for your environment, under either
the `USER_PUBLIC_KEY` or `ADMIN_PUBLIC_KEY` key as appropriate (see
[Environment Setup](#environment-setup) for more details about .env files).
**The key must be surrounded in double quotes!**
6. Final result in your `.env` file:
```text
...
USER_PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----\nline1\nline2\n...\n-----END RSA PUBLIC KEY-----"
ADMIN_PUBLIC_KEY="-----BEGIN RSA PUBLIC KEY-----\nline1\nline2\n...\n-----END RSA PUBLIC KEY-----"
...
```

## Deployment

1. Create a Pull Request
1. Get it approved and make sure CI passes
1. Merge to `master`
1. Commits to `master` are automatically deployed to Heroku after a
successful build in Travis.

## Authors

**TODO**

See also the list of [contributors](https://github.com/PF-ITBA-SPI/SPI-api/graphs/contributors)
who participated in this project.

## License

** TODO **
