export type NodeType = 'group' | 'tag';

export interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  tagType?: string;
  overrideFrom?: string;
  aliasOf?: string;
  hiddenTagIds?: string[];
  tags: TreeNode[];
  children: TreeNode[];
}

const makeId = () => {
  const now = Date.now().toString();
  const rand = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${now}${rand}`;
};

export const createNode = (type: NodeType, name?: string, tagType?: string): TreeNode => ({
  id: makeId(),
  name: name ?? (type === 'group' ? '' : 'Nouveau tag'),
  type,
  tagType: type === 'tag' ? tagType ?? 'Main' : undefined,
  overrideFrom: undefined,
  aliasOf: undefined,
  hiddenTagIds: [],
  tags: [],
  children: [],
});

export const createSampleTree = (): TreeNode[] => [
  {
    id: '1',
    name: '',
    type: 'group',
    tags: [
      {
        id: '2',
        name: 'Entity',
        type: 'tag',
        tagType: 'Main',
        tags: [],
        children: [],
      },
    ],
    children: [
      {
        id: '3',
        name: '',
        type: 'group',
        tags: [
          {
            id: '4',
            name: 'LivingBeing',
            type: 'tag',
            tagType: 'Main',
            tags: [],
            children: [],
          },
        ],
        children: [
          {
            id: '5',
            name: '',
            type: 'group',
            tags: [
              {
                id: '6',
                name: 'Human',
                type: 'tag',
                tagType: 'Main',
                tags: [],
                children: [],
              },
              {
                id: '28',
                name: '2 eyes',
                type: 'tag',
                tagType: 'Trait',
                tags: [],
                children: [],
              },
              {
                id: '29',
                name: '2 legs',
                type: 'tag',
                tagType: 'Trait',
                tags: [],
                children: [],
              },
              {
                id: '30',
                name: '2 arms',
                type: 'tag',
                tagType: 'Trait',
                tags: [],
                children: [],
              },
              {
                id: '31',
                name: '1 mouth',
                type: 'tag',
                tagType: 'Trait',
                tags: [],
                children: [],
              },
            ],
            children: [
              {
                id: '7',
                name: '',
                type: 'group',
                tags: [
                  {
                    id: '8',
                    name: 'Female',
                    type: 'tag',
                    tagType: 'Main',
                    tags: [],
                    children: [],
                  },
                  {
                    id: '32',
                    name: 'XX chromosomes',
                    type: 'tag',
                    tagType: 'Trait',
                    tags: [],
                    children: [],
                  },
                  {
                    id: '33',
                    name: 'Estrogen dominant',
                    type: 'tag',
                    tagType: 'Trait',
                    tags: [],
                    children: [],
                  },
                  {
                    id: '34',
                    name: 'Mammary glands',
                    type: 'tag',
                    tagType: 'Trait',
                    tags: [],
                    children: [],
                  },
                ],
                children: [
                ],
              },
            ],
          },
          {
            id: '9',
            name: '',
            type: 'group',
            tags: [
              {
                id: '10',
                name: 'Animal',
                type: 'tag',
                tagType: 'Main',
                tags: [],
                children: [],
              },
            ],
            children: [
            ],
          },
        ],
      },
    ],
  },
  {
    id: '11',
    name: '',
    type: 'group',
    tags: [
      {
        id: '12',
        name: 'Named',
        type: 'tag',
        tagType: 'Main',
        tags: [],
        children: [],
      },
    ],
    children: [
      {
        id: '13',
        name: '',
        type: 'group',
        tags: [
          {
            id: '14',
            name: 'Bulma',
            type: 'tag',
            tagType: 'Main',
            tags: [],
            children: [],
          },
          {
            id: '67',
            name: 'Long hair',
            type: 'tag',
            tagType: 'Feature',
            tags: [],
            children: [],
          },
          {
            id: '68',
            name: 'Blue eyes',
            type: 'tag',
            tagType: 'Feature',
            tags: [],
            children: [],
          },
          {
            id: '69',
            name: 'Ponytail',
            type: 'tag',
            tagType: 'Feature',
            tags: [],
            children: [],
          },
        ],
        children: [
          {
            id: '15',
            name: '',
            type: 'group',
            aliasOf: '5',
            hiddenTagIds: ['30'],
            tags: [
              {
                id: '70',
                name: '1 arm',
                type: 'tag',
                tagType: 'Override',
                overrideFrom: '2 arms',
                tags: [],
                children: [],
              },
            ],
            children: [
              {
                id: '17',
                name: '',
                type: 'group',
                aliasOf: '7',
                tags: [],
                children: [
                ],
              },
            ],
          },
          {
            id: '19',
            name: '',
            type: 'group',
            tags: [
              {
                id: '20',
                name: 'FictionalCharacter',
                type: 'tag',
                tagType: 'Main',
                tags: [],
                children: [],
              },
            ],
            children: [
            ],
          },
        ],
      },
    ],
  },
  {
    id: '22',
    name: '',
    type: 'group',
    tags: [
      {
        id: '23',
        name: 'Object',
        type: 'tag',
        tagType: 'Main',
        tags: [],
        children: [],
      },
    ],
    children: [
    ],
  },
  {
    id: '24',
    name: '',
    type: 'group',
    tags: [
      {
        id: '25',
        name: 'Place',
        type: 'tag',
        tagType: 'Main',
        tags: [],
        children: [],
      },
    ],
    children: [
    ],
  },
  {
    id: '26',
    name: '',
    type: 'group',
    tags: [
      {
        id: '27',
        name: 'Concept',
        type: 'tag',
        tagType: 'Main',
        tags: [],
        children: [],
      },
    ],
    children: [
    ],
  },
];

export const findNode = (nodes: TreeNode[], id: string): TreeNode | null => {
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.type === 'group') {
      const tagMatch = findNode(node.tags, id);
      if (tagMatch) {
        return tagMatch;
      }
      const childMatch = findNode(node.children, id);
      if (childMatch) {
        return childMatch;
      }
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
    if (node.type === 'group') {
      if (removeNode(node.tags, id)) {
        return true;
      }
      if (removeNode(node.children, id)) {
        return true;
      }
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
  if (node.type === 'tag') {
    parent.tags.push(node);
    return true;
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
