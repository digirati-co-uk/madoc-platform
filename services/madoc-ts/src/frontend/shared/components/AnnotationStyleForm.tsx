import { BoxStyle } from '@atlas-viewer/atlas';
import React, { useEffect, useReducer, useState } from 'react';
import { AnnotationThemeDefinition } from '../../../types/annotation-styles';
import { CheckboxField } from '../capture-models/editor/input-types/CheckboxField/CheckboxField';
import { ColorField } from '../capture-models/editor/input-types/ColorField/ColorField';
import { CompositeInput } from '../form/CompositeInput';
import { Input, InputContainer, InputLabel } from '../form/Input';

export interface AnnotationStyleFormProps {
  value: AnnotationThemeDefinition;
  showHotspot?: boolean;
  onUpdate(newValue: AnnotationThemeDefinition): void;
}

// eslint-disable-next-line no-shadow
enum ThemeActionTypes {
  SET_HIDDEN,
  SET_INTERACTIVE,
  SET_BACKGROUND_COLOR,
  SET_OPACITY,
  SET_BORDER_COLOR,
  SET_BORDER_WIDTH,
  RESET,
  SET_HOTSPOT,
  SET_HOTSPOT_SIZE,
}

function themeDefinitionReducer(
  state: AnnotationThemeDefinition,
  { actionState, ...action }: any
): AnnotationThemeDefinition {
  if (actionState === 'hover') {
    return {
      ...state,
      ':hover': themeDefinitionReducer(state[':hover'] || {}, action),
    };
  }
  if (actionState === 'active') {
    return {
      ...state,
      ':active': themeDefinitionReducer(state[':active'] || {}, action),
    };
  }

  switch (action.type) {
    case ThemeActionTypes.SET_HIDDEN:
      return { ...state, hidden: action.value };
    case ThemeActionTypes.SET_INTERACTIVE:
      return { ...state, interactive: action.value };
    case ThemeActionTypes.SET_BACKGROUND_COLOR: {
      if (action.value === 'rgba(0, 0, 0, 0)') {
        const { backgroundColor, ...restState } = state;
        return restState;
      }
      return { ...state, backgroundColor: action.value };
    }
    case ThemeActionTypes.SET_OPACITY:
      return { ...state, opacity: action.value };
    case ThemeActionTypes.SET_BORDER_COLOR:
      return { ...state, borderColor: action.value };
    case ThemeActionTypes.SET_BORDER_WIDTH: {
      if (action.value === 0) {
        const { borderStyle, borderColor, borderWidth, ...restState } = state;
        return restState;
      }

      return { ...state, borderWidth: action.value };
    }
    case ThemeActionTypes.SET_HOTSPOT:
      return { ...state, hotspot: action.value };

    case ThemeActionTypes.SET_HOTSPOT_SIZE:
      return { ...state, hotspotSize: action.value };

    case ThemeActionTypes.RESET:
      return action.value;
  }
  return state;
}

