import { RefinementContext, RefinementSupportProps, RefinementType, UnknownRefinement } from '../../types/refinements';
import { PluginContext } from '../context';
import { useContext, useMemo } from 'react';

export function useRefinement<Ref extends UnknownRefinement = UnknownRefinement>(
  type: string,
  { instance, property }: { instance: RefinementType<Ref>; property: string },
  context: RefinementSupportProps & RefinementContext<Ref>
): Ref | null {
  const ctx = useContext(PluginContext);
  const refinements = useMemo(() => ctx.refinements.filter(r => r.type === type), [ctx.refinements, type]) as Ref[];

  return useMemo(() => {
    if (!instance) {
      return null;
    }
    for (const refinement of refinements) {
      const match = refinement.supports({ instance, property } as any, context as any);
      if (match) {
        return refinement;
      }
    }
    return null;
  }, [instance, refinements, property, context]);
}
