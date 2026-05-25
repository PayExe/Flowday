# Flowday

> Outil de design de vie pour développeurs et knowledge workers.
> React Native + Expo SDK 54 · iOS & Android

---

## Stack

| Technologie | Version |
|---|---|
| React Native | 0.81.5 |
| Expo SDK | ~54.0.33 |
| Expo Router | ~6.0.23 |
| Zustand | ^5.0.13 |
| AsyncStorage | 2.2.0 |
| Reanimated | ~4.1.1 |
| @gorhom/bottom-sheet | ^5.2.14 |

---

## État des lieux

L'app MVP v1.0 est fonctionnelle (Life Blocks, Template, Timeline, Tasks, Day Score, Rituals, Focus, Thèmes).

**Problèmes visuels actuels :**
- Composants avec couleurs dark en dur → cassés en light mode
- Tab bar fond `#1C1C1E` au lieu de `#000000`
- Headers, padding, section headers incohérents
- Typo tokens jamais utilisés (tout en dur)
- Rayons de boutons différents selon les écrans
- Timeline workaround `+40px`
- Aucune page d'accueil (dashboard)
- Structure pas claire ("Aujourd'hui" mélange timeline + tasks + score)

---

## Nouvelle structure — 5 tabs

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│ Accueil  │ Planning │ Semaine  │  Blocs   │ Réglages │
│ Dashboard│ Timeline │ Template │ Life     │ Config   │
│ (résumé) │ + Tâches │ semaine  │ Blocks   │          │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Tab 1 — Accueil (nouveau)
Dashboard avec :
- **Day Score** (grand chiffre + label + 4 barres)
- **Prochain bloc** (la prochaine activité de la journée)
- **Streaks** (séquences en cours par Life Block)
- **Tâches prioritaires** du jour (max 3)
- **Bannière Morning Ritual** si pas fait
- Vue sobre, pas de timeline, juste l'essentiel

### Tab 2 — Planning (ex "Aujourd'hui")
Timeline verticale + tâches, recentré sur la **lecture de la journée** :
- Timeline 06h-23h avec ligne MAINTENANT
- Blocs colorés avec tâches embeddées
- Ajout de tâche rapide
- Créneaux libres
- Header épuré (juste la date)

### Tab 3 — Semaine (actuel, à polir)
Éditeur de template 7 jours :
- Même structure, visuels améliorés
- Section headers cohérents
- Padding unifié

### Tab 4 — Blocs (actuel, à polir)
CRUD Life Blocks :
- Cartes améliorées avec vraie progress bar
- Drag & drop (à venir après)
- Archivés en footer groupé

### Tab 5 — Réglages (actuel, à polir)
Thème, config rituals, à propos.

---

## Direction visuelle

**Apple UIKit (Dark + Light)** — mais bien appliqué :

| Règle | Actuellement | Cible |
|---|---|---|
| Tab bar bg | `#1C1C1E` (secondary) | `#000000` (primary) |
| Composants theme-aware | Certains non (Divider, etc.) | 100% via `useTheme()` |
| Typo tokens | Pas utilisés | Partout via `typography.headline`, etc. |
| Section headers | 3 implémentations différentes | 1 pattern unique |
| Radius boutons | 10 ici, 13 là | Unifié : md(10) |
| Padding header | 12 / 16 / incohérent | Unifié : 16 |
| Séparateur indenté | Parfois, pas toujours | Partout (marginLeft 57) |

---

## Plan de travail

### Session 1 — Fondations

**Objectif :** tout rendre theme-aware, corriger les composants cassés

Fichiers à modifier :
- `src/components/ui/Divider.tsx` — passage à `useTheme()`
- `src/components/ui/Card.tsx` — supprimer le StyleSheet hardcodé
- `src/components/ui/Button.tsx` — vérifier
- `src/components/ui/IconButton.tsx` — vérifier
- `src/components/shared/PriorityBadge.tsx` — déjà bon ? check `colors` usage
- `src/components/shared/ProgressBar.tsx` — déjà bon
- `app.json` — `"userInterfaceStyle": "automatic"`

