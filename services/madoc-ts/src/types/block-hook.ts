export type BlockHook = {
  name: string;
  creator: (props: Partial<any>) => any;
  mapToProps: (props: Partial<any>, data: any) => Partial<any>;
};
