<template>
  <VueDraggableNext
    class="tree"
    :list="nodes"
    item-key="id"
    group="ontology"
    :move="(event) => canMove(event, parent)"
    :disabled="selectable"
  >
    <TreeNode
      v-for="element in nodes"
      :key="element.id"
      :node="element"
      :parent="parent"
      :depth="depth"
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
      :hide-actions="hideActions"
      :ancestor-toggle-id="ancestorToggleId"
      :ancestors-open="ancestorsOpen"
      :on-toggle-ancestors="onToggleAncestors"
      :on-select-group="onSelectGroup"
      :alias-context-id="aliasContextId"
    />
  </VueDraggableNext>
</template>

<script setup lang="ts">
import { VueDraggableNext } from 'vue-draggable-next';
import TreeNode from './TreeNode.vue';
import type { TreeNode as Node } from '../store';
import { isDescendant } from '../store';

interface Props {
  nodes: Node[];
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
  onAliasTagHide: (aliasId: string, tagId: string) => void;
  onAliasTagOverride: (aliasId: string, tagId: string, targetGroupId: string) => void;
  onAliasTagReset: (aliasId: string, overrideId: string) => void;
  resolveNode: (id: string) => Node | null;
  resolveBreadcrumb: (id: string) => string;
  resolvePath: (id: string) => Node[];
  isAliasAncestorsOpen: (id: string) => boolean;
  onToggleAliasAncestors: (id: string) => void;
  allowedType?: Node['type'] | 'any';
  selectable?: boolean;
  hideActions?: boolean;
  ancestorToggleId?: string | null;
  ancestorsOpen?: boolean;
  onToggleAncestors?: () => void;
  onSelectGroup?: (id: string) => void;
  aliasContextId?: string | null;
}

const props = defineProps<Props>();

const canMove = (event: any, targetParent: Node | null) => {
  const dragged = event?.draggedContext?.element as Node | undefined;
  if (!dragged) {
    return true;
  }
  if (props.allowedType && props.allowedType !== 'any' && dragged.type !== props.allowedType) {
    return false;
  }
  if (targetParent && targetParent.type === 'tag') {
    return false;
  }
  return !isDescendant(targetParent, dragged);
};
</script>
