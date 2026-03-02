<template>
  <div class="app">
    <header class="app__header">
      <div>
        <h1 class="app__title">Ontology Builder</h1>
        <p class="app__subtitle">Maquette statique pour gérer des groupes et tags.</p>
      </div>
    </header>

    <section class="panel">
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
      />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TreeView from './components/TreeView.vue';
import { addNode, createNode, createSampleTree, removeNode, renameNode, type TreeNode } from './store';

const nodes = ref<TreeNode[]>(createSampleTree());

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
</script>
