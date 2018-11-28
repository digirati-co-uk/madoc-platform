# Omeka-S Resource Provider

## Installation

1. Clone this repository in to the modules folder of your omeka-s installation (the name of the folder you clone in to will need to be "ResourceProvider" for namespace reasons)
2. In the omeka-s admin panel, go in to the modules section and install the module
3. In the same areas select to Configure module , adding Elucidate Server to use.
4. Module now uses Composer to manage dependencies. So 'composer install' required.

Endpoints:

### GET provider
```
GET /resource-provider/:id
{
  resource: { ... },
  template: { ... }
}
```
Given resource ID (create from resource template) it will return the resource and resource template it was created from.

### POST provider
```
POST /resource-provider/:id
{
  ... JSON LD (annotation) ...
}
```

Given resource ID and JSON LD document from post body, it will fetch the resource and populate fields onto inputted JSON LD. It will then dispatch an event in Zend passing the JSON document as part of the event.

### GET resources
```
GET /my-site/resource-templates(?type={annotation})
```

Will find all resources (with templates) for a given site in a collection format of `GET provider`

## Annotation Proxy/Decoration
### POST provider
```
POST /resource-provider/augment/:containerId
{
  ... JSON LD (annotation) ...
}
```
Recieve request from FE annotation-studio posting annotation body, decorate Json, submit to elucidate server, and return json encoded response
