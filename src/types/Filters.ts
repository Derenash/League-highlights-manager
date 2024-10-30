export interface Filter<T> {
  field: string;
  value: T;
  operator: OP;
}

export enum OP {
  EQL = '==',
  GTN = '>',
  GTE = '>=',
  LTN = '<',
  LTE = '<=',
}

export type InclusiveFilter = (Filter<any>[])[];
export type ExclusiveFilter = Filter<any>[];

export type CheckboxGroups = {
  [group: string]: CheckboxGroup;
};

export type CheckboxFilters = {
  [key: string]: CheckboxFilter;
};

export type CheckboxGroup = {
  title: string;
  inputs: CheckboxFilters;
};

export type CheckboxFilter = {
  checked: boolean;
  filter: Filter<any>;
  text: string;
};