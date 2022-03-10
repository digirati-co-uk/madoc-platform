import { PluginContext } from '../context';
import { useContext } from 'react';

export function useFieldPlugin(type: string) {
  const ctx = useContext(PluginContext);

  const field = ctx.fields[type];
  if (!field) {
    throw new Error(`Plugin "${type}" does not exist`);
  }

  return field;
}
