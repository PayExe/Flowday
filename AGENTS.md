# Flowday — Documentation Technique

## Contexte

**Flowday** est un outil de design de vie pour développeurs et knowledge workers. L'utilisateur ne subit pas sa semaine, il la **conçoit**. Une fois sa semaine type définie, Flowday l'aide à la tenir jour après jour.

---

## Stack Technique

| Technologie             | Version           | Rôle                                            |
| ----------------------- | ----------------- | ----------------------------------------------- |
| React Native            | 0.81.5            | Framework UI natif                              |
| Expo SDK                | ~54.0.33          | Tooling, bundler, OTA                           |
| Expo Router             | ~6.0.23           | Navigation file-based                           |
| React                   | 19.1.0            | Core UI                                         |
| Zustand                 | ^5.0.13           | State management (avec persistance)             |
| AsyncStorage            | 2.2.0             | Persistance locale                              |
| react-native-reanimated | SDK 54            | Animations (timeline live)                      |
| @gorhom/bottom-sheet    | compatible SDK 54 | Bottom sheets                                   |
| lucide-react-native     | compatible SDK 54 | Icônes (complément Ionicons)                    |
| expo-haptics            | SDK 54            | Feedback tactile                                |
| expo-linear-gradient    | SDK 54            | Dégradés (jauges, scores)                       |
| date-fns                | compatible SDK 54 | Manipulation de dates (utilisé avec précaution) |

> **Important** : Tous les packages sont 100% compatibles **Expo Go** (pas de module natif custom). MMKV a été remplacé par AsyncStorage pour cette raison.

---

## Architecture du Projet

```
Flowday/
├── app/
│   ├── _layout.tsx                 # Root layout (redirect ritual matin)
│   ├── morning-ritual.tsx          # Morning Ritual (5 étapes)
│   ├── evening-wrap.tsx            # Evening Wrap (4 étapes)
│   ├── focus.tsx                   # Focus Mode (pomodoro plein écran)
│   └── (tabs)/
│       ├── _layout.tsx             # Tab bar (4 onglets)
│       ├── index.tsx               # Aujourd'hui (Daily Timeline)
│       ├── week.tsx                # Semaine (Weekly Template Editor)
│       ├── blocks.tsx              # Blocs (Life Blocks Management)
│       └── settings.tsx            # Réglages
│
├── src/
│   ├── types/                      # Types TypeScript
│   │   ├── lifeBlock.ts
│   │   ├── template.ts
│   │   ├── task.ts
│   │   ├── dayScore.ts
│   │   ├── ritual.ts
│   │   └── focus.ts
│   │
│   ├── features/                   # Stores Zustand (par domaine)
│   │   ├── theme/
│   │   │   └── store.ts
│   │   ├── lifeBlocks/
│   │   │   └── store.ts
│   │   ├── templates/
│   │   │   └── store.ts
│   │   ├── tasks/
│   │   │   └── store.ts
│   │   ├── dayScore/
│   │   │   └── store.ts
│   │   ├── rituals/
│   │   │   └── store.ts
│   │   └── focus/
│   │       └── store.ts
│   │
│   ├── components/
│   │   ├── dayScore/
│   │   │   └── DayScoreHeader.tsx
│   │   ├── lifeBlocks/
│   │   │   ├── LifeBlockCard.tsx
│   │   │   └── EditBlockModal.tsx
│   │   ├── tasks/
│   │   │   └── TaskCard.tsx
│   │   ├── templates/
│   │   │   ├── TemplateBlockCard.tsx
│   │   │   └── EditTemplateBlockModal.tsx
│   │   ├── timeline/
│   │   │   ├── CurrentTimeLine.tsx
│   │   │   ├── FreeSlot.tsx
│   │   │   ├── HourMarker.tsx
│   │   │   └── TimelineBlock.tsx
│   │   ├── shared/
│   │   │   ├── EmptyState.tsx
│   │   │   ├── PriorityBadge.tsx
│   │   │   ├── PrioritySelector.tsx
│   │   │   └── ProgressBar.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Divider.tsx
│   │       └── IconButton.tsx
│   │
│   ├── theme/
│   │   └── index.ts               # Design system complet
│   │
│   └── utils/
│       ├── id.ts                  # Générateur d'ID (sans crypto)
│       └── haptics.ts             # Feedback tactile
│
├── package.json
├── app.json                        # Config Expo
├── tsconfig.json
└── index.ts                        # Entry point
```

---

## Design System — v3 Apple Dark natif

> Refonte complète mai 2026. Style Things 3 + Apple Reminders + UIKit dark.

### 3 Thèmes

