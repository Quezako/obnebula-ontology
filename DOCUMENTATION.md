# Documentation du POC Onebula Ontology

Cette maquette (Vue 3 + Vite) illustre un éditeur d'ontologie simple basé sur un arbre de **groupes** et **tags**, avec drag & drop et édition en mémoire.

## Objectif

- Visualiser une ontologie sous forme d'arbre.
- Créer, renommer et supprimer des nœuds (groupes / tags).
- Réorganiser l'arbre par glisser‑déposer.

## Modèle de données

Chaque nœud suit la structure suivante (voir `src/store.ts`) :

- `id`: identifiant unique.
- `name`: libellé du nœud.
- `type`: `group` ou `tag`.
- `children`: liste de nœuds enfants.

Règles :

- Un **groupe** peut contenir des groupes ou des tags.
- Un **tag** ne peut pas contenir d’enfants.

## Fonctionnement général

### Écran principal

Le composant `App.vue` affiche :

- Un titre et un sous‑titre.
- Une barre d’actions pour ajouter un **groupe racine** ou un **tag racine**.
- La vue d’arbre rendue par `TreeView.vue`.

### Arbre et nœuds

- `TreeView.vue` affiche une liste de nœuds via `vue-draggable-next`.
- `TreeNode.vue` gère l’affichage d’un nœud, son édition et ses actions.
- Les groupes sont **rétractables** / **dépliables**.

### Actions disponibles

Pour chaque nœud :

- **+ Groupe** (uniquement sur un groupe)
- **+ Tag** (uniquement sur un groupe)
- **Renommer**
- **Supprimer**

### Drag & drop

- Le glisser‑déposer est activé sur l’arbre.
- Un nœud ne peut pas être déposé dans un **tag**.
- Un nœud ne peut pas être déplacé dans l’un de ses **descendants**.

## Données et persistance

- Les données sont générées par `createSampleTree()` au démarrage.
- **Aucune persistance** : tout reste en mémoire.

## Limitations connues

- Pas de base de données.
- Pas de validation avancée (noms en double, etc.).
- Les tags n’acceptent pas d’enfants.

## Lancer le POC

Se référer à `README.md` pour l’installation et les commandes.
