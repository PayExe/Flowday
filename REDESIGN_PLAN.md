# Plan de Redesign — Flowday Partie 2

> Document généré par l'agent IA pour la refonte visuelle de Flowday.
> Basé sur AGENTS.md Partie 2 + README.md sessions.

---

## Vue d'ensemble

| Session | Objectif | Fichiers principaux | ~Commits |
|---|---|---|---|
| 1 | Fondations theme-aware | `Divider.tsx`, `Card.tsx`, `Button.tsx`, `EmptyState.tsx` | 3 |
| 2 | Restructuration 5 tabs | `_layout.tsx`, `planning.tsx`, `index.tsx` | 3 |
| 3 | Dashboard Accueil | `index.tsx`, `streaks.ts` | 3 |
| 4 | Redesign Planning | `planning.tsx`, `CurrentTimeLine.tsx` | 3 |
| 5 | Polish Semaine/Blocs/Réglages | `week.tsx`, `blocks.tsx`, `settings.tsx` | 3 |
| 6 | Light mode + cleanup | `package.json`, tous les écrans | 3 |

---

## Règles strictes (appliquées partout)

1. **Tout utilise `useTheme()`** — pas de couleur en dur, pas de `ColorsDark`/`Colors` legacy.
2. **Tout utilise les tokens typo** — `typography.headline`, `typography.footnote`, etc. Pas de `fontSize` en dur.
3. **Padding et radius cohérents** — tab bar bg = `bg.primary`, headers padding = 16, groupes radius = 13.
4. **Section headers** — pattern unique : `fontSize: 13, color: text.secondary, letterSpacing: -0.08, uppercase`.
5. **Divider utilise `useTheme()`** — plus d'import de `{ Colors }` statique.
6. **Séparateurs indentés** — tous les items en groupe Apple : `marginLeft: 57` sur le hairline.
7. **Tab bar** — 5 items max, active tint = `system.blue`, inactive = `system.gray`.
8. **FAB** — position vérifiée par rapport à la tab bar (pas de chevauchement).
9. **Radius** : `Button` = 10 (md), groupes Apple = 13 (lg), sheets = 20 (xl).
10. **Zéro font size en dur** — toujours via `typography.sizes.*`.

---

## Session 1 — Fondations : tout rendre theme-aware

### Fichiers à modifier

- **`src/components/ui/Divider.tsx`**
  - Remplacer `import { Colors }` statique par `useTheme()` + `colors.separator.hairline`.
- **`src/components/ui/Card.tsx`**
  - Supprimer entièrement le `StyleSheet.create` (lignes 31–39) qui contient `#1C1C1E`, `#38383A` en dur.
  - Les valeurs inline dans le JSX utilisent déjà `useTheme()`.
- **`src/components/ui/Button.tsx`**
  - Nettoyer le `StyleSheet.create` : `fontWeight: '600'` et `fontSize: 15` en dur (lignes 70–72) → utiliser `typography`.
- **`src/components/shared/EmptyState.tsx`**
  - Nettoyer le `StyleSheet.create` : `fontSize: 17` et `fontSize: 13` en dur → utiliser `typography`.

### Fichiers à vérifier (ne pas toucher si OK)

- `IconButton.tsx`, `PrioritySelector.tsx`, `PriorityBadge.tsx`.

### Commits

1. `fix(ui): Divider theme-aware with useTheme hook`
2. `fix(ui): Card remove hardcoded dark StyleSheet`
3. `fix(ui): Button & EmptyState cleanup hardcoded font sizes`

---

## Session 2 — Restructuration 5 tabs

### Actions

