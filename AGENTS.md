# Flowday — Documentation Technique

> Ce document est structuré en 2 parties :
> - **Partie 1 (terminée)** : MVP v1.0 fonctionnel — features, stores, types, design system
> - **Partie 2 (en cours)** : Refonte visuelle — 5 tabs, nouveaux écrans, polish UI
>
> Si tu es un agent IA travaillant sur la Partie 2, lis UNIQUEMENT la Partie 2
> et le README.md pour les sessions de redesign. Ne modifie PAS la Partie 1.

---

# PARTIE 2 — REFONTE VISUELLE (en cours)

> Objectif : rendre l'app belle, cohérente, et agréable au quotidien.
> Apple UIKit appliqué correctement partout, 0 exception.

## Contexte

**Flowday** est un outil de design de vie pour développeurs et knowledge workers. L'utilisateur ne subit pas sa semaine, il la **conçoit**. Une fois sa semaine type définie, Flowday l'aide à la tenir jour après jour.

## Stack Technique

| Technologie                                       | Version           | Rôle                                            |
| ------------------------------------------------- | ----------------- | ----------------------------------------------- |
| React Native                                      | 0.81.5            | Framework UI natif                              |
| Expo SDK                                          | ~54.0.33          | Tooling, bundler, OTA                           |
| Expo Router                                       | ~6.0.23           | Navigation file-based                           |
| React                                             | 19.1.0            | Core UI                                         |
| Zustand                                           | ^5.0.13           | State management (avec persistance)             |
| AsyncStorage                                      | 2.2.0             | Persistance locale                              |
| react-native-reanimated                           | SDK 54            | Animations (bottom sheets)                      |
| @gorhom/bottom-sheet                              | compatible SDK 54 | Bottom sheets natifs iOS                       |
| expo-symbols                                      | SDK 54            | SFSymbols natifs Apple                           |
| expo-blur                                         | SDK 54            | Backdrop flouté (sheets, modals)               |
| @react-native-picker/picker                     | SDK 54            | Picker wheel natif iOS                         |
| ContextMenu (custom)                            | ActionSheetIOS RN | Menu long-press via ActionSheet natif iOS      |
| @react-native-segmented-control/segmented-control | compatible SDK 54 | Segmented control natif iOS                    |
| lucide-react-native                               | compatible SDK 54 | Icônes fallback (Android)                      |
| expo-haptics                                      | SDK 54            | Feedback tactile                                |
| expo-linear-gradient                              | SDK 54            | Dégradés (jauges, scores) — réservé futur     |
| date-fns                                          | compatible SDK 54 | Manipulation de dates (utilisé avec précaution) |

> **Important** : Tous les packages sont 100% compatibles **Expo Go** (pas de module natif custom). MMKV a été remplacé par AsyncStorage pour cette raison.

---

## Architecture à atteindre

