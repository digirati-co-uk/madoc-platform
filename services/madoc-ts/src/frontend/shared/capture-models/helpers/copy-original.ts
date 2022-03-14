import copy from 'fast-copy';
import { original } from 'immer';

export const copyOriginal = <T extends any = any>(i: any) => copy(original(i)) as T;
