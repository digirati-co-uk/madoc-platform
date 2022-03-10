// What does this need to do?
//
// 1) Be able to highlight or change the style of a rendered annotation via ID:
//
//     helper.withSelector(selector).highlight(); // => returns function that will clear highlight
//     helper.withSelector(selector).clearHighlight();
//
// 2) Be able to zoom to selector
//
//    helper.withSelector(selector).zoomTo();
//
// 3) Be able to register an event handler:
//
//    useEffect(() => {
//       return helper.withSelector(selectorId).addEventListener('click', () => { ... });
//    });
//
// 4) Be able to get preview of selector:
//
//    helper.withSelector(selectorId).getImagePreview();
//
// 5) Be able to listen to changes without going through redux:
//
//    helper.withSelector(selectorId).on('change', () => {});
//
//
// On the Atlas viewer side, we need a way to respond to all of the above.
//
// 1) Responding to highlights
//
//    controller.on('highlight', (selectorId) => { ... });
//
// 2) Responding to zooms
//
//    controller.on('zoom', (selectorId) => { ... });
//
// 3) Binding handlers
//
//    controller.withSelector(selectorId).on('eventListener', (selectorId, type, cb) => {
//
//      return () => {
//        // Clean up for unsubscribe.
//      }
//    });
//
// 4) Image preview.
//
//   controller.on('imagePreview', (selectorId) => {
//
//   })
//
// 5) Listening for changes.
//
//  controller.withSelector(selectorId).dispatch('change')

import React, { createContext, useContext, useMemo } from 'react';
import mitt, { Handler } from 'mitt';

const SelectorHelperReactContext = createContext(mitt());

export type SelectorHelperEventTypes =
  | 'click'
  | 'selector-updated'
  | 'highlight'
  | 'clear-highlight'
  | 'zoomTo'
  | 'event-listener'
  | 'remove-event-listener'
  | 'image-preview-request';

export const SelectorControllerProvider: React.FC = ({ children }) => {
  return (
    <SelectorHelperReactContext.Provider value={useMemo(() => mitt(), [])}>
      {children}
    </SelectorHelperReactContext.Provider>
  );
};

export function useSelectorEmitter() {
  return useContext(SelectorHelperReactContext);
}

export function useSelectorController() {
  const controller = useContext(SelectorHelperReactContext);

  return useMemo(
    () => ({
      withSelector(selectorId: string) {
        return {
          on<T extends { selectorId: string } = any>(type: SelectorHelperEventTypes, handler: Handler<T>) {
            const handlerWrapper: Handler<T> = ev => {
              if (ev && ev.selectorId === selectorId) {
                handler(ev);
              }
            };

            controller.on(type, handlerWrapper);
            return () => {
              controller.off(type, handlerWrapper);
            };
          },
          emit<T = any>(type: SelectorHelperEventTypes, event: T) {
            controller.emit(type, { ...event, selectorId });
          },
        };
      },
      on<T extends { selectorId: string } = any>(type: SelectorHelperEventTypes, handler: Handler<T>) {
        controller.on(type, handler);
        return () => {
          controller.off(type, handler);
        };
      },
      emit<T extends { selectorId: string } = any>(type: SelectorHelperEventTypes, event: T) {
        controller.emit(type, event);
      },
    }),
    [controller]
  );
}

export function useSelectorHelper() {
  const controller = useSelectorController();

  return useMemo(
    () => ({
      withSelector(selectorId: string) {
        return {
          highlight() {
            controller.emit('highlight', { selectorId });
          },
          clearHighlight() {
            controller.emit('clear-highlight', { selectorId });
          },
          zoomTo() {
            controller.emit('zoomTo', { selectorId });
          },
          addEventListener(name: string, callback: () => void) {
            controller.emit('event-listener', { selectorId, name, callback });
            return () => {
              controller.emit('remove-event-listener', { selectorId, name, callback });
            };
          },
          getImagePreview(): Promise<any> {
            return new Promise((resolve, reject) => {
              controller.emit('image-preview-request', { selectorId, resolve, reject });
            });
          },
          on<T extends { selectorId: string } = any>(type: SelectorHelperEventTypes, handler: Handler<T>) {
            return controller.withSelector(selectorId).on(type, handler);
          },
        };
      },
      highlight(selectorId: string) {
        controller.emit('highlight', { selectorId });
      },
      clearHighlight(selectorId: string) {
        controller.emit('clear-highlight', { selectorId });
      },
      zoomTo(selectorId: string) {
        controller.emit('zoomTo', { selectorId });
      },
      addEventListener(selectorId: string, name: string, callback: () => void) {
        controller.emit('event-listener', { selectorId, name, callback });
        return () => {
          controller.emit('remove-event-listener', { selectorId, name, callback });
        };
      },
      getImagePreview(selectorId: string): Promise<any> {
        return new Promise((resolve, reject) => {
          controller.emit('image-preview-request', { selectorId, resolve, reject });
        });
      },
      on<T extends { selectorId: string } = any>(type: SelectorHelperEventTypes, handler: Handler<T>) {
        return controller.on(type, handler);
      },
    }),
    [controller]
  );
}