1. **`app/(tabs)/_layout.tsx`** — Passer de 4 à 5 tabs :
   - Tab 1 : `index` → `Accueil` + icône `house`/`house.fill`
   - Tab 2 : `planning` → `Planning` + icône `calendar` (NOUVEAU)
   - Tab 3 : `week` → `Semaine` + icône `calendar.badge.clock`
   - Tab 4 : `blocks` → `Blocs` + icône `square.grid.2x2`
   - Tab 5 : `settings` → `Réglages` + icône `gear`
   - Tab bar bg = `colors.bg.primary` (#000000 en dark)
   - Active tint = `colors.system.blue`, inactive = `colors.system.gray`

2. **`app/(tabs)/planning.tsx`** — Créer en copiant l'actuel `index.tsx` (Today) et en l'adaptant :
   - Renommer `TodayScreen` → `PlanningScreen`
   - Supprimer le `DayScoreHeader` (déplacé vers Accueil)
   - Renommer header "Aujourd'hui" → "Planning"

3. **`app/(tabs)/index.tsx`** — Remplacer par un écran dashboard vierge (juste le header "Accueil" + background)

### Commits

1. `feat(tabs): restructure to 5 tabs layout with home and planning`
2. `feat(planning): create planning tab from existing today screen`
3. `feat(home): scaffold empty home dashboard`

---

## Session 3 — Page Accueil (Dashboard)

### Nouveau fichier

- **`src/utils/streaks.ts`**
  - Fonction `calculateStreaks(scores: DayScore[], threshold = 60)` :
    - Parcourt `scores` triés par date.
    - Compte les jours consécutifs où `total >= threshold`.
    - Retourne `{ currentStreak: number, bestStreak: number }`.

### `app/(tabs)/index.tsx` — Dashboard complet

- **Header** : Date + intention du jour (via `ritualStore.getTodayLog('morning')?.intention`).
- **DayScoreHeader** (composant existant, réutilisé).
- **Prochain bloc** :
  - Logique : chercher le bloc actuel (now entre startTime et endTime), sinon le prochain bloc futur.
  - Carte colorée avec emoji, nom, horaires.
  - Si aucun bloc futur → "Journée terminée".
- **Streaks** :
  - Afficher `currentStreak` jours (ex: "🔥 5 jours consécutifs").
  - Barre de progression vers best streak.
- **3 tâches prioritaires** :
  - `getIncompleteTodayTasks()` → trier par `priority` (high > medium > low) → slice(0,3).
  - Affichage en groupe Apple (radius 13, séparateurs indentés marginLeft 57).
- **Bannière Morning Ritual** :
  - Si `!hasDoneMorningToday()` → carte pressable orange vers `/morning-ritual`.

### Commits

1. `feat(utils): add streak calculation from day scores`
2. `feat(home): add DayScore, next block, and streaks sections`
3. `feat(home): add priority tasks and morning ritual banner`

---

## Session 4 — Redesign Planning

### `app/(tabs)/planning.tsx`

- **Header épuré** :
  - "Mardi 26 mai · 6h planifiées" (au lieu du grand DayScore).
  - Utilise `typography.screenTitle` + `typography.subheadline`.
- **Section "Tâches" groupée** :
  - Déplacée AVANT la timeline.
  - Groupe Apple (bg secondary, radius 13).
  - Séparateurs indentés `marginLeft: 57` entre tâches.
  - Input d'ajout rapide en haut de la section (relié au même state).
- **Timeline** :
  - Supprimer le `+ 40` dans `timelineContainer.height`.
  - Supprimer `paddingBottom: 40` du timelineContainer.
  - Padding cohérent `marginHorizontal: 16`.
- **`CurrentTimeLine.tsx`** :
  - Remplacer `colors.system.red` par `colors.nowLine`.
- **FAB Focus** :
  - Position `bottom: 88` (au-dessus de la tab bar, pas de chevauchement).
  - Garder le style existant.

### Commits

1. `redesign(planning): clean header with date and planned hours`
2. `redesign(planning): group tasks section before timeline`
3. `redesign(planning): remove +40 workaround, fix nowLine color`

---

## Session 5 — Polish Semaine, Blocs, Réglages

### `app/(tabs)/week.tsx`

- Section headers cohérents : `typography.sectionHeader` (au lieu du `dayTitle` custom `fontSize: 20`).
- Padding header unifié : `paddingTop: 16` (vérifier cohérence).
- Jours espacés : `marginBottom: 24` déjà OK.

### `app/(tabs)/blocks.tsx`

- Vérifier `LifeBlockCard` et `EditBlockModal` en light mode.
- Séparateurs archivés : vérifier `marginLeft: 57`.
- Section header "Archivés" via `typography.sectionHeader`.

### `app/(tabs)/settings.tsx`

- Vérifier fond du `SegmentedControl` : `backgroundColor={colors.bg.secondary}` déjà OK.
- Vérifier icônes des cellules en light mode (bg des icones colorées).

### Commits

1. `polish(week): consistent section headers and padding`
2. `polish(blocks): verify light mode and indented separators`
3. `polish(settings): segmented control and cell icons verification`

---

## Session 6 — Vérification light mode + cleanup

### Vérifications

- Tous les écrans (`morning-ritual.tsx`, `evening-wrap.tsx`, `focus.tsx`, modals) en light mode.
- Modals (`EditBlockModal`, `EditTemplateBlockModal`) en light mode.

### Cleanup

- **`package.json`** : Supprimer `uuid`, `@types/uuid`, `expo-linear-gradient`.
- **`src/components/ui/Divider.tsx`** : Confirmer qu'il n'y a plus d'import `{ Colors }` legacy.
- Recherche globale des imports `import { Colors }` ou `ColorsDark`/`ColorsLight` en dur dans les composants → nettoyer.

### Commits

1. `fix(theme): full light mode verification across all screens`
2. `chore(deps): uninstall uuid, @types/uuid, expo-linear-gradient`
3. `chore(cleanup): remove legacy Colors static imports`

---

## Points de vigilance identifiés

| Fichier | Problème | Session |
|---|---|---|
| `CurrentTimeLine.tsx` | Utilise `colors.system.red` au lieu de `colors.nowLine` | 4 |
| `TimelineBlock.tsx` | `fontSize` en dur (12, 14, 15, 13) non via `typography` | 4 |
| `TaskCard.tsx` | `fontSize: 17` en dur (ligne 64) | 1 (vérif) |
| `DayScoreHeader.tsx` | `fontSize: 56, 17, 13` en dur | 3 (coexiste avec dashboard) |
| `app.json` | Déjà `"userInterfaceStyle": "automatic"` ✅ | — |

---

## Validation

- Streak : seuil 60 points (configurable dans `calculateStreaks`).
- Prochain bloc : actuel en priorité, sinon prochain futur, sinon "Journée terminée".
- Icônes SFSymbols pour les 5 tabs : `house`, `calendar`, `calendar.badge.clock`, `square.grid.2x2`, `gear`.

---

_Document généré le 25 mai 2026. Dernière mise à jour : lancement Session 1._
