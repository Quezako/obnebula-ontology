<template>
  <VueDraggableNext
    class="tree"
    :list="nodes"
    item-key="id"
    group="ontology"
    :move="(event) => canMove(event, parent)"
  >
    <TreeNode
      v-for="element in nodes"
      :key="element.id"
      :node="element"
      :depth="depth"
      :on-add-group="onAddGroup"
      :on-add-tag="onAddTag"
      :on-remove="onRemove"
      :on-rename="onRename"
    />
  </VueDraggableNext>
  <div v-if="nodes.length === 0" class="empty">
    Aucun élément pour le moment. Ajoute un groupe ou un tag.
  </div>
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
  onRemove: (id: string) => void;
  onRename: (id: string, name: string) => void;
  allowedType?: Node['type'] | 'any';
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
