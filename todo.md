# Flowday — Résumé de session & Plan d'action

> App mobile d'organisation pour développeur | React Native + Expo | Windows

---

## Ce qu'on a fait aujourd'hui ✅

### Contexte & choix tech

- Analysé les outils existants (Sunsama, Linear, Notion) — aucun ne correspond exactement au besoin
- Décidé de **créer l'app from scratch**
- Choisi la stack : **React Native + Expo + TypeScript**
- Choisi l'IDE : **Zed**
- Nommé l'app : **Flowday**

### Setup réalisé

- [x] Projet créé : `npx create-expo-app@latest flowday --template blank-typescript`
- [x] App qui tourne sur le téléphone via **Expo Go**
- [x] Repo GitHub créé et pushé (`main`)
- [x] Structure de dossiers créée :

```
flowday/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx        ← Aujourd'hui
│   │   ├── projects.tsx     ← Projets
│   │   └── settings.tsx     ← Réglages
│   └── _layout.tsx          ← Navigation tabs
├── components/
├── store/
├── types/
├── app.json
├── index.ts
└── ...
```

- [x] Dépendances installées :
  - `expo-router`
  - `react-native-safe-area-context`
  - `react-native-screens`
  - `expo-linking`
  - `expo-constants`
  - `expo-status-bar`

### En cours

- [ ] Modifier `index.ts` → `import 'expo-router/entry'`
- [ ] Modifier `app.json` → ajouter `scheme` et `main`
- [ ] Créer `app/_layout.tsx` → navigation 3 onglets
- [ ] Créer les 3 écrans de base (Aujourd'hui / Projets / Réglages)

---

## Ce qu'on veut faire — Plan d'action

---

### Phase 0 — Setup & navigation ← ON EST LÀ

**Objectif** : avoir les 3 onglets qui s'affichent sur le téléphone

- [ ] `index.ts` → `import 'expo-router/entry'`
- [ ] `app.json` → ajouter `scheme: "flowday"` + `main: "expo-router/entry"`
- [ ] `app/_layout.tsx` → Tabs avec 3 écrans
- [ ] `app/(tabs)/index.tsx` → écran Aujourd'hui (vide pour l'instant)
- [ ] `app/(tabs)/projects.tsx` → écran Projets (vide)
- [ ] `app/(tabs)/settings.tsx` → écran Réglages (vide)
- [ ] Vérifier sur le téléphone que la navigation fonctionne
- [ ] Commit + push

---

### Phase 1 — Todo & Projets

**Objectif** : le cœur de l'app, gérer ses tâches et projets

#### Écran Aujourd'hui

- [ ] Afficher une liste de tâches du jour
- [ ] Ajouter une tâche (input + bouton)
- [ ] Cocher / décocher une tâche
- [ ] Supprimer une tâche
- [ ] Trier par priorité (haute 🔴 / moyenne 🟡 / faible 🟢)

#### Écran Projets

- [ ] Lister les projets existants
- [ ] Créer un projet (nom + couleur + priorité)
- [ ] Voir les tâches d'un projet
- [ ] Progression par projet (X / Y tâches complétées)

#### State management

- [ ] Installer et configurer **Zustand**
- [ ] Store `tasks` — CRUD des tâches
- [ ] Store `projects` — CRUD des projets

#### Persistance locale

- [ ] Installer **AsyncStorage** ou **MMKV**
- [ ] Les données survivent à la fermeture de l'app

---

### Phase 2 — Emploi du temps journalier

**Objectif** : structurer la journée avec des blocs de temps

- [ ] Configurer une **journée type** (blocs récurrents)
  - Exemple : Deep Work 9h-12h / Code Review 14h-15h / etc.
- [ ] Vue **timeline verticale** du jour
- [ ] Indicateur de l'heure actuelle (ligne rouge)
- [ ] Lier les tâches aux blocs de temps
- [ ] Indicateur de charge (trop chargé / ok / léger)

---

### Phase 3 — Polish & UX

**Objectif** : rendre l'app agréable au quotidien

- [ ] **Timer Pomodoro** (25 min focus / 5 min pause)
- [ ] Notification de fin de timer
- [ ] **Récap fin de journée** (tâches complétées, report au lendemain)
- [ ] **Thème sombre / clair** automatique (`useColorScheme`)
- [ ] Animations fluides (`react-native-reanimated`)

---

### Phase 4 — Sync cloud (optionnel)

**Objectif** : accéder à ses données depuis plusieurs appareils

- [ ] Créer un compte **Supabase** (gratuit)
- [ ] Authentification (email / magic link)
- [ ] Sync projets et tâches en base de données
- [ ] Mode offline-first

---

## Stack complète

| Rôle              | Outil                   |
| ----------------- | ----------------------- |
| Framework         | React Native + Expo     |
| Navigation        | Expo Router             |
| State             | Zustand                 |
| Stockage local    | AsyncStorage / MMKV     |
| Animations        | react-native-reanimated |
| Cloud (plus tard) | Supabase                |
| IDE               | Zed                     |
| Repo              | GitHub (private)        |
| Test sur mobile   | Expo Go                 |

---

## Rappel commandes utiles

```powershell
# Lancer l'app
npx expo start

# Si problème réseau
npx expo start --tunnel

# Installer une lib
npx expo install <package>

# Commit et push
git add .
git commit -m "message"
git push
```
