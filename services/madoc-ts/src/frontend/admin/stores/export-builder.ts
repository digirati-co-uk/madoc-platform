import { create } from 'zustand';

// 1. Which have been selected
//    - add
//    - remove
// 2. Configuration for each
//    - set default
//    - update
//    - remove
// 3. Default state (e.g. project_id, collection_id, manifest_id)
// 4. Which states are "complete" in the UI

export type DefaultContext = {
  project_id: undefined | number;
  manifest_id: undefined | number;
  collection_id: undefined | number;
};

export const useExportBuilder = create<{
  choices: Record<
    string,
    {
      is_complete: boolean;
      config: any;

      //
    }
  >;
  reset(): void;
  add(type: string, config: any, is_complete?: boolean): void;
  remove(type: string): void;
  configure(type: string, config: any): void;
  complete(type: string): void;
  uncomplete(type: string): void;
}>(set => ({
  choices: {} as Record<
    string,
    {
      is_complete: boolean;
      config: any;

      //
    }
  >,
  reset() {
    set({ choices: {} });
  },
  add(type: string, config: any, is_complete = false) {
    set((s: any) => ({
      choices: { ...s.choices, [type]: { is_complete, config } },
    }));
  },
  remove(type: string) {
    set((s: any) => {
      const { [type]: _, ...choices } = s.choices;
      return {
        choices,
      };
    });
  },
  configure(type: string, config: any) {
    set((s: any) => ({
      choices: { ...s.choices, [type]: { ...(s.choices[type] || {}), config } },
    }));
  },
  complete(type: string) {
    set((s: any) => ({
      choices: { ...s.choices, [type]: { ...(s.choices[type] || {}), is_complete: true } },
    }));
  },
  uncomplete(type: string) {
    set((s: any) => ({
      choices: { ...s.choices, [type]: { ...(s.choices[type] || {}), is_complete: false } },
    }));
  },
}));
