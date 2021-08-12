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
