import theme from 'styled-theming';
import { ThemeDefinitions } from '../definitions/index';
import { ThemeDefinitionMap } from '../definitions/types';

export function themeVariable<
  Key extends keyof ThemeDefinitions,
  Component extends keyof ThemeDefinitions[Key],
  Definition = ThemeDefinitions[Key]
>(name: Key, component: Component, definition: ThemeDefinitionMap<Key, Component>) {
  const newDef: any = {};
  for (const def of Object.keys(definition)) {
    const inputDef = (definition as any)[def];
    newDef[def] = (props: any) =>
      props?.theme?.custom && props.theme.custom[name] && props.theme.custom[name][component]
        ? props.theme.custom[name][component]
        : inputDef;
  }

  return theme(name, newDef);
}

export function themeVariables<
  Key extends keyof ThemeDefinitions,
  Keys extends keyof ThemeDefinitions[Key],
  Definition extends ThemeDefinitions[Key],
  Definitions extends Omit<
    {
      [Def in Keys]?: ThemeDefinitionMap<Key, Def>;
    },
    '__VARIATIONS__'
  >
>(
  name: Key,
  definition: Definitions
): Omit<
  {
    [Def in keyof Definitions]: theme.ThemeSet;
  },
  '__VARIATIONS__'
> {
  const map: any = {};
  const keys = Object.keys(definition);

  for (const key of keys) {
    map[key] = themeVariable(name, key as any, (definition as any)[key]);
  }

  return map;
}