| Thème      | Fond                    | Usage                               |
| ---------- | ----------------------- | ----------------------------------- |
| **Dark**   | `#000000`               | Par défaut (systemBackground Apple) |
| **OLED**   | `#000000`               | Identique à dark (consolidé)        |
| **Tinted** | `#000000` + accent bleu | Couleur personnalisable             |

### Palette Apple UIKit (dark)

```
Fond principal    : #000000
Cartes / groupes  : #1C1C1E
Hover / pressed   : #2C2C2E
Séparateurs       : #38383A (opaque) / #54545899 (hairline)
Texte primary     : #FFFFFF
Texte secondary   : #EBEBF599 (60%)
Texte tertiary    : #EBEBF54D (30%)
Texte quaternary  : #EBEBF52E (18%)
Link / Accent     : #0A84FF
Success           : #30D158
Danger            : #FF453A
Warning           : #FF9F0A
```

### 12 Couleurs Apple (Life Blocks)

```
#30D158 (vert)  #FF453A (rouge)  #FFD60A (jaune)
#BF5AF2 (violet) #0A84FF (bleu)   #FF9F0A (orange)
#FF375F (rose)   #5E5CE6 (indigo) #40CBE0 (teal)
#AC8E68 (marron) #8E8E93 (gris)   #FFFFFF (blanc)
```

### Tokens

- **Spacing** : xs(4), sm(8), md(12), lg(16), xl(20), xxl(24), xxxl(32), huge(44)
- **Radius** : sm(6), md(10), lg(13 — cellules groupées Apple), xl(20 — sheets), full(9999)
- **Typography** : SF Pro natif iOS uniquement. LargeTitle(34), Title1(28), Title2(22), Title3(20), Headline(17/600), Body(17/400), Callout(16), Subheadline(15), Footnote(13), Caption1(12), Score(56), Timer(46)

### Règles absolues

- Fond principal `#000000`
- Cartes/groupes `#1C1C1E`
- Séparateurs 0.5px `#38383A` ou `#54545899`
- Tab bar active : `#0A84FF`
- Checkbox : cercle (jamais carré)
- Touch targets minimum 44×44px
- Séparateurs indentés (commencent après l'icône)
- BorderRadius 13 pour groupes Apple, 10 pour blocs timeline
- Transitions pressed : `backgroundColor` change uniquement
- Zéro bordure en tirets, zéro gradient sauf progress bars, zéro shadow colorée, zéro placeholder visuel pour listes vides

---

## Stores Zustand

| Store             | Clé                  | Rôle                                           |
| ----------------- | -------------------- | ---------------------------------------------- |
| `themeStore`      | `flowday-theme`      | Thème actif (dark/oled/tinted)                 |
| `lifeBlocksStore` | `flowday-lifeblocks` | CRUD blocs, archive, réordonner                |
| `templateStore`   | `flowday-templates`  | Templates + blocs 7j (CRUD, validation)        |
| `taskStore`       | `flowday-tasks`      | Tâches (CRUD, toggle, filtrage par date/bloc)  |
| `dayScoreStore`   | `flowday-dayscores`  | Scores journaliers (calcul auto 4 composantes) |
| `ritualStore`     | `flowday-rituals`    | Logs rituals (morning/evening), configs        |
| `focusStore`      | `flowday-focus`      | Sessions pomodoro, timer, compteur             |

> Tous les stores utilisent `persist` + `AsyncStorage`.

---

## Features Implémentées

### v1.0 MVP (complet)

| Feature             | État | Notes                                                                   |
| ------------------- | ---- | ----------------------------------------------------------------------- |
| **Life Blocks**     | ✅   | 5 blocs seeded, CRUD, 12 couleurs, 20 emojis, archive, réordonner       |
| **Weekly Template** | ✅   | 1 template, éditeur 7 jours, validation anti-chevauchement              |
| **Daily Timeline**  | ✅   | Scroll 06h-23h, ligne "MAINTENANT", blocs, créneaux libres, scroll auto |
| **Tasks**           | ✅   | CRUD, priorité, liées aux blocs, affichées dans la timeline             |
| **Day Score**       | ✅   | Calcul complet : Blocs 40% + Tâches 30% + Pomodoros 20% + Rituals 10%   |
| **Morning Ritual**  | ✅   | 5 étapes, auto-redirect, humeur, overview, priorités, intention         |
| **Evening Wrap**    | ✅   | 4 étapes, tâches forcées (report/suppr), note, score final              |
| **Focus Mode**      | ✅   | Pomodoro 25/5, plein écran noir, points session, pause/abandon          |
| **Thèmes**          | ✅   | Dark, OLED, Tinted (switchable dans Réglages)                           |

### v1.5+ (non implémenté)

- Time Defender (garde du temps)
- Streaks par Life Block
- Weekly Review (rapport semaine)
- Momentum Score
- Notifications intelligentes
- Widget iOS (natif, incompatible Expo Go)
- Intégrations (GitHub, Calendar, Linear)
- Paywall Pro / RevenueCat

---

## Modèle de Données

### LifeBlock

```typescript
interface LifeBlock {
  id: string;
  name: string;
  emoji: string;
  color: LifeBlockColor; // 12 couleurs Apple
  isArchived: boolean;
  weeklyGoalMinutes: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}
```

### TemplateBlock

```typescript
interface TemplateBlock {
  id: string;
  lifeBlockId: string;
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = lundi
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  title?: string;
  notes?: string;
  isFlexible: boolean;
}
```

### Task

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  priority: "high" | "medium" | "low";
  lifeBlockId?: string;
  estimatedMinutes?: number;
  scheduledDate?: string; // YYYY-MM-DD
  createdAt: string;
  dueDate?: string;
}
```

### DayScore

```typescript
interface DayScore {
  date: string; // YYYY-MM-DD
  total: number; // 0-100 (calculé auto)
  blocksPercent: number; // 0-100
  tasksPercent: number; // 0-100
  pomodorosPercent: number; // 0-100
  ritualsPercent: number; // 0-100
  pomodorosCompleted: number;
  pomodorosGoal: number; // défaut 6
  morningRitualDone: boolean;
  eveningWrapDone: boolean;
}
```

### RitualLog

```typescript
interface RitualLog {
  date: string; // YYYY-MM-DD
  type: "morning" | "evening";
  mood?: "bad" | "meh" | "good";
  intention?: string;
  note?: string;
  completedAt: string;
}
```

---

## Calcul du Day Score

```
Day Score = moyenne pondérée de 4 composantes :

