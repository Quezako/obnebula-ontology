<template>
  <div>
    <div
      class="node"
      :class="selectable && node.type === 'group' ? 'node--selectable' : ''"
      :style="nodeStyle"
    >
      <span v-if="!selectable" class="drag-handle">⠿</span>
      <div class="node__label">
        <button
          v-if="showAncestorToggle"
          class="button button--ghost"
          @click.stop="onToggleAncestors?.()"
        >
          {{ ancestorsOpen ? '▴' : '◂' }}
        </button>
        <button
          v-if="showAliasAncestorToggle"
          class="button button--ghost"
          @click.stop="onToggleAliasAncestors?.(node.id)"
        >
          {{ aliasAncestorsOpen ? '▴' : '◂' }}
        </button>
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
            <span v-if="aliasBreadcrumb" class="node__breadcrumb">{{ aliasBreadcrumb }}</span>
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
      <div v-if="!selectable && !hideActions" class="node__actions">
        <button v-if="node.type === 'group'" @click="onAddGroup(node.id)">+ Groupe</button>
        <button v-if="node.type === 'group'" @click="onAddTag(node.id)">+ Tag</button>
        <button
          v-if="node.type === 'group' && !node.aliasOf"
          @click="onAlias(node.id)"
        >
          Alias
        </button>
        <button
          v-if="node.type === 'group' && node.aliasOf"
          @click="onRemoveAlias(node.id)"
        >
          Supprimer alias
        </button>
        <button v-if="node.type === 'tag'" @click="startEdit">Renommer</button>
        <button @click="onRemove(node.id)">Supprimer</button>
      </div>
      <div v-else class="node__actions">
        <button v-if="node.type === 'group'" @click.stop="onSelectGroup?.(node.id)">
          Sélectionner
        </button>
      </div>
    </div>

    <div v-if="node.type === 'group' && expanded" class="node__children">
      <div v-if="aliasAncestorsOpen" class="alias-ancestors">
        <TreeView
          :nodes="aliasAncestorTree"
          :parent="null"
          :depth="0"
          :on-add-group="onAddGroup"
          :on-add-tag="onAddTag"
          :on-remove="onRemove"
          :on-rename="onRename"
          :on-alias="onAlias"
          :on-remove-alias="onRemoveAlias"
          :resolve-node="resolveNode"
          :resolve-breadcrumb="resolveBreadcrumb"
          :resolve-path="resolvePath"
          :is-alias-ancestors-open="isAliasAncestorsOpen"
          :on-toggle-alias-ancestors="onToggleAliasAncestors"
          :hide-actions="true"
        />
      </div>
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
            :on-remove-alias="onRemoveAlias"
            :resolve-node="resolveNode"
            :resolve-breadcrumb="resolveBreadcrumb"
            :resolve-path="resolvePath"
            :is-alias-ancestors-open="isAliasAncestorsOpen"
            :on-toggle-alias-ancestors="onToggleAliasAncestors"
            :selectable="selectable"
            :on-select-group="onSelectGroup"
            :ancestor-toggle-id="ancestorToggleId"
            :ancestors-open="ancestorsOpen"
            :on-toggle-ancestors="onToggleAncestors"
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
        :on-remove-alias="onRemoveAlias"
        :resolve-node="resolveNode"
        :resolve-breadcrumb="resolveBreadcrumb"
        :resolve-path="resolvePath"
        :is-alias-ancestors-open="isAliasAncestorsOpen"
        :on-toggle-alias-ancestors="onToggleAliasAncestors"
        :selectable="selectable"
        :on-select-group="onSelectGroup"
        :ancestor-toggle-id="ancestorToggleId"
        :ancestors-open="ancestorsOpen"
        :on-toggle-ancestors="onToggleAncestors"
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
  onRemoveAlias: (id: string) => void;
  resolveNode: (id: string) => Node | null;
  resolveBreadcrumb: (id: string) => string;
  resolvePath: (id: string) => Node[];
  isAliasAncestorsOpen: (id: string) => boolean;
  onToggleAliasAncestors: (id: string) => void;
  selectable?: boolean;
  hideActions?: boolean;
  ancestorToggleId?: string | null;
  ancestorsOpen?: boolean;
  onToggleAncestors?: () => void;
  onSelectGroup?: (id: string) => void;
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

const aliasBreadcrumb = computed(() => {
  if (!props.node.aliasOf) {
    return null;
  }
  return props.resolveBreadcrumb(props.node.aliasOf);
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

const showAncestorToggle = computed(
  () => props.node.type === 'group' && props.ancestorToggleId === props.node.id
);
const showAliasAncestorToggle = computed(
  () => props.node.type === 'group' && Boolean(props.node.aliasOf)
);
const aliasAncestorsOpen = computed(() => props.isAliasAncestorsOpen(props.node.id));
const aliasAncestorTree = computed(() => {
  if (!props.node.aliasOf) {
    return [] as Node[];
  }
  const path = props.resolvePath(props.node.aliasOf);
  if (path.length <= 1) {
    return path;
  }
  const cloneChain = (index: number): Node => {
    const node = path[index];
    const next = index < path.length - 1 ? [cloneChain(index + 1)] : [];
    return {
      ...node,
      children: next,
    };
  };
  return [cloneChain(0)];
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
