# Madoc TS

## Adding new components to UXPin

Like storybook, there is a folder specifically for UXPin components. To create a component run (from madoc-ts folder):
```
node generate-uxpin-component.js ComponentName
```
This will create the files you need and a starting point. The file will be created under `src/uxpin-merge/01-atoms/ComponentName`. There are 2 files:

- **ComponentName.tsx**: This must be a React component with typed props and should wrap the component in UXPin. 
- **presets/0-default.jsx**: This is a preset for your component above. It should render with a set of default props. Make sure the component has `uxpId="some-random-id"` property with some unique id.

Once you have created your component you can add it to the `uxpin.config.js`
```diff
module.exports = {
  components: {
    categories: [
      {
        name: 'Atoms',
        include: [
          'src/uxpin-merge/01-atoms/Button/Button.tsx',
          'src/uxpin-merge/01-atoms/Breadcrumbs/Breadcrumbs.tsx',
          'src/uxpin-merge/01-atoms/CanvasStatus/CanvasStatus.tsx',
          'src/uxpin-merge/01-atoms/AdminHeader/AdminHeader.tsx',
          'src/uxpin-merge/01-atoms/Mirador/Mirador.tsx',
+         'src/uxpin-merge/01-atoms/ComponentName/ComponentName.tsx',
        ],
      },
    ],
    wrapper: './src/uxpin-merge/UXPinWrapper.js',
    webpackConfig: './webpack.uxpin.js',
  },
  name: 'UXPin Merge - Madoc',
};
```

## Debugging props

So far I have run into a few common errors with props not appearing in the component.

1. Missing `uxpId` property on the preset
2. Unable to show UI for arrays of objects - feels like a bug. I tried to simplify all of the props to primitive values.
3. React error - check the console while testing
4. Bad path format in include. I found that `./src/uxpin-merge/...` broke, but `src/uxpin-merge/...` worked. This was due to options passed to the typescript compiler when trying to figure out the props. The component will still render!

To debug and make sure your props are appearing you can run:
```
yarn uxpin-server
```
Which will show a debug screen. Alternatively you can look at `.uxpin/metadata.json` and see the raw output there.

## Previewing in experiment mode

If you are logged into UXPin you can debug your components directly in the UXPin UI by running:
```
yarn uxpin
```

This will listen for changes to your components and refresh - although I found this to be unreliable and slow at times - does not appear to be incremental.

## Publishing to UXPin
As we are on the v2 branch, a work-around for publishing is required.

On this repository: https://github.com/digirati-co-uk/madoc-uxpin

You can run:
```
yarn upgrade @madoc
```
Commit the change to the lockfile and then run:
```
yarn uxpin-push --token [uxpin-token]
```
To publish to UXPin. Hopefully this can be easily automated.
