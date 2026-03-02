<template>
  <div>
    <div class="node" :style="nodeStyle">
      <span class="drag-handle">⠿</span>
      <div class="node__label">
        <button v-if="node.type === 'group'" class="button button--ghost" @click="toggle">
          {{ expanded ? '▾' : '▸' }}
        </button>
        <span v-else>•</span>
        <template v-if="editing">
          <input v-model="draft" class="input" @keydown.enter="save" @blur="save" />
        </template>
        <template v-else>
          <span v-if="node.type === 'group'">
            ID: {{ node.id }}
            <span v-if="node.aliasOf" class="node__alias">Alias → {{ node.aliasOf }}</span>
            <span v-if="mainTagLabel" class="node__alias-main">Main: {{ mainTagLabel }}</span>
          </span>
          <span v-else>
            <template v-if="node.tagType === 'Override' && node.overrideFrom">
              {{ node.overrideFrom }} → {{ node.name }}
            </template>
            <template v-else>
              {{ node.name }}
              <span class="node__tag-type">({{ node.tagType ?? 'Main' }})</span>
            </template>
          </span>
        </template>
        <span :class="['node__type', node.type === 'tag' ? 'node__type--tag' : '']">
          {{ node.type === 'group' ? 'Groupe' : 'Tag' }}
        </span>
      </div>
      <div class="node__actions">
        <button v-if="node.type === 'group'" @click="onAddGroup(node.id)">+ Groupe</button>
        <button v-if="node.type === 'group'" @click="onAddTag(node.id)">+ Tag</button>
        <button v-if="node.type === 'group'" @click="onAlias(node.id)">Alias</button>
        <button v-if="node.type === 'tag'" @click="startEdit">Renommer</button>
        <button @click="onRemove(node.id)">Supprimer</button>
      </div>
    </div>

    <div v-if="node.type === 'group' && expanded" class="node__children">
      <div class="node__tags">
        <button class="button button--ghost" @click="toggleTags">
          {{ tagsExpanded ? '▾' : '▸' }} Tags ({{ displayTags.length }})
        </button>
        <span v-if="!tagsExpanded && tagSummary" class="node__tags-summary">
          {{ tagSummary }}
        </span>
        <div v-if="tagsExpanded">
          <TreeView
            :nodes="displayTags"
            :parent="node"
            :depth="depth + 1"
            :on-add-group="onAddGroup"
            :on-add-tag="onAddTag"
            :on-remove="onRemove"
            :on-rename="onRename"
            :on-alias="onAlias"
            :resolve-node="resolveNode"
            allowed-type="tag"
          />
        </div>
      </div>
      <TreeView
        :nodes="node.children"
        :parent="node"
        :depth="depth + 1"
        :on-add-group="onAddGroup"
        :on-add-tag="onAddTag"
        :on-remove="onRemove"
        :on-rename="onRename"
        :on-alias="onAlias"
        :resolve-node="resolveNode"
        allowed-type="group"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import TreeView from './TreeView.vue';
import type { TreeNode as Node } from '../store';

interface Props {
  node: Node;
  depth: number;
  onAddGroup: (parentId: string | null) => void;
  onAddTag: (parentId: string | null) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAlias: (id: string) => void;
  resolveNode: (id: string) => Node | null;
}

const props = defineProps<Props>();

const expanded = ref(true);
const tagsExpanded = ref(false);
const editing = ref(false);
const draft = ref(props.node.name);

const groupColor = (level: number) => {
  const palette = [
    'rgba(239, 68, 68, 0.28)',
    'rgba(217, 70, 239, 0.28)',
    'rgba(139, 92, 246, 0.28)',
    'rgba(59, 130, 246, 0.28)',
  ];
  const index = Math.min(level, palette.length - 1);
  return palette[index];
};

const aliasTarget = computed(() => {
  if (!props.node.aliasOf) {
    return null;
  }
  return props.resolveNode(props.node.aliasOf);
});

const mainTagLabel = computed(() => {
  if (props.node.type !== 'group') {
    return null;
  }
  const source = aliasTarget.value ?? props.node;
  const mainTag = source.tags.find((tag) => tag.tagType === 'Main');
  return mainTag?.name ?? null;
});

const displayTags = computed(() => {
  if (props.node.type !== 'group') {
    return [] as Node[];
  }
  return props.node.tags;
});

const tagSummary = computed(() => {
  if (props.node.type !== 'group') {
    return '';
  }
  return props.node.tags
    .map((tag) => {
      if (tag.tagType === 'Override' && tag.overrideFrom) {
        return `${tag.overrideFrom} → ${tag.name}`;
      }
      return `${tag.name} (${tag.tagType ?? 'Main'})`;
    })
    .join(', ');
});

const nodeStyle = computed(() => {
  const base = { marginLeft: `${props.depth * 14}px` };
  if (props.node.type !== 'group') {
    return base;
  }
  return {
    ...base,
    backgroundColor: groupColor(props.depth),
  };
});

watch(
  () => props.node.name,
  (value) => {
    if (!editing.value) {
      draft.value = value;
    }
  }
);

const toggle = () => {
  expanded.value = !expanded.value;
};

const toggleTags = () => {
  tagsExpanded.value = !tagsExpanded.value;
};

const startEdit = () => {
  editing.value = true;
  draft.value = props.node.name;
};

const save = () => {
  if (!editing.value) {
    return;
  }
  const name = draft.value.trim() || props.node.name;
  props.onRename(props.node.id, name);
  editing.value = false;
};
</script>
