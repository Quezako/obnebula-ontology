<template>
  <div class="app">
    <header class="app__header">
      <div>
        <h1 class="app__title">Ontology Builder</h1>
        <p class="app__subtitle">Maquette statique pour gérer des groupes et tags.</p>
      </div>
      <div class="toolbar">
        <button class="button button--ghost" @click="currentView = 'tree'">Vue arbre</button>
        <button class="button button--ghost" @click="currentView = 'graph'">Vue graphe</button>
        <button class="button button--ghost" @click="currentView = 'bulma'">Vue Bulma</button>
        <button class="button button--ghost" @click="currentView = 'videl'">Vue Videl</button>
      </div>
    </header>

    <section v-if="currentView === 'tree'" class="panel">
      <div class="toolbar">
        <button class="button" @click="addGroup(null)">+ Groupe racine</button>
        <button class="button button--ghost" @click="addTag(null)">+ Tag racine</button>
      </div>

      <TreeView
        :nodes="nodes"
        :parent="null"
        :depth="0"
        :on-add-group="addGroup"
        :on-add-tag="addTag"
        :on-remove="remove"
        :on-rename="rename"
        :on-alias="aliasGroup"
        :on-remove-alias="removeAlias"
        :resolve-node="resolveNode"
        :resolve-breadcrumb="resolveBreadcrumb"
        :resolve-path="resolvePath"
        :is-alias-ancestors-open="isAliasAncestorsOpen"
        :on-toggle-alias-ancestors="toggleAliasAncestors"
      />
    </section>

    <GraphView v-else-if="currentView === 'graph'" :nodes="nodes" />

    <section v-else-if="currentView === 'bulma'" class="panel">
      <div class="toolbar">
        <button class="button button--ghost" @click="currentView = 'tree'">Retour</button>
      </div>
      <TreeView
        :nodes="bulmaRoot"
        :parent="null"
        :depth="0"
        :on-add-group="addGroup"
        :on-add-tag="addTag"
        :on-remove="remove"
        :on-rename="rename"
        :on-alias="aliasGroup"
        :on-remove-alias="removeAlias"
        :resolve-node="resolveNode"
        :resolve-breadcrumb="resolveBreadcrumb"
        :resolve-path="resolvePath"
        :is-alias-ancestors-open="isAliasAncestorsOpen"
        :on-toggle-alias-ancestors="toggleAliasAncestors"
      />
    </section>

    <section v-else class="panel">
      <div class="toolbar">
        <button class="button button--ghost" @click="currentView = 'tree'">Retour</button>
      </div>
      <TreeView
        :nodes="videlViewRoot"
        :parent="null"
        :depth="0"
        :on-add-group="addGroup"
        :on-add-tag="addTag"
        :on-remove="remove"
        :on-rename="rename"
        :on-alias="aliasGroup"
        :on-remove-alias="removeAlias"
        :resolve-node="resolveNode"
        :resolve-breadcrumb="resolveBreadcrumb"
        :resolve-path="resolvePath"
        :is-alias-ancestors-open="isAliasAncestorsOpen"
        :on-toggle-alias-ancestors="toggleAliasAncestors"
        :ancestor-toggle-id="'80'"
        :ancestors-open="showVidelAncestors"
        :on-toggle-ancestors="toggleVidelAncestors"
        :hide-actions="false"
      />
    </section>

    <div v-if="aliasTargetId" class="modal">
      <div class="modal__overlay" @click="closeAliasModal"></div>
      <div class="modal__content">
        <header class="modal__header">
          <h3>Choisir un groupe pour l’alias</h3>
          <button class="button button--ghost" @click="closeAliasModal">Fermer</button>
        </header>
        <p class="modal__subtitle">Clique sur un groupe dans l’arborescence.</p>
        <div class="modal__body">
          <TreeView
            :nodes="nodes"
            :parent="null"
            :depth="0"
            :on-add-group="addGroup"
            :on-add-tag="addTag"
            :on-remove="remove"
            :on-rename="rename"
            :on-alias="aliasGroup"
            :on-remove-alias="removeAlias"
            :resolve-node="resolveNode"
            :resolve-breadcrumb="resolveBreadcrumb"
            :resolve-path="resolvePath"
            :is-alias-ancestors-open="isAliasAncestorsOpen"
            :on-toggle-alias-ancestors="toggleAliasAncestors"
            :selectable="true"
            :on-select-group="applyAlias"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import GraphView from './components/GraphView.vue';
