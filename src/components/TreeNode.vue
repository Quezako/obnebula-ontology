<template>
  <div>
    <div class="node" :style="{ marginLeft: `${depth * 14}px` }">
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
          <span>{{ node.name }}</span>
        </template>
        <span :class="['node__type', node.type === 'tag' ? 'node__type--tag' : '']">
          {{ node.type === 'group' ? 'Groupe' : 'Tag' }}
        </span>
      </div>
      <div class="node__actions">
        <button v-if="node.type === 'group'" @click="onAddGroup(node.id)">+ Groupe</button>
        <button v-if="node.type === 'group'" @click="onAddTag(node.id)">+ Tag</button>
        <button @click="startEdit">Renommer</button>
        <button @click="onRemove(node.id)">Supprimer</button>
      </div>
    </div>

    <div v-if="node.type === 'group' && expanded" class="node__children">
      <TreeView
        :nodes="node.children"
        :parent="node"
        :depth="depth + 1"
        :on-add-group="onAddGroup"
        :on-add-tag="onAddTag"
        :on-remove="onRemove"
        :on-rename="onRename"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
const editing = ref(false);
const draft = ref(props.node.name);

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
