export type RelationKind = 'is-a' | 'instance-of' | 'alias' | 'override';

export interface GraphRelation {
  id: string;
  from: string;
  to: string;
  kind: RelationKind;
  label: string;
}

export const graphRelations: GraphRelation[] = [
  { id: 'r1', from: '3', to: '1', kind: 'is-a', label: 'is-a' },
  { id: 'r2', from: '5', to: '3', kind: 'is-a', label: 'is-a' },
  { id: 'r3', from: '7', to: '5', kind: 'is-a', label: 'is-a' },
  { id: 'r4', from: '9', to: '3', kind: 'is-a', label: 'is-a' },
  { id: 'r5', from: '13', to: '7', kind: 'instance-of', label: 'instance-of' },
  { id: 'r6', from: '15', to: '5', kind: 'alias', label: 'alias' },
  { id: 'r7', from: '17', to: '7', kind: 'alias', label: 'alias' },
  { id: 'r8', from: '70', to: '30', kind: 'override', label: 'override' },
];