```bash
git add .
git commit -m "fix: make all components theme-aware, ui foundation"
```

---

### Session 2 — Restructuration tabs

**Objectif :** passer de 4 à 5 tabs

- Créer `app/(tabs)/index.tsx` (nouvel Accueil)
- Renommer l'ancien Today en `app/(tabs)/planning.tsx`
- Mettre à jour `app/(tabs)/_layout.tsx` : 5 tabs avec les bons Symboles
- Vérifier que la navigation fonctionne

```bash
git add .
git commit -m "feat: restructure tabs - home, planning, week, blocks, settings"
```

---

### Session 3 — Page Accueil (Home)

**Objectif :** créer le dashboard principal

Nouveau fichier : `app/(tabs)/index.tsx`

Éléments :
```
┌─────────────────────────────┐
│ Header : date + intention   │
├─────────────────────────────┤
│                             │
│          74                 │  ← Day Score (grand)
│     Bonne journée           │
│                             │
│  Blocs    ████████░░  80%   │
│  Tâches   ██████░░░░  60%   │
│  Focus    █████████░  90%   │
│  Rituals  █████░░░░░  50%   │
│                             │
├─────────────────────────────┤
│                             │
│  Prochain bloc              │
│  ┌─────────────────────┐    │
│  │ 🏃 Sport · 14h-15h  │    │  ← card colorée
│  │ Salle de sport       │    │
│  └─────────────────────┘    │
│                             │
│  Streaks                    │
│  🔥 Work · 5 jours         │
│  💔 Sport · streak cassé   │
│                             │
│  Tâches du jour (3 max)    │
│  ☐ Finir auth Supabase     │
│  ☐ Review PR               │
│                             │
│  [Commencer la journée →]  │  ← si morning pas fait
└─────────────────────────────┘
```

```bash
git add .
git commit -m "feat: home dashboard with score, next block, streaks, tasks"
```

---

### Session 4 — Redesign Planning (timeline)

**Objectif :** une timeline claire, lisible, agréable

Fichier : `app/(tabs)/planning.tsx`

Modifications :
- Header : jour + date + charge (ex: "Mardi 26 mai · 6h planifiées")
- Timeline : ligne MAINTENANT plus visible, blocs mieux espacés
- Tasks : section groupée avant la timeline, plus aérée
- Supprimer les `+40` et workaround de hauteur
- Padding cohérent partout
- FAB focus : garder mais check position par rapport à la tab bar

```bash
git add .
git commit -m "redesign: planning timeline with consistent spacing and layout"
```

---

### Session 5 — Polish Semaine + Blocs + Réglages

**Objectif :** harmoniser tous les écrans avec le design system

- **Semaine** (`week.tsx`) : section headers, padding, jours espacés
- **Blocs** (`blocks.tsx`) : cartes plus propres, séparateurs indentés
- **Réglages** (`settings.tsx`) : déjà bien, juste vérifier light mode
- Vérifier que tous les écrans utilisent `typography` tokens
- Vérifier tous les padding = multiples de 4

```bash
git add .
git commit -m "polish: standardize week, blocks, settings screens"
```

---

### Session 6 — Vérification light mode + final

**Objectif :** zéro bug visuel, prêt à montrer

- Tester tous les écrans en light mode
- Vérifier Morning Ritual + Evening Wrap en light
- Vérifier focus mode
- Vérifier les modals (EditBlockModal, EditTemplateBlockModal)
- `app.json` → `"userInterfaceStyle": "automatic"`
- Désinstaller `uuid`, `@types/uuid`, `expo-linear-gradient`

```bash
git add .
git commit -m "fix: full light mode pass, remove dead deps"
```

---

## Pour lancer

```bash
npx expo start
npx expo export --platform ios  # vérification bundle
```
