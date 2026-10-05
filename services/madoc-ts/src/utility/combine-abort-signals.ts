// Node 24 supports AbortSignal.any; TypeScript 4.9's DOM declaration predates it.
export function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const nativeAbortSignal = AbortSignal as typeof AbortSignal & {
    any(signals: AbortSignal[]): AbortSignal;
  };
  return nativeAbortSignal.any(signals);
}
