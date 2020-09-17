import { useMemo } from 'react';
import { parseUrn } from '../../../utility/parse-urn';

export function useSubjectMap(
  subjects?: Array<{
    subject: string;
    status: number;
  }>
) {
  return useMemo(() => {
    if (!subjects) return [];
    const mapping: { [id: number]: number } = {};
    let showDone = false;
    for (const { subject, status } of subjects) {
      if (!showDone && status === 3) {
        showDone = true;
      }
      const parsed = parseUrn(subject);
      if (parsed) {
        mapping[parsed.id] = status;
      }
    }
    return [mapping, showDone] as const;
  }, [subjects]);
}