```
Flowday/
├── app/
│   ├── _layout.tsx                 # Root layout (redirect ritual matin)
│   ├── morning-ritual.tsx          # Morning Ritual (5 étapes)
│   ├── evening-wrap.tsx            # Evening Wrap (4 étapes)
│   ├── focus.tsx                   # Focus Mode (pomodoro plein écran)
│   └── (tabs)/
│       ├── _layout.tsx             # Tab bar (5 onglets — à modifier)
│       ├── index.tsx               # Accueil (Dashboard — à CRÉER)
│       ├── planning.tsx            # Planning (Timeline — à CRÉER)
│       ├── week.tsx                # Semaine (à POLIR)
│       ├── blocks.tsx              # Blocs (à POLIR)
│       └── settings.tsx            # Réglages (à POLIR)
│
├── src/
│   ├── types/                      # Types — NE PAS MODIFIER
│   ├── features/                   # Stores — NE PAS MODIFIER
│   │
│   ├── components/
│   │   ├── dayScore/
│   │   │   └── DayScoreHeader.tsx  # À conserver (déjà theme-aware)
│   │   ├── lifeBlocks/
│   │   │   ├── LifeBlockCard.tsx   # À vérifier
│   │   │   └── EditBlockModal.tsx  # À vérifier light mode
│   │   ├── tasks/
│   │   │   └── TaskCard.tsx        # À conserver
│   │   ├── templates/
│   │   │   ├── TemplateBlockCard.tsx  # À vérifier
│   │   │   └── EditTemplateBlockModal.tsx  # À vérifier light mode
│   │   ├── timeline/
│   │   │   ├── CurrentTimeLine.tsx # À conserver
│   │   │   ├── FreeSlot.tsx        # À conserver
│   │   │   ├── HourMarker.tsx      # À conserver
│   │   │   └── TimelineBlock.tsx   # À conserver
│   │   ├── shared/
│   │   │   ├── EmptyState.tsx      # À conserver
│   │   │   ├── PriorityBadge.tsx   # À vérifier
│   │   │   ├── PrioritySelector.tsx# À vérifier light mode
│   │   │   └── ProgressBar.tsx     # À vérifier
│   │   └── ui/
│   │       ├── Button.tsx          # Theme-aware ✅
│   │       ├── Card.tsx            # StyleSheet contient du dark en dur — à NETTOYER
│   │       ├── Divider.tsx         # Importe `{ Colors }` static — à CORRIGER
│   │       ├── IconButton.tsx      # Theme-aware ✅
│   │       ├── Symbol.tsx          # Pas de couleur, OK
│   │       └── BottomSheetModal.tsx# Theme-aware ✅
│   │
│   ├── theme/                      # Déjà bien — NE PAS MODIFIER
│   │   ├── index.ts                # useTheme() hook
│   │   └── colors.ts               # Palettes Dark & Light
│   │
│   └── utils/
│       ├── id.ts                   # NE PAS MODIFIER
│       └── haptics.ts              # NE PAS MODIFIER
```

---

## Nouvelle structure des tabs (5 onglets)

| # | Tab | Rôle | Fichier |
|---|-----|------|---------|
| 1 | **Accueil** | Dashboard : score, prochain bloc, streaks, tâches rapides | `app/(tabs)/index.tsx` |
| 2 | **Planning** | Timeline verticale + tâches du jour | `app/(tabs)/planning.tsx` |
| 3 | **Semaine** | Éditeur template 7 jours | `app/(tabs)/week.tsx` |
| 4 | **Blocs** | CRUD Life Blocks | `app/(tabs)/blocks.tsx` |
| 5 | **Réglages** | Thème, config rituals, à propos | `app/(tabs)/settings.tsx` |

---

## Règles strictes pour le redesign

