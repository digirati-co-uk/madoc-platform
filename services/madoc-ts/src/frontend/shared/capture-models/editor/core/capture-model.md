# Capture model
You can use the simple `CaptureModel` provider and hooks to make it easier to write components that depend on the state of a particular capture model.

To use the provider, you will need to wrap all or some of your component tree in the capture model provider, passing it your capture model. If this is managed by state in the component rendering, when it changes, everything using the hook below will update automatically.

```jsx
function App() {
  return (
    <CaptureModelProvider captureModel={model}>
      <Component />
    </CaptureModelProvider>
  );
}
```  

Then in your components you will have the `useCaptureModel()` hook available:

```jsx
function TestComponent() {
  const { captureModel } = useCaptureModel();
  return <div>{captureModel.structure.label}</div>
}
```
