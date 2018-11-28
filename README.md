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

## Running

- Development mode: `npm start`
- Production mode: `npm run prod` — Note that unless you set the
`MONGODB_URI` environment variable, the app will use the value in the
`.env` file.

## Running the tests

1. `npm test`

There's no step 2!

## Coding style

We use `eslint` extending rules from [standard](https://standardjs.com/rules.html#javascript-standard-style).
For development, we use `pre-commit` to automatically run the linter before
committing. While this cam be skipped (with `git commit -n` or `git commit --no-verify`),
the linter must pass in CI before merging pull requests.

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