1. **Tout utilise `useTheme()`** — pas de couleur en dur, pas de `ColorsDark`/`Colors` legacy
2. **Tout utilise les tokens typo** — `typography.headline`, `typography.footnote`, etc. pas de fontSize en dur
3. **Padding et radius cohérents** — tab bar bg = `bg.primary` (#000000), headers padding = 16, groups radius = 13
4. **Section headers** — pattern unique : `fontSize: 13, color: text.secondary, letterSpacing: -0.08, uppercase`
5. **Divider utilise `useTheme()`** — plus d'import de `{ Colors }` statique
6. **Séparateurs indentés** — tous les items en groupe Apple : `marginLeft: 57` sur le hairline
7. **Tab bar** — 5 items max, active tint = `system.blue`, inactive = `system.gray`
8. **FAB** — position vérifiée par rapport à la tab bar (pas de chevauchement)
9. **Radius** : `Button` = 10 (md), groupes Apple = 13 (lg), sheets = 20 (xl)
10. **Zéro font size en dur** — toujours via `typography.sizes.*`

---

## Sessions de redesign

> Référence détaillée dans `README.md`. Exécuter les sessions dans l'ordre.

### Session 1 — Fondations : tout rendre theme-aware

**Fichiers à modifier :**
- `src/components/ui/Divider.tsx` — Remplacer `import { Colors }` par `useTheme()`
- `src/components/ui/Card.tsx` — Nettoyer le StyleSheet (supprimer les couleurs en dur)

**Fichiers à vérifier (si déjà theme-aware, ne pas y toucher) :**
- `src/components/ui/Button.tsx`
- `src/components/ui/IconButton.tsx`
- `src/components/shared/PrioritySelector.tsx`
- `src/components/shared/PriorityBadge.tsx`
- `src/app.json` → mettre `"userInterfaceStyle": "automatic"`

### Session 2 — Restructuration 5 tabs

**Actions :**
1. Modifier `app/(tabs)/_layout.tsx` — passer de 4 à 5 tabs
2. Créer `app/(tabs)/planning.tsx` — déplacer le contenu de l'actuel `index.tsx` (Today)
3. Créer un nouveau `app/(tabs)/index.tsx` vierge pour l'Accueil

### Session 3 — Page Accueil (dashboard)

**Créer `app/(tabs)/index.tsx`** avec :
- Header : date + intention du jour (si morning ritual fait)
- DayScoreHeader (réutiliser le composant existant)
- Prochain bloc (carte colorée)
- Streaks (à calculer depuis dayScore store)
- 3 tâches les plus prioritaires du jour
- Bannière Morning Ritual si pas fait

### Session 4 — Redesign Planning

**Modifier `app/(tabs)/planning.tsx`** :
- Header épuré : "Mardi 26 mai · 6h planifiées"
- Section "Tâches" groupée avant la timeline
- Timeline avec padding cohérent, supprimer les +40 workaround
- Couleur NOW line = `colors.nowLine`

### Session 5 — Polish Semaine, Blocs, Réglages

**`app/(tabs)/week.tsx`** :
- Section headers cohérents
- Padding header unifié (16)

**`app/(tabs)/blocks.tsx`** :
- Vérifier LifeBlockCard + EditBlockModal en light mode

**`app/(tabs)/settings.tsx`** :
- Déjà bien, vérifier juste le fond du SegmentedControl

### Session 6 — Vérification light mode + cleanup

- Tester tous les écrans en light mode
- Morning Ritual, Evening Wrap, Focus en light
- Désinstaller `uuid`, `@types/uuid`, `expo-linear-gradient`
- Supprimer les `Colors` legacy imports

---

## Store Zustand — référence rapide

| Store | Clé | Usage dans le redesign |
|---|---|---|
| `themeStore` | `flowday-theme` | Déjà utilisé via `useTheme()` |
| `lifeBlocksStore` | `flowday-lifeblocks` | Accueil (prochain bloc), Planning (blocs timeline) |
| `taskStore` | `flowday-tasks` | Accueil (tâches prioritaires), Planning (tâches du jour) |
| `templateStore` | `flowday-templates` | Accueil (prochain bloc), Planning (timeline) |
| `dayScoreStore` | `flowday-dayscores` | Accueil (score, streaks), Planning (score header) |
| `ritualStore` | `flowday-rituals` | Accueil (intention, bannière) |
| `focusStore` | `flowday-focus` | Planning (FAB focus) |

---

## Navigation (routes)

| Route | Écran | Fichier |
|---|---|---|
| `/` | Accueil | `app/(tabs)/index.tsx` |
| `/planning` | Planning | `app/(tabs)/planning.tsx` |
| `/week` | Semaine | `app/(tabs)/week.tsx` |
| `/blocks` | Blocs | `app/(tabs)/blocks.tsx` |
| `/settings` | Réglages | `app/(tabs)/settings.tsx` |
| `/morning-ritual` | Morning Ritual | `app/morning-ritual.tsx` |
| `/evening-wrap` | Evening Wrap | `app/evening-wrap.tsx` |
| `/focus` | Focus | `app/focus.tsx` |

---

# PARTIE 1 — MVP v1.0 (NE PAS MODIFIER)

> ⚠️ **ATTENTION AGENT IA** : Ce qui suit est la documentation du code existant.
> **NE RIEN MODIFIER** dans cette section. Lis-la uniquement pour comprendre la structure.
> Si tu travailles sur la Partie 2, tu n'as pas besoin de lire cette section.

## Détail des features implémentées

| Feature | État | Notes |
|---|---|---|
| **Life Blocks** | ✅ | 5 blocs seeded, CRUD, 12 couleurs, 20 emojis, archive, réordonner |
| **Weekly Template** | ✅ | 1 template, éditeur 7 jours, validation anti-chevauchement |
| **Daily Timeline** | ✅ | Scroll 06h-23h, ligne "MAINTENANT", blocs, créneaux libres, scroll auto |
| **Tasks** | ✅ | CRUD, priorité, liées aux blocs, affichées dans la timeline |
| **Day Score** | ✅ | Calcul complet : Blocs 40% + Tâches 30% + Pomodoros 20% + Rituals 10% |
| **Morning Ritual** | ✅ | 5 étapes, auto-redirect, humeur, overview, priorités, intention |
| **Evening Wrap** | ✅ | 4 étapes, tâches forcées (report/suppr), note, score final |
| **Focus Mode** | ✅ | Pomodoro 25/5, plein écran noir, points session, pause/abandon |
| **Thèmes** | ✅ | Dark + Light (switchable dans Réglages via Segmented Control natif) |

### v1.5+ (non implémenté — ne pas coder maintenant)

Time Defender, Streaks, Weekly Review, Momentum Score, Notifications, Widget, Intégrations, Paywall.

## Design System — Apple UIKit Dark + Light

### Palettes

**Dark :** `#000000` (bg), `#1C1C1E` (cards), `#2C2C2E` (hover), `#38383A` (separator), texte `#FFFFFF` / `#EBEBF599`.

**Light :** `#FFFFFF` (bg), `#F2F2F7` (cards), `#E5E5EA` (hover), `#C6C6C8` (separator), texte `#000000` / `#3C3C4399`.

### 12 couleurs Life Blocks

`#30D158` `#FF453A` `#FFD60A` `#BF5AF2` `#0A84FF` `#FF9F0A` `#FF375F` `#5E5CE6` `#40CBE0` `#AC8E68` `#8E8E93` `#FFFFFF`

### Tokens

- **Spacing** : xs(4) sm(8) md(12) lg(16) xl(20) xxl(24) xxxl(32) huge(44)
- **Radius** : sm(6) md(10) lg(13) xl(20) full(9999)
- **Typo** : LargeTitle(34), Title1(28), Title2(22), Title3(20), Headline(17/600), Body(17/400), Callout(16), Subheadline(15), Footnote(13), Caption1(12), Score(56), Timer(46)

### Règles absolues

- Fond `#000000`, cartes `#1C1C1E`, séparateurs 0.5px
- Tab bar active `#0A84FF`, checkbox = cercle (jamais carré)
- Touch targets 44×44, séparateurs indentés
- Radius 13 pour groupes, 10 pour blocs timeline
- Zéro bordure en tirets, zéro gradient, zéro shadow colorée

## Modèle de données

```typescript
interface LifeBlock { id, name, emoji, color, isArchived, weeklyGoalMinutes, order, createdAt, updatedAt }
interface TemplateBlock { id, lifeBlockId, dayOfWeek(0-6), startTime, endTime, title?, notes?, isFlexible }
interface Task { id, title, description?, completed, completedAt?, priority, lifeBlockId?, estimatedMinutes?, scheduledDate?, createdAt, dueDate? }
interface DayScore { date, total, blocksPercent, tasksPercent, pomodorosPercent, ritualsPercent, pomodorosCompleted, pomodorosGoal(6), morningRitualDone, eveningWrapDone }
interface RitualLog { date, type("morning"|"evening"), mood?, intention?, note?, completedAt }
```

## Calcul Day Score

```
Blocs 40% + Tâches 30% + Pomodoros 20% + Rituals 10%
```

## Points techniques importants

- **ID** : `generateId()` dans `src/utils/id.ts` (pas de `uuid`)
- **Persistance** : `zustand/persist` + `AsyncStorage` (pas MMKV)
- **Dates** : formatage manuel `formatDateFr` (pas `date-fns` dans les écrans critiques)
- **Init** : `useEffect` + `useRef` dans `app/_layout.tsx`
- **Anti-patterns** : jamais de `setState` pendant le rendu, jamais de lecture immédiate après `setState`

## Build

```bash
npx expo start
npx expo export --platform ios
```

**Bundle iOS** : ~3.1 MB (HBC), 1082 modules

---

_Document généré le 19 mai 2026. Dernière mise à jour : refonte visuelle — 5 tabs, nouveaux écrans, polish UI._