import TreeView from './components/TreeView.vue';
import {
  addNode,
  createNode,
  createSampleTree,
  findNode,
  findPathToNode,
  removeNode,
  renameNode,
  type TreeNode,
} from './store';

const nodes = ref<TreeNode[]>(createSampleTree());
const currentView = ref<'tree' | 'graph' | 'bulma' | 'videl'>(
  (localStorage.getItem('onebula-current-view') as 'tree' | 'graph' | 'bulma' | 'videl') ?? 'tree'
);
const bulmaRoot = computed(() => {
  const node = findNode(nodes.value, '13');
  return node ? [node] : [];
});
const videlRoot = computed(() => {
  const node = findNode(nodes.value, '80');
  return node ? [node] : [];
});
const aliasTargetId = ref<string | null>(null);
const showVidelAncestors = ref(false);
const openAliasAncestors = ref(new Set<string>());
const toggleVidelAncestors = () => {
  showVidelAncestors.value = !showVidelAncestors.value;
};

watch(currentView, (value) => {
  localStorage.setItem('onebula-current-view', value);
});

const refresh = () => {
  nodes.value = [...nodes.value];
};

const addGroup = (parentId: string | null) => {
  addNode(nodes.value, parentId, createNode('group'));
  refresh();
};

const addTag = (parentId: string | null) => {
  addNode(nodes.value, parentId, createNode('tag'));
  refresh();
};

const remove = (id: string) => {
  removeNode(nodes.value, id);
  refresh();
};

const rename = (id: string, name: string) => {
  renameNode(nodes.value, id, name);
  refresh();
};

const resolveNode = (id: string) => findNode(nodes.value, id);
const resolveBreadcrumb = (id: string) => {
  const path = findPathToNode(nodes.value, id) ?? [];
  return path
    .map((node) => node.tags.find((tag) => tag.tagType === 'Main')?.name ?? `G ${node.id}`)
    .join(' › ');
};
const resolvePath = (id: string) => findPathToNode(nodes.value, id) ?? [];

const isAliasAncestorsOpen = (id: string) => openAliasAncestors.value.has(id);
const toggleAliasAncestors = (id: string) => {
  const next = new Set(openAliasAncestors.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  openAliasAncestors.value = next;
};

const videlViewRoot = computed(() => {
  const path = findPathToNode(nodes.value, '80') ?? [];
  if (path.length === 0) {
    return [];
  }
  const videlNode = path[path.length - 1];
  if (!showVidelAncestors.value) {
    return [videlNode];
  }
  const cloneChain = (index: number): TreeNode => {
    const node = path[index];
    if (index === path.length - 1) {
      return node;
    }
    return {
      ...node,
      children: [cloneChain(index + 1)],
    };
  };
  return [cloneChain(0)];
});

const aliasGroup = (id: string) => {
  aliasTargetId.value = id;
};

const closeAliasModal = () => {
  aliasTargetId.value = null;
};

const applyAlias = (targetId: string) => {
  if (!aliasTargetId.value) {
    return;
  }
  const node = findNode(nodes.value, aliasTargetId.value);
  const target = findNode(nodes.value, targetId);
  if (!node || node.type !== 'group' || !target || target.type !== 'group') {
    return;
  }
  if (node.id === target.id) {
    return;
  }
  node.aliasOf = target.id;
  refresh();
  closeAliasModal();
};

const removeAlias = (id: string) => {
  const node = findNode(nodes.value, id);
  if (!node || node.type !== 'group') {
    return;
  }
  node.aliasOf = undefined;
  refresh();
};
</script>
