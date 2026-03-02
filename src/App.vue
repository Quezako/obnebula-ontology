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
        :resolve-node="resolveNode"
      />
    </section>

    <GraphView v-else :nodes="nodes" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import GraphView from './components/GraphView.vue';
import TreeView from './components/TreeView.vue';
import { addNode, createNode, createSampleTree, findNode, removeNode, renameNode, type TreeNode } from './store';

const nodes = ref<TreeNode[]>(createSampleTree());
const currentView = ref<'tree' | 'graph'>('tree');

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

const aliasGroup = (id: string) => {
  const targetId = window.prompt('ID du groupe à référencer ?');
  if (!targetId) {
    return;
  }
  const node = findNode(nodes.value, id);
  const target = findNode(nodes.value, targetId);
  if (!node || node.type !== 'group' || !target || target.type !== 'group') {
    return;
  }
  if (node.id === target.id) {
    return;
  }
  node.aliasOf = target.id;
  refresh();
};
</script>