1. Blocs respectés (40%)
   Blocs avec au moins 1 tâche complétée / total blocs actifs

2. Tâches complétées (30%)
   Tâches cochées aujourd'hui / tâches prévues aujourd'hui
   Plafonné à 100%

3. Pomodoros complétés (20%)
   Pomodoros finis / objectif (défaut 6)

4. Ritual score (10%)
   Morning Ritual fait = +5pts
   Evening Wrap fait = +5pts

Total = blocs×0.4 + tâches×0.3 + pomodoros×0.2 + rituals
```

---

## Points Techniques Importants

### Générateur d'ID

`uuid` a été remplacé par un générateur custom (`src/utils/id.ts`) car `crypto` n'existe pas dans React Native :

```typescript
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}
```

### Persistance

Tous les stores utilisent `zustand/middleware/persist` avec `AsyncStorage` (pas de MMKV car module natif incompatible Expo Go).

### Date Formatting

`date-fns` a été évité dans les écrans critiques à cause de bugs de locales dans Expo Go. Un formatage manuel est utilisé (`formatDateFr`).

### Initialisation (Seeded Data)

Les données par défaut sont créées via `useEffect` + `useRef` flag dans `_layout.tsx` pour éviter les appels pendant le rendu React.

### Anti-patterns corrigés

- ❌ Ne jamais appeler `setState` pendant le rendu (ex: `ensureTemplate()` dans `week.tsx`)
- ❌ Ne jamais lire un store **immédiatement après un setState** → données obsolètes
- ✅ Toujours utiliser `useEffect` pour observer les changements et recalculer

---

## Navigation

| Route             | Écran                        |
| ----------------- | ---------------------------- |
| `/`               | Aujourd'hui (Daily Timeline) |
| `/week`           | Semaine (Template Editor)    |
| `/blocks`         | Life Blocks                  |
| `/settings`       | Réglages                     |
| `/morning-ritual` | Morning Ritual               |
| `/evening-wrap`   | Evening Wrap                 |
| `/focus`          | Focus Mode                   |

---

## Build

```bash
npx expo start              # Dev
npx expo export --platform ios  # Vérification bundle
```

**Bundle iOS** : ~3.1 MB (HBC)
**Modules** : 1082

---

## Roadmap v1.5 (prochaines étapes)

1. Time Defender (calcul capacité journalière + suggestions)
2. Streaks par Life Block (jours consécutifs avec quota minimum)
3. Weekly Review (rapport dimanche soir, insights algorithmiques)
4. Momentum Score (tendance semaine)
5. Notifications intelligentes (ritual rappel, streak danger)
6. Bottom Sheet "ajouter tâche" (long press sur bloc timeline)
7. Durée estimée des tâches (input "~1h30" avec parsing)

---

_Document généré le 19 mai 2026. Dernière mise à jour : corrections bugs critiques (rendu, state, Day Score)._
