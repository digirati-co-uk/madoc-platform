import { ThemeDefinitions } from './index';

export type ThemeVariation<Definition, Variations = 'default'> = {
  __VARIATIONS__: Variations;
} & Definition;

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
  ? R
  : never;

export type ThemeDefinitionMap<Key extends keyof ThemeDefinitions, Component extends keyof ThemeDefinitions[Key]> = {
  [Prop in ThemeDefinitions[Key]['__VARIATIONS__']]: ExtractThemeDefinition<ThemeDefinitions[Key], Component>;
};
