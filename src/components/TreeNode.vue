<template>
  <div>
    <div
      class="node"
      :class="[
        selectable && node.type === 'group' ? 'node--selectable' : '',
        isTagHidden ? 'node--hidden' : '',
        isAliasLocalTag ? 'node--alias-local' : '',
      ]"
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
      <div v-if="!selectable && !effectiveHideActions" class="node__actions">
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
          @click="onRebaseAlias(node.id)"
        >
          Rebaser alias
        </button>
        <button v-if="node.type === 'tag'" @click="startEdit">Renommer</button>
        <button @click="onRemove(node.id)">Supprimer</button>
      </div>
      <div v-else class="node__actions">
        <button v-if="!hideActions && node.type === 'group'" @click.stop="onSelectGroup?.(node.id)">
          Sélectionner
        </button>
        <button
          v-if="aliasContextId && node.type === 'group'"
          @click.stop="onAddAliasTag(aliasContextId, node.id)"
        >
          + Tag (alias)
        </button>
        <template v-if="aliasContextId && node.type === 'tag'">
            <button
              v-if="node.tagType !== 'Override'"
              @click.stop="onAliasTagOverride?.(aliasContextId, node.id, parent?.id ?? aliasContextId)"
            >
              Surcharger
            </button>
            <button
              v-else
              @click.stop="onAliasTagReset?.(aliasContextId, node.id)"
            >
              Rétablir
            </button>
            <button @click.stop="onAliasTagHide?.(aliasContextId, node.id)">
              {{ isTagHidden ? 'Afficher' : 'Masquer' }}
            </button>
        </template>
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
          :on-add-alias-tag="onAddAliasTag"
          :on-remove="onRemove"
          :on-rename="onRename"
          :on-alias="onAlias"
          :on-remove-alias="onRemoveAlias"
          :on-rebase-alias="onRebaseAlias"
          :on-alias-tag-hide="onAliasTagHide"
          :on-alias-tag-override="onAliasTagOverride"
          :on-alias-tag-reset="onAliasTagReset"
          :resolve-node="resolveNode"
          :resolve-breadcrumb="resolveBreadcrumb"
          :resolve-path="resolvePath"
          :is-alias-ancestors-open="isAliasAncestorsOpen"
          :on-toggle-alias-ancestors="onToggleAliasAncestors"
          :hide-actions="true"
          :alias-context-id="node.id"
        />
      </div>
      <div v-if="!hideAliasTags" class="node__tags">
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
            :on-add-alias-tag="onAddAliasTag"
            :on-remove="onRemove"
            :on-rename="onRename"
            :on-alias="onAlias"
            :on-remove-alias="onRemoveAlias"
            :on-rebase-alias="onRebaseAlias"
            :on-alias-tag-hide="onAliasTagHide"
            :on-alias-tag-override="onAliasTagOverride"
            :on-alias-tag-reset="onAliasTagReset"
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
            :hide-actions="effectiveHideActions"
            :alias-context-id="aliasContextId"
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
        :on-add-alias-tag="onAddAliasTag"
        :on-remove="onRemove"
        :on-rename="onRename"
        :on-alias="onAlias"
        :on-remove-alias="onRemoveAlias"
        :on-rebase-alias="onRebaseAlias"
        :on-alias-tag-hide="onAliasTagHide"
        :on-alias-tag-override="onAliasTagOverride"
        :on-alias-tag-reset="onAliasTagReset"
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
        :hide-actions="effectiveHideActions"
        :alias-context-id="aliasContextId"
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
  parent: Node | null;
  depth: number;
  onAddGroup: (parentId: string | null) => void;
  onAddTag: (parentId: string | null) => void;
  onAddAliasTag: (aliasId: string, targetGroupId: string) => void;
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAlias: (id: string) => void;
  onRemoveAlias: (id: string) => void;
  onRebaseAlias: (id: string) => void;
  onAliasTagHide?: (aliasId: string, tagId: string) => void;
  onAliasTagOverride?: (aliasId: string, tagId: string, targetGroupId: string) => void;
  onAliasTagReset?: (aliasId: string, overrideId: string) => void;
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
  aliasContextId?: string | null;
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

const mergeAliasTags = (
  baseTags: Node[],
  localTags: Node[],
  targetGroupId: string,
  includeUnscoped: boolean
) => {
  const scoped = localTags.filter((tag) => {
    if (tag.aliasForGroupId) {
      return tag.aliasForGroupId === targetGroupId;
    }
    return includeUnscoped;
  });
  const overrides = scoped.filter((tag) => tag.tagType === 'Override' && tag.overrideFrom);
  const additions = scoped.filter((tag) => tag.tagType !== 'Override');
  const ordered: Node[] = [];
  baseTags.forEach((baseTag) => {
    const matching = overrides.filter((tag) => tag.overrideFrom === baseTag.name);
    if (matching.length) {
      ordered.push(matching[matching.length - 1]);
    } else {
      ordered.push(baseTag);
    }
  });
  ordered.push(...additions);
  return ordered;
};

const displayTags = computed(() => {
  if (props.node.type !== 'group') {
    return [] as Node[];
  }
  if (props.aliasContextId) {
    const aliasNode = props.resolveNode(props.aliasContextId);
    if (aliasNode?.type === 'group' && aliasNode.aliasOf) {
      const path = props.resolvePath(aliasNode.aliasOf);
      const isAncestor = path.some((node) => node.id === props.node.id);
      if (isAncestor) {
        return mergeAliasTags(props.node.tags ?? [], aliasNode.tags ?? [], props.node.id, false);
      }
    }
  }
  if (!props.node.aliasOf) {
    return props.node.tags;
  }
  const baseNode = props.resolveNode(props.node.aliasOf);
  return mergeAliasTags(baseNode?.tags ?? [], props.node.tags ?? [], props.node.aliasOf, true);
});

const tagSummary = computed(() => {
  if (props.node.type !== 'group') {
    return '';
  }
  return displayTags.value
    .map((tag) => {
      if (tag.tagType === 'Override' && tag.overrideFrom) {
        return `${tag.overrideFrom} → ${tag.name}`;
      }
      return `${tag.name} (${tag.tagType ?? 'Main'})`;
    })
    .join(', ');
});

const hideAliasTags = computed(() => props.node.type === 'group' && Boolean(props.node.aliasOf));

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

const effectiveHideActions = computed(() => Boolean(props.hideActions));

const isTagHidden = computed(() => {
  if (!props.aliasContextId || props.node.type !== 'tag') {
    return false;
  }
  const aliasNode = props.resolveNode(props.aliasContextId);
  const hidden = new Set(aliasNode?.hiddenTagIds ?? []);
  return hidden.has(props.node.id);
});

const isAliasLocalTag = computed(() => {
  if (!props.aliasContextId || props.node.type !== 'tag') {
    return false;
  }
  const aliasNode = props.resolveNode(props.aliasContextId);
  const localTagIds = new Set(aliasNode?.tags.map((tag) => tag.id) ?? []);
  return localTagIds.has(props.node.id);
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