export function AnnotationStyleForm(props: AnnotationStyleFormProps) {
  const [state, dispatch] = useReducer(themeDefinitionReducer, props.value);
  const [currentState, setCurrentState] = useState<'default' | 'active' | 'hover'>('default');

  const formToShow: BoxStyle = currentState === 'default' ? state : (state as any)[':' + currentState] || {};

  useEffect(() => {
    props.onUpdate(state);
  }, [props.onUpdate, state]);

  return (
    <form>
      <InputContainer fluid>
        <InputLabel>Visibility</InputLabel>
        <CheckboxField
          type="checkbox-field"
          value={!state.hidden || false}
          id="hidden"
          inlineLabel="Show this annotation type"
          label="Hidden"
          updateValue={v => {
            dispatch({ type: ThemeActionTypes.SET_HIDDEN, value: !v });
          }}
        />
      </InputContainer>
      {!state.hidden ? (
        <>
          {props.showHotspot ? (
            <>
              <InputContainer fluid>
                <InputLabel>Hotspot</InputLabel>
                <CheckboxField
                  type="checkbox-field"
                  value={state.hotspot || false}
                  id="hidden"
                  inlineLabel="Show hotspot user interface for annotation"
                  label="Hidden"
                  updateValue={v => {
                    dispatch({ type: ThemeActionTypes.SET_HOTSPOT, value: v });
                  }}
                />
              </InputContainer>
              {state.hotspot ? (
                <>
                  <InputContainer fluid>
                    <InputLabel>Hotspot size</InputLabel>

                    <CompositeInput.Container>
                      <CompositeInput.InputSplitRow>
                        <Input
                          type="button"
                          value="Small"
                          $inactive={!state.hotspotSize || state.hotspotSize === 'sm'}
                          onClick={e => {
                            e.preventDefault();
                            dispatch({ type: ThemeActionTypes.SET_HOTSPOT_SIZE, value: 'sm' });
                          }}
                        />
                        <Input
                          type="button"
                          value="Medium"
                          $inactive={state.hotspotSize === 'md'}
                          onClick={e => {
                            e.preventDefault();
                            dispatch({ type: ThemeActionTypes.SET_HOTSPOT_SIZE, value: 'md' });
                          }}
                        />
                        <Input
                          type="button"
                          value="Large"
                          $inactive={state.hotspotSize === 'lg'}
                          onClick={e => {
                            e.preventDefault();
                            dispatch({ type: ThemeActionTypes.SET_HOTSPOT_SIZE, value: 'lg' });
                          }}
                        />
                      </CompositeInput.InputSplitRow>
                    </CompositeInput.Container>
                  </InputContainer>
                </>
              ) : null}
            </>
          ) : null}

          <InputContainer fluid>
            <InputLabel>Interactivity</InputLabel>
            <CheckboxField
              type="checkbox-field"
              value={state.interactive || false}
              id="hidden"
              inlineLabel="Allow annotation to be interactive"
              label="Hidden"
              updateValue={v => {
                if (!v) {
                  setCurrentState('default');
                }
                dispatch({ type: ThemeActionTypes.SET_INTERACTIVE, value: v });
              }}
            />
          </InputContainer>
          {state.interactive ? (
            <InputContainer fluid>
              <CompositeInput.Container>
                <CompositeInput.InputRow $flex>
                  <Input
                    type="button"
                    value="Default"
                    $inactive={currentState === 'default'}
                    onClick={e => {
                      e.preventDefault();
                      setCurrentState('default');
                    }}
                  />
                  <Input
                    type="button"
                    value="Hover"
                    $inactive={currentState === 'hover'}
                    onClick={e => {
                      e.preventDefault();
                      setCurrentState('hover');
                    }}
                  />
                  <Input
                    type="button"
                    value="Active"
                    $inactive={currentState === 'active'}
                    onClick={e => {
                      e.preventDefault();
                      setCurrentState('active');
                    }}
                  />
                </CompositeInput.InputRow>
              </CompositeInput.Container>
            </InputContainer>
          ) : null}
          <div key={currentState}>
            <InputContainer fluid>
              <InputLabel>Background</InputLabel>
              <ColorField
                key={currentState}
                id="color"
                type="color-field"
                isAlpha
                value={formToShow.backgroundColor || ''}
                label="Background"
                updateValue={v =>
                  dispatch({ type: ThemeActionTypes.SET_BACKGROUND_COLOR, value: v, actionState: currentState })
                }
              />
            </InputContainer>

            <InputContainer fluid>
              <InputLabel>Border</InputLabel>

              <CompositeInput.Container>
                <CompositeInput.Input
                  type="number"
                  value={parseInt('' + (formToShow.borderWidth || 0), 10)}
                  $filled
                  min={0}
                  $size="sm"
                  onChange={e =>
                    dispatch({
                      type: ThemeActionTypes.SET_BORDER_WIDTH,
                      value: e.target.valueAsNumber,
                      actionState: currentState,
                    })
                  }
                />
                <CompositeInput.Text $left>px</CompositeInput.Text>
                <CompositeInput.Text>
                  <strong>solid</strong>
                </CompositeInput.Text>
                <CompositeInput.Spacer />

                <ColorField
                  key={currentState}
                  id="border-color"
                  type="color-field"
                  isAlpha
                  value={formToShow.borderColor || ''}
                  label="Border"
                  disabled={!formToShow.borderWidth}
                  updateValue={v => {
                    dispatch({
                      type: ThemeActionTypes.SET_BORDER_COLOR,
                      value: v,
                      actionState: currentState,
                    });
                  }}
                />
              </CompositeInput.Container>
            </InputContainer>
          </div>
        </>
      ) : null}
    </form>
  );
}
