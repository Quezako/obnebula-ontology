export type NodeType = 'group' | 'tag';

export interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  children: TreeNode[];
}

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `node_${Math.random().toString(16).slice(2)}`;
};

export const createNode = (type: NodeType, name?: string): TreeNode => ({
  id: makeId(),
  name: name ?? (type === 'group' ? 'Nouveau groupe' : 'Nouveau tag'),
  type,
  children: [],
});

export const createSampleTree = (): TreeNode[] => [
  {
    id: makeId(),
    name: 'Entity',
    type: 'group',
    children: [
      {
        id: makeId(),
        name: 'LivingBeing',
        type: 'group',
        children: [
          {
            id: makeId(),
            name: 'Human',
            type: 'group',
            children: [
              {
                id: makeId(),
                name: 'Female',
                type: 'tag',
                children: [],
              },
            ],
          },
          {
            id: makeId(),
            name: 'Animal',
            type: 'tag',
            children: [],
          },
        ],
      },
      {
        id: makeId(),
        name: 'Named',
        type: 'group',
        children: [
          {
            id: makeId(),
            name: 'Bulma',
            type: 'group',
            children: [
              {
                id: makeId(),
                name: 'Human',
                type: 'group',
                children: [
                  {
                    id: makeId(),
                    name: 'Female',
                    type: 'tag',
                    children: [],
                  },
                ],
              },
              {
                id: makeId(),
                name: 'FictionalCharacter',
                type: 'tag',
                children: [],
              },
              {
                id: makeId(),
                name: 'Blue hair',
                type: 'tag',
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: makeId(),
    name: 'Object',
    type: 'group',
    children: [],
  },
  {
    id: makeId(),
    name: 'Place',
    type: 'group',
    children: [],
  },
  {
    id: makeId(),
    name: 'Concept',
    type: 'group',
    children: [],
  },
];

export const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    const match = findNode(node.children, id);
    if (match) {
      return match;
    }
  }
  return null;
};

export const removeNode = (nodes: TreeNode[], id: string): boolean => {
  const index = nodes.findIndex((node) => node.id === id);
  if (index >= 0) {
    nodes.splice(index, 1);
    return true;
  }
  for (const node of nodes) {
    if (removeNode(node.children, id)) {
      return true;
    }
  }
  return false;
};

export const renameNode = (nodes: TreeNode[], id: string, name: string): boolean => {
  const node = findNode(nodes, id);
  if (!node) {
    return false;
  }
  node.name = name;
  return true;
};

export const addNode = (nodes: TreeNode[], parentId: string | null, node: TreeNode): boolean => {
  if (!parentId) {
    nodes.push(node);
    return true;
  }
  const parent = findNode(nodes, parentId);
  if (!parent || parent.type === 'tag') {
    return false;
  }
  parent.children.push(node);
  return true;
};

export const isDescendant = (targetParent: TreeNode | null, dragged: TreeNode): boolean => {
  if (!targetParent) {
    return false;
  }
  if (targetParent.id === dragged.id) {
    return true;
  }
  return dragged.children.some((child) => isDescendant(targetParent, child));
};
