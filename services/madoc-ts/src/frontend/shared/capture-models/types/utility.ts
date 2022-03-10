import { CaptureModel } from './capture-model';

export type MapValues<T, Base = {}> = T extends { [K in keyof T]: infer U } ? Base & U : never;

export type StructureType<ChoiceType extends string, T = CaptureModel['structure']> = T extends infer R & {
  type: ChoiceType;
}
  ? T
  : never;

export type AnyIfEmpty<T extends object> = keyof T extends never ? any : T;
