# IIIF Builder
An extension to Hyperion framework for building and editing IIIF resources in a vault store.


## Creating new manifests
```js
const builder = new IIIFBuilder();

builder.createManifest('http://example.org/manifest-1', manifest => {
  manifest.addLabel('My manifest', 'en');
  
  manifest.summary = { en: ['Summary of this manifest'] };
  
  
});
```


### Creating Presentation 3.0 MVM
Source: https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json
```js

const builder = new IIIFBuilder();

builder.createManifest(
  'https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json', 
  manifest => {
    manifest.addLabel('Image 1', 'en');
    manifest.createCanvas('https://iiif.io/api/cookbook/recipe/0001-mvm-image/canvas/p1', canvas => {
      canvas.width = 1800;
      canvas.height = 1200;
      canvas.createAnnotation(
        'https://iiif.io/api/cookbook/recipe/0001-mvm-image/annotation/p0001-image',
        {
          id: 'https://iiif.io/api/cookbook/recipe/0001-mvm-image/annotation/p0001-image',
          type: 'Annotation',
          motivation: 'painting',
          body: {
            id: 'http://iiif.io/api/presentation/2.1/example/fixtures/resources/page1-full.png',
            type: 'Image',
            format: 'image/png',
            height: 1800,
            width: 1200
          }
        }
      );
    })
  }
);
```

### Serialising
You always work with IIIF Presentation 3 with the builder.

```js
const builder = new IIIFBuilder();

const myManifest = builder.createManifest('http://example.org/manifest-1', manifest => {
  manifest.addLabel('My manifest', 'en');
});

builder.toPresentation2(myManifest); // presentation 2 manifest
builder.toPresentation3(myManifest); // presentation 3 manifest

```

## Editing resources

You can pass in your own Vault instance and edit resources in your vault. When changes
are made to resources any subscribers to the vault (such as React) will be notified, 
allowing UI to be kept in sync.

```js

const vault = new Vault();
const builder = new IIIFBuilder(vault);

// Load from somewhere
const manifestRef = await vault.loadManifest('http://example.org/manifest-1.json');

builder.editManifest('http://example.org/manifest-1.json', manifest => {
  manifest.setLabel({ en: ['Some different label'] });
});

// Elsewhere in your code (usually handled by framework abstraction)
vault.subscribe(
  s => s.hyperion.entities.Manifest['http://example.org/manifest-1.json'].label, 
  newLabel => {
    console.log('Label changed => ', newLabel)
  }
);
```

## Framework integrations

**Still a work in progress**

```js

function ManifestLabelEditor() {
  const manifest = useManifest();
  const editor = useEditor(manifest);
  const [value, setValue] = useState(manifest.label.en[0]);
  
  return <>
    <input 
      type="text"
      value={value}
      onChange={e => setValue(e.target.value)} 
    />
    <button onClick={() => editor.setLabel({ en: [value] })}>
      save changes
    </button>
   </>;
}

```
