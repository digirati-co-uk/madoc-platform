# Annotation Studio Module
This module provides various rich javascript components that can consume IIIF content and author W3C annotations onto that content, displaying it back in a variety of ways.

## Requirements
This module has no hard dependencies on other modules, but we have created a reference implementation: [IIIF Storage](https://github.com/digirati-co-uk/madoc-platform/tree/master/repos/annotation-studio). 

### Dependencies
- Omeka
- PHP 7.2+
- Composer
- IIIF Storage implementation

### Required events
As mentioned, the IIIF Storage reference implementation fires the following events that this module listens to in order to generate the components to be used in Omeka templates. If you want to create your own implementations using the [IIIF PHP library](https://github.com/digirati-co-uk/iiif-php), then you must implement the following event:

Event name: `iiif.canvas.view`
Event Variables:
- **resourceTemplateId** - Identifier of resource template to drive annotation UI.
- **canvas** - [IIIF Canvas object](https://github.com/digirati-co-uk/iiif-php/blob/master/src/Model/Canvas.php)
- **manifest** - [IIIF Manifest object](https://github.com/digirati-co-uk/iiif-php/blob/master/src/Model/Manifest.php)

_Note: you can bypass the need for events and bootstrap the Annotation Studio yourself [following our event implementation](https://github.com/digirati-co-uk/omeka-annotation-studio-module/blob/master/Module.php#L89)._

## Usage
_Note: Our examples will be using twig templates, there is no dependency on this however_

Once you have a view implementation, in your template you need the following as a minimum to get the annotation studio working:
```twig
{# This first line passes HTML attributes that are picked up by javascript in order to start the state management #}
<div {{ annotationStudio.core | raw }}></div>

{# This line is optional if you want to bundle the annotation studio javascript yourself, but this is the easiest way to get up and running. This will inject a script tag #}
{{ annotationStudio.getAssets() | raw }}
```

Now you can start adding components throughout your page. We have 3 components that are available. You will need to configure the annotation studio with resource templates and an annotation server that accepts W3C annotations. 

### Image Viewer
Most IIIF canvases are painted with an image. Its a basic requirement to be able to show the image in a deep zoom or static way, with annotated regions highlighted.
```twig
<div {{ annotationStudio.viewerNew | raw }}>
  <img src="{{ canvas.getThumbnail() }}" alt="{{ canvas.thumbnailAlt or canvas.getLabel() }}"/>
</div>
```
In this example, we use the same HTML attributes pattern as above. This will provide all the information needed to render the component. We've also provided a non-js fallback of a static image. We've also utilised custom meta-data in the [IIIF PHP library](https://github.com/digirati-co-uk/iiif-php/blob/master/src/Model/WithMetaData.php#L31) with a `canvas.thumbnailAlt` property.

In the module settings you can toggle between a static image viewer and Open Sea Dragon for deep zooming. 

### Annotation Editor
This is the flag-ship component of this module. It adds the ability to create new annotations using a capture model _(meta: needs link)_ and post it to an annotation server. Digirati's implementation can be found [here](https://github.com/dlcs/elucidate-server)
```twig
<div {{ annotationStudio.editor | raw }}>
   {#Add new annotation here.#}
</div>
```
There is no configuration for this directly currently. The whole UI is driven by Madoc resource template (JSON-LD document with special context).

### Annotation display
The annotations created are shown on the viewer by default. However we also expose a way to show regions of the image that has been annotated. This is useful as it will update instantly as new annotations are created.
```twig
<div {{ annotationStudio.regionAnnotations | raw }}>
   <!-- non javascript implementation would go here -->
</div>
```

## Adding new components:
_Important Note: Currently we do not have a full API available to create external extensions or plugins. We are fully orientated around a [plugin arcitecture](https://github.com/digirati-co-uk/omeka-annotation-studio-module/blob/master/asset/src/index.js#L23). If you want to fork this repository and maintain your own plugins, in the future it will be trivial to split these out._

A plugin or component is very simple, it is a function with the following signature:
```typescript
function ($el: HTMLElement, attributes: Object, store: ReduxStore) : void
```

You are not required to use React or Redux libraries to create components, although they are already bundled and are what we use internally.

### Example React Component
Register it in 
```jsx
const AnnotationCounter = AnnotationStudio.connector(props =>
  <div>
    Total region annotations { props.regionAnnotations }
  </div>
);

register['annotation-studio-annotation-counter'] = function ($el, attributes, store) {
  return ReactDOM.render((
      <Redux.Provider store={store}>
        <AnnotationCounter>
      </Redux.Provider>
    ), $el);
}
```

Create a [PHP model](https://github.com/digirati-co-uk/omeka-annotation-studio-module/blob/master/src/Components/RegionAnnotations.php):
```php
class RegionCounter implements AnnotationStudio\Components\Component 
{
    use AnnotationStudio\Components\WithAttributes;

    public function getBehaviour() : string
    {
        return 'annotation-studio-annotation-counter';
    }
}
```

And [register it in PHP](https://github.com/digirati-co-uk/omeka-annotation-studio-module/blob/master/Module.php#L99)
```php
$annotationStudio->addComponent(
    'regionCounter',
    new RegionCounter()
);
```

Use it in twig:

```twig
<div {{ annotationStudio.regionCounter | raw }}>
  Counter is loading...
</div>
```

### Example Vanilla JS component
```javascript
register['annotation-studio-annotation-counter'] = function ($el, attributes, store) {
  let prevCount = 0;
  store.subscribe(() => {
    // This gets called every time the state changes.
    const state = store.getState();
    const currentCount = Object.keys(state.elucidate.annotations).length;
    // We can avoid updating by checking what is already rendered
    if (currentCount !== prevCount) {
      $el.innerHtml = `<div>Total region annotations ${ currentCount }</div>`;
      prevCount = currentCount;
    }
  });
}
```

The PHP steps are the same as above.

