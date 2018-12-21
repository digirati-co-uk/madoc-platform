# Madoc platform

## Background

_Madoc_ is an Omeka S based platform for the display, enrichment, and curation of IIIF-based digital objects.

![](https://i.imgur.com/HSDXvUL.png)


You can use _Madoc_ to:

* Assemble digital objects from one or more publishers and build an interpretative web site around them.
* Build your own collections from around the world.
* Enhance existing descriptions of digitised content with your own editorial content.
* Annotate digital objects from archives, libraries and museums with your own commentary, transcriptions and other material.
* Run a crowdsourcing project and invite others to contribute.

_Madoc_ is built on:

* IIIF [Presentation](https://iiif.io/api/presentation/2.1) and [Image](https://iiif.io/api/image/2.1/) APIs
* W3C [Web Annotation data model](https://www.w3.org/TR/annotation-model/) and [protocol](https://www.w3.org/TR/annotation-protocol/)
* [Annotation Studio](https://annotation-studio.digirati.com/)
* [Elucidate](https://github.com/dlcs/elucidate-server) annotation server
* Madoc [vocabularies](https://github.com/digirati-co-uk/annotation-vocab)
* [Omeka S](https://omeka.org/s/)

_Madoc_ is the product of work for three projects/institutions:

* Indigenous Digital Archive: a project from the [Museum of Indian Arts and Culture](http://indianartsandculture.org/) in Santa Fe, New Mexico.
* Crowdsourcing Platform for Wales: a project with the [National Library of Wales](https://www.library.wales/), funded by the Welsh government, to build a reusable IIIF-based crowdsourcing platform.
* DARIAH-VL VRE Service Infrastructure project: [Ghent Centre for Digital Humanities ](https://www.ghentcdh.ugent.be/).


## Documentation

Full documentation for the platform can be found here.

[https://madoc.netlify.com/](https://madoc.netlify.com/)

### Installation

Get started quickly with the Madoc Platform with Docker and a prebuilt database, with our modules configured.

To get started, pull down the madoc-platform repository

```
$ git clone https://github.com/digirati-co-uk/madoc-platform.git
```

Move into the repository, and run

```
$ ./bin/madoc init
```

This will set up the site, you can start it at any time by running:
```
$ ./bin/madoc start
```

You should now be able to access the site at [http://localhost:8888](http://localhost:8888) and the W3C annotation server at [http://localhost:8889](http://localhost:8889).

You can stop the service at any time using

```
$ ./bin/madoc stop
```

If you want to view the logs of the running containers, you can run:
```
$ ./bin/madoc logs
```

This is process is intended for local development environments only. You shold refer to our deployment documentation to install on to a server.

This software comes bundled with a helper application, `./bin/madoc` which has the following commands:


```
./bin/madoc


   Omeka command line helpers


Available commands:

  init                      Initialise dev environment
  lint-module <module>      Lint a single module
  lint-all                  Lint all modules
  clean                     Clean up, opposite of init
  git-all <command>         Run git command on all linked repos (e.g. git-all status)
  git <module> <command>    Run git command in single module
  status <module>           Git status on single module
  start                     Starts up fresh set of docker containers (detached)
  stop                      Stops all containers
  logs                      Show and tail the logs in the docker containers

Server commands:

  server-init                Initialise server environment
  server-start               Starts containers using server docker compose
  server-stop                Stops all containers
  server-rebuild             Rebuilds all containers. WARNING: deletes containers before rebuilds
  server-logs                Show and tail the logs in the server docker containers
  server-down                Bring server down and remove containers
```

#### Logging in
If you use the provided database a new Admin user will be created with the following details:
```
username: admin@example.org
password: Testpass123_
```

#### System requirements

We bundle a full annotation server into our distribution. You can change this in the docker-compose.yaml file if you need to. With the annotation server, we recommend running with at least 4GB of memory free.

## Next Steps

We would like to develop Madoc further and welcome funded projects and collaborations to add new features. 

We would like to turn our attention to:

* Integrated search using the IIIF Search API and a rich _Madoc_ advanced search API to search across:
    *  Omeka objects
    *  IIIF Presentation API resources and their metadata
    *  Web Annotations
* Better tools for transcription and integration with existing transcription platforms, handwriting recognition,  and OCR tools.
* More user interface enhancements with a wider range of viewing experiences and themes.
* Support for AV collections.


## Contribution Guidelines


Please feel free to raise Github issues for bugs, or new feature requests.

## LICENSE

Omeka S is licensed under the GPL, and the license information can be found here:

https://github.com/omeka/omeka-s/blob/develop/LICENSE

For Digirati developed code provided as part of this installation, we use the MIT License. 

_Madoc_ is an aggregate, as per the GNU GPL FAQ, https://www.gnu.org/licenses/gpl-faq.en.html#MereAggregation and the GPL does not apply to Digirati products, including, but not limited to, [Annotation Studio](https://annotation-studio.digirati.com/) and [Elucidate](https://github.com/dlcs/elucidate-server), which are provided as part of this bundle.

MIT License

Copyright Digirati Ltd. (c) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
