#Sorting room

##Overview
Application for creating IIIF manifests from other manifests

##Prerequisites
* Node (check your version: ```node -v```)


## Table of Contents

* [Requirements](#requirements)
* [Quick start](#quick-start)
* [Tests](#tests)
* [Documentation](#documentation)
* [License](#license)


## Requirements:

* [Node v6.2.0](https://nodejs.org/en/)
	* Check your version using ```node -v```
* [Yarn](https://github.com/yarnpkg/yarn)
  * ```npm install -g yarn```
* [Grunt](http://gruntjs.com/)
 	* ```npm install -g grunt grunt-cli```

## Quick Start

Install all dependencies listed above.

```sh
yarn install
grunt
```

## Tests

```sh
grunt test
```

If you get the error **Error: No selenium server jar found at the specified location** run ```./node_modules/protractor/bin/webdriver-manager update```


## Documentation

### Grunt Commands

|             Task             |                                            Description                                           |
|----------------------------|------------------------------------------------------------------------------------------------|
| ```grunt```                  | Builds all site assets, starts server and browsersync |
| ```grunt dist```              | Builds all site assets to dist folder(?) |
| ```grunt test```             | Run tests |
|```grunt styleguide```	| Generates styleguide |

### ITCSS

* [ITCSS](https://www.xfive.co/blog/itcss-scalable-maintainable-css-architecture/)
* **Tools** – globally used mixins and functions. It’s important not to output any CSS in the first 2 layers.
* **Generic** – reset and/or normalize styles, box-sizing definition, etc. This is the first layer which generates actual CSS.
* **Elements** – styling for bare HTML elements (like H1, A, etc.). These come with default styling from the browser so we can redefine them here.
* **Objects** – class-based selectors which define undecorated design patterns, for example media object known from OOCSS
* **Components** – specific UI components. This is where majority of our work takes place and our UI components are often composed of Objects and Components
* **Trumps** – utilities and helper classes with ability to override anything which goes before in the triangle, eg. hide helper class

## Running on docker

### Build container

From the root folder:

`docker build -t digirati/sorting-room:latest .`

Running the container:

`docker run -p 3000:3000 digirati/sorting-room:latest`

then browse `http://localhost:3000/`

## License

MIT Licensed. See [LICENSE](LICENSE)
