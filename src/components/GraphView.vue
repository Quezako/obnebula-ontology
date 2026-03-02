<template>
  <section class="panel graph">
    <header class="graph__header">
      <h2 class="graph__title">Vue graphe (relations)</h2>
      <p class="graph__subtitle">
        Lecture rapide des nœuds et de leurs liens (is-a, instance-of, alias, override).
      </p>
    </header>

    <div class="graph__legend">
      <span class="graph__badge graph__badge--is-a">is-a</span>
      <span class="graph__badge graph__badge--instance">instance-of</span>
      <span class="graph__badge graph__badge--alias">alias</span>
      <span class="graph__badge graph__badge--override">override</span>
    </div>

    <div class="graph__columns">
      <div class="graph__column">
        <h3 class="graph__column-title">Groupes</h3>
        <div class="graph__stack">
          <div v-for="group in groupNodes" :key="group.id" class="graph__card">
            <div class="graph__card-title">
              G {{ group.id }}
              <span v-if="group.isAlias" class="graph__card-pill">alias</span>
            </div>
            <div class="graph__card-sub">Main: {{ group.mainTag ?? '—' }}</div>
            <div v-if="group.tags.length" class="graph__card-tags">
              <span v-for="tag in group.tags" :key="tag.id" class="graph__chip">
                {{ tag.label }}
              </span>
            </div>
            <div v-if="group.belongsTo" class="graph__card-sub">
              appartient à: {{ group.belongsTo }}
            </div>
          </div>
        </div>
      </div>

      <div class="graph__column graph__column--relations">
        <h3 class="graph__column-title">Relations</h3>
        <div class="graph__stack">
          <div v-for="group in groupRelations" :key="group.id" class="graph__relation-group">
            <div class="graph__relation-title">{{ group.label }}</div>
            <div v-for="edge in group.edges" :key="edge.id" class="graph__relation">
              <span class="graph__badge" :class="badgeClass(edge.kind)">{{ edge.kind }}</span>
              <span class="graph__relation-text">{{ edge.fromLabel }} → {{ edge.toLabel }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="graph__column">
        <h3 class="graph__column-title">Tags</h3>
        <div class="graph__stack">
          <div v-for="tag in tagNodes" :key="tag.id" class="graph__card graph__card--tag">
            <div class="graph__card-title">{{ tag.label }}</div>
            <div v-if="tag.overrideFrom" class="graph__card-sub">override: {{ tag.overrideFrom }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TreeNode } from '../store';
import { graphRelations, type RelationKind } from '../graph-data';

interface Props {
  nodes: TreeNode[];
}

const props = defineProps<Props>();

const flatten = (nodes: TreeNode[], depth = 0, acc: TreeNode[] = []) => {
  for (const node of nodes) {
    acc.push(node);
    if (node.type === 'group') {
      flatten(node.children, depth + 1, acc);
      flatten(node.tags, depth + 1, acc);
    }
  }
  return acc;
};

const nodes = computed(() => {
  const list = flatten(props.nodes);
  return list;
});

const groupNodes = computed(() =>
  nodes.value
    .filter((node) => node.type === 'group')
    .map((node) => ({
      id: node.id,
      isAlias: Boolean(node.aliasOf),
      mainTag: node.tags.find((tag) => tag.tagType === 'Main')?.name ?? null,
      tags: node.tags.map((tag) => ({
        id: tag.id,
        label: `${tag.name} (${tag.tagType ?? 'Main'})`,
      })),
      belongsTo: parentMap.value.get(node.id) ?? null,
    }))
);

const tagNodes = computed(() =>
  nodes.value
    .filter((node) => node.type === 'tag')
    .map((node) => ({
      id: node.id,
      label: `${node.name} (${node.tagType ?? 'Main'})`,
      overrideFrom: node.overrideFrom,
    }))
);

const nodeLabel = (id: string) => {
  const node = nodes.value.find((item) => item.id === id);
  if (!node) {
    return `Node ${id}`;
  }
  if (node.type === 'group') {
    return `G ${node.id}`;
  }
  return `${node.name} (${node.tagType ?? 'Main'})`;
};

const edgeList = computed(() =>
  graphRelations.map((relation) => ({
    id: relation.id,
    kind: relation.kind,
    fromLabel: nodeLabel(relation.from),
    toLabel: nodeLabel(relation.to),
  }))
);

const groupRelations = computed(() => {
  const grouped = new Map<string, { id: string; label: string; edges: typeof edgeList.value }>();
  for (const edge of edgeList.value) {
    const key = edge.fromLabel;
    if (!grouped.has(key)) {
      grouped.set(key, { id: key, label: key, edges: [] });
    }
    grouped.get(key)!.edges.push(edge);
  }
  return Array.from(grouped.values());
});

const parentMap = computed(() => {
  const map = new Map<string, string>();
  const walk = (node: TreeNode) => {
    if (node.type === 'group') {
      for (const child of node.children) {
        map.set(child.id, `G ${node.id}`);
        walk(child);
      }
    }
  };
  props.nodes.forEach(walk);
  return map;
});

const badgeClass = (kind: RelationKind) => {
  if (kind === 'instance-of') {
    return 'graph__badge--instance';
  }
  if (kind === 'alias') {
    return 'graph__badge--alias';
  }
  if (kind === 'override') {
    return 'graph__badge--override';
  }
  return 'graph__badge--is-a';
};
</script>
