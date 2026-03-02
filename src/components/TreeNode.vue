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
          <span v-if="node.type === 'group'">ID: {{ node.id }}</span>
          <span v-else>
            {{ node.name }}
            <span class="node__tag-type">({{ node.tagType ?? 'Main' }})</span>
          </span>
        </template>
        <span :class="['node__type', node.type === 'tag' ? 'node__type--tag' : '']">
          {{ node.type === 'group' ? 'Groupe' : 'Tag' }}
        </span>
      </div>
      <div class="node__actions">
        <button v-if="node.type === 'group'" @click="onAddGroup(node.id)">+ Groupe</button>
        <button v-if="node.type === 'group'" @click="onAddTag(node.id)">+ Tag</button>
        <button v-if="node.type === 'tag'" @click="startEdit">Renommer</button>
        <button @click="onRemove(node.id)">Supprimer</button>
      </div>
    </div>

    <div v-if="node.type === 'group' && expanded" class="node__children">
      <div class="node__tags">
        <button class="button button--ghost" @click="toggleTags">
          {{ tagsExpanded ? '▾' : '▸' }} Tags ({{ node.tags.length }})
        </button>
        <div v-if="tagsExpanded">
          <TreeView
            :nodes="node.tags"
            :parent="node"
            :depth="depth + 1"
            :on-add-group="onAddGroup"
            :on-add-tag="onAddTag"
            :on-remove="onRemove"
            :on-rename="onRename"
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
}

const props = defineProps<Props>();

const expanded = ref(true);
const tagsExpanded = ref(true);
const editing = ref(false);
const draft = ref(props.node.name);

const groupColor = (level: number) => {
  const start = { r: 239, g: 68, b: 68 };
  const end = { r: 59, g: 130, b: 246 };
  const ratio = Math.min(level / 8, 1);
  const r = Math.round(start.r + (end.r - start.r) * ratio);
  const g = Math.round(start.g + (end.g - start.g) * ratio);
  const b = Math.round(start.b + (end.b - start.b) * ratio);
  return `rgba(${r}, ${g}, ${b}, 0.12)`;
};

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
