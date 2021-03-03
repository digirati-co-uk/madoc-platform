import { ThemeDefinitions } from './index';

export type ThemeVariation<Definition, Variations = 'default'> = {
  __VARIATIONS__: Variations;
} & Definition;

export type MadocTheme = {
  [Def in keyof ThemeDefinitions]: ThemeDefinitions[Def]['__VARIATIONS__'];
} & {
  custom?: {
    [Prop in keyof ThemeDefinitions]?: Omit<Partial<ThemeDefinitions[Prop]>, '__VARIATIONS__'>;
  };
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
  ? R
  : never;

export type ThemeDefinitionMap<Key extends keyof ThemeDefinitions, Component extends keyof ThemeDefinitions[Key]> = {
  [Prop in ThemeDefinitions[Key]['__VARIATIONS__']]: ExtractThemeDefinition<ThemeDefinitions[Key], Component>;
};
