export function shouldResumeCollectionImport(statuses: Record<string, number>) {
  return (
    (statuses['-1'] || 0) > 0 &&
    Object.entries(statuses).every(([status, count]) => count === 0 || status === '-1' || status === '3')
  );
}
