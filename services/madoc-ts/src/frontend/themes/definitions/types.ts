import { ThemeSet } from 'styled-theming';
import { ThemeDefinitions } from './index';

export type ThemeVariation<Definition, Variations = 'default'> = {
  __VARIATIONS__: Variations;
} & DefinitionWithVariables<Definition>;

type DefinitionWithVariables<Definition> = {
  [Property in keyof Definition]: Definition[Property] | ThemeSet;
};

type MadocThemeBase = {
  [Def in keyof ThemeDefinitions]: ThemeDefinitions[Def]['__VARIATIONS__'];
};

type MadocThemeCustom = {
  [Prop in keyof ThemeDefinitions]?: Omit<Partial<ThemeDefinitions[Prop]>, '__VARIATIONS__'>;
};

export type MadocTheme = MadocThemeBase & {
  custom?: MadocThemeCustom;
};

type ExtractThemeDefinition<
  Var extends ThemeVariation<any, any>,
  T extends string | number | symbol
> = Var extends ThemeVariation<
  {
    [key in T]: infer R;
  },
  any
>
  ? R | ThemeSet
  : never;

export type ThemeDefinitionMap<Key extends keyof ThemeDefinitions, Component extends keyof ThemeDefinitions[Key]> = {
  [Prop in ThemeDefinitions[Key]['__VARIATIONS__']]: ExtractThemeDefinition<ThemeDefinitions[Key], Component>;
};
