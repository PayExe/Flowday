# GUIDE COMPLET — Flowday

> **Objectif** : Ce document contient absolument tout ce que tu dois savoir pour
> comprendre, apprendre et **finir toi-même** le redesign de Flowday.
>
> Lis-le une fois en entier, puis utilise-le comme référence pendant que tu codes.

---

# SOMMAIRE

1. [État des lieux](#1---état-des-lieux)
2. [La stack technologique — comprendre chaque outil](#2---la-stack-technologique)
3. [Ressources pour apprendre](#3---ressources-pour-apprendre)
4. [Le design system Flowday — maîtrise complète](#4---le-design-system-flowday)
5. [Architecture du projet](#5---architecture-du-projet)
6. [Les stores Zustand expliqués](#6---les-stores-zustand-expliqués)
7. [Le pattern theme-aware — ton seul et unique outil](#7---le-pattern-theme-aware)
8. [Task list complète — chaque ligne à modifier](#8---task-list-complète)
9. [Guide étape par étape](#9---guide-étape-par-étape)
10. [Check-list de validation finale](#10---check-list-de-validation-finale)

---

# 1 — ÉTAT DES LIEUX

## Ce qui est TERMINÉ (sessions 1-3)

| Session | Contenu | État |
|---------|---------|------|
| Session 1 | Composants UI theme-aware (Divider, Card, Button, EmptyState) | ✅ |
| Session 1 | `app.json` → `"userInterfaceStyle": "automatic"` | ✅ |
| Session 2 | Restructuration 5 tabs (Accueil, Planning, Semaine, Blocs, Réglages) | ✅ |
| Session 3 | Dashboard Accueil avec DayScore, prochain bloc, streaks, tâches | ✅ |
| Session 3 | `src/utils/streaks.ts` — calcul des streaks | ✅ |

## Ce qu'il reste à faire (sessions 4-6)

**3 bugs critiques** (crash de l'app) :
- `week.tsx:27` : `typography` utilisé mais pas extrait de `useTheme()`
- `blocks.tsx:35` : `typography` utilisé mais pas extrait de `useTheme()`
- `planning.tsx:255-256` : `styles.headerTitle` et `styles.dateLabel` non définis

**Session 4 — Planning** :
- `CurrentTimeLine.tsx` : 4× `colors.system.red` → `colors.nowLine`
- `HourMarker.tsx:17` : `fontSize: 12` → `typography.sizes.xs`
- `planning.tsx:541-542` : supprimer `+ 40` et `paddingBottom: 40`

**Session 5 — Polish écrans** :
- `week.tsx` : 2 fontSizes en dur
- `blocks.tsx` : 4 fontSizes en dur
- `settings.tsx` : 7 fontSizes en dur + 1 couleur en dur

**Session 6 — Cleanup & light mode** :
- `morning-ritual.tsx` : 24+ fontSizes en dur + `typography` pas extrait
- `evening-wrap.tsx` : 20+ fontSizes en dur + `typography` pas extrait
- `focus.tsx` : 8 fontSizes en dur + `typography` pas extrait
- `EditBlockModal.tsx` : 7 fontSizes + `typography` pas extrait
- `EditTemplateBlockModal.tsx` : 14 fontSizes + `typography` pas extrait
- `package.json` : supprimer `uuid`, `@types/uuid`, `expo-linear-gradient`

---

# 2 — LA STACK TECHNOLOGIQUE

Comprendre chaque brique avant de coder.

## React Native

**Rôle** : Le framework principal. Tu écris du JavaScript/TypeScript, il produit une
app iOS et Android native (pas une webview).

**Comment ça marche** : React Native traduit tes composants `<View>`, `<Text>`,
`<ScrollView>` en vues natives UIKit (iOS) ou Android Views. Le JS tourne dans
un thread séparé et communique avec le thread natif via un "bridge".

**Concepts clés** :
- `View` = `UIView` (iOS) / `android.view.View` (Android). C'est un conteneur.
- `Text` = affiche du texte. **Tout** texte doit être dans `<Text>`.
- `ScrollView` = conteneur scrollable.
- `Pressable` = détecte les taps (remplace `TouchableOpacity`).
- `TextInput` = champ de saisie.
- `StyleSheet.create()` = feuilles de style (pas de CSS, c'est du JS).

## Expo

**Rôle** : Une surcouche au-dessus de React Native qui simplifie le développement.
Pas besoin de Xcode ou Android Studio pour compiler. Tout passe par l'app Expo Go
sur ton téléphone.

**Commandes essentielles** :
```bash
npx expo start          # Lance le serveur de dev
npx expo start --ios    # Ouvre sur iOS
npx expo export --platform ios  # Vérifie que le bundle compile
```

## Expo Router

**Rôle** : La navigation de l'app. C'est du **file-based routing** : chaque fichier
dans `app/` devient une route automatiquement.

**Concepts clés** :
- `app/_layout.tsx` = layout racine, englobe toute l'app
- `app/(tabs)/_layout.tsx` = layout des onglets
- `app/(tabs)/index.tsx` = `/` (Accueil)
- `app/(tabs)/planning.tsx` = `/planning`
- `useRouter()` = hook pour naviguer (`router.push('/focus')`)
- `Link` ou `<Pressable onPress={() => router.push('/page')}>`

**Syntaxe de dossier** :
- `(tabs)` = group layout (le dossier ne compte pas dans l'URL)
- Nom de fichier = nom de route

## TypeScript

**Rôle** : JavaScript avec des types. Tu définis la forme des données.

**Syntaxe que tu vas voir partout** :
```typescript
interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';  // union type : 3 valeurs possibles
}

// Générique (type paramétré)
function first<T>(arr: T[]): T { return arr[0]; }

// Utility types
type Partial<T> = { [K in keyof T]?: T[K] };  // toutes les propriétés optionnelles
type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;  // enlève des propriétés
```

## Zustand

**Rôle** : State management. C'est l'équivalent allégé de Redux.

**Pattern de base** :
```typescript
import { create } from 'zustand';

const useStore = create<StateType>()((set, get) => ({
  // state
  count: 0,

  // actions
  increment: () => set((state) => ({ count: state.count + 1 })),

  // getter
  getDouble: () => get().count * 2,
}));

// Dans un composant :
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
```

**Avec persistance** (ce que Flowday utilise partout) :
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useStore = create<StateType>()(
  persist(
    (set, get) => ({ /* ... */ }),
    {
      name: 'flowday-ma-cle',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```
Le state est sauvegardé automatiquement dans AsyncStorage et rechargé au
lancement de l'app.

## AsyncStorage

**Rôle** : Stockage clé-valeur persistant sur le téléphone (comme localStorage
web mais async).

```typescript
await AsyncStorage.setItem('maCle', JSON.stringify(data));
const raw = await AsyncStorage.getItem('maCle');
const data = raw ? JSON.parse(raw) : null;
```

Dans Flowday, tu ne touches jamais directement à AsyncStorage — tout passe par
le middleware Zustand `persist`.

## react-native-reanimated

**Rôle** : Animations fluides à 60 FPS. Utilisé par `@gorhom/bottom-sheet` pour
les bottom sheets.

Dans Flowday, tu n'as pas à t'en servir directement. Il est juste une dépendance
de bottom-sheet.

## expo-symbols

**Rôle** : Icônes SF Symbols natives d'Apple (le système d'icônes d'iOS).

**Usage** :
```typescript
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
<Symbol name={SymbolNames.home} size={24} color={colors.text.primary} />
```

Le composant `Symbol` de Flowday est un wrapper autour de `expo-symbols` avec
un fallback `lucide-react-native` pour Android.

---

# 3 — RESSOURCES POUR APPRENDRE

## React Native (priorité absolue)

- **Doc officielle React Native** : https://reactnative.dev/docs/getting-started
  → Lis absolument les sections "Core Components", "Style", "ScrollView",
  "TextInput", "Handling Touches". Ne lis pas "Architecture" ni "Native Modules"
  pour l'instant.
- **React Native Express** (gratuit, visuel) : https://www.reactnative.express
  → Parfait pour les débutants. Explique chaque concept avec des schémas.
- **Chaîne YouTube "Expo"** : https://youtube.com/@ExpoDev
  → Tutoriels officiels Expo, très pédagogiques.
- **Chaîne YouTube "Simon Grimm"** : https://youtube.com/@simongrimm
  → Tutoriels React Native complets, projet par projet.

## React (fondamentaux)

- **Nouvelle doc React officielle** : https://react.dev
  → Lis "Describing the UI", "Adding Interactivity", "Managing State".
  Absolument essentiel.
- **Hooks à maîtriser** : `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`
  → La doc React les explique très bien.
- **useMemo et useCallback expliqués simplement** :
  https://react.dev/reference/react/useMemo — empêche de recalculer une valeur
  à chaque render. Dans Flowday, utilisé pour `todayScore = useMemo(...)`.

## TypeScript

- **TypeScript Handbook** (gratuit) : https://www.typescriptlang.org/docs/handbook/
  → Lis "Basic Types", "Interfaces", "Generics". Le reste peut attendre.
- **Total TypeScript (Matt Pocock)** : https://www.totaltypescript.com
  → Ressource payante mais excellente. Son Twitter/X est une mine d'or gratuite.

## Zustand

- **Doc Zustand officielle** : https://docs.pmnd.rs/zustand/getting-started/introduction
  → Très courte, tu peux tout lire en 30 minutes.
- **Focus sur** : `create()`, `set()`, `get()`, le middleware `persist`.

## Expo Router (navigation)

- **Doc Expo Router** : https://docs.expo.dev/router/introduction/
  → Lis "Getting started", "File-based routing", "Tabs", "Layout routes".
- **YouTube : "Expo Router tutorial"** → plusieurs créateurs ont des vidéos claires.

## Design iOS (Human Interface Guidelines)

- **Apple HIG** (gratuit) : https://developer.apple.com/design/human-interface-guidelines
  → Lis "Color", "Typography", "Layout". Tu comprendras pourquoi Flowday utilise
  ces couleurs précises et ces tailles de texte.

## GitHub Copilot / Cursor / IA

Si tu bloques sur une erreur TypeScript ou React Native :
- Copie l'erreur et demande à ChatGPT ou Claude
- Demande "explique-moi ce code ligne par ligne"

---

# 4 — LE DESIGN SYSTEM FLOWDAY

## La philosophie

Flowday suit les **Apple Human Interface Guidelines** à la lettre. Chaque couleur,
chaque taille de texte, chaque espacement est calibré pour ressembler à une app
Apple native (Réglages, Notes, Rappels...).

## La règle numéro 1 (à imprimer dans ta tête)

```
TOUT composant doit faire :
  const { colors, typography } = useTheme();

JAMAIS de fontSize en dur (chiffre).
JAMAIS de couleur en dur (sauf dans theme/colors.ts).
```

## Le hook useTheme()

```typescript
// Dans src/theme/index.ts
export function useTheme() {
  const themeName = useThemeStore((s) => s.themeName);
  const isDark = themeName === 'dark';

  const colors = useMemo(() => (isDark ? ColorsDark : ColorsLight), [isDark]);
  const typography = useMemo(() => getTypography(isDark), [isDark]);

  return { themeName, isDark, colors, typography };
}
```

Ce hook lit le thème actuel depuis le store Zustand et retourne la bonne palette.
Quand l'utilisateur change le thème dans Réglages, **tous les composants se
re-rendent automatiquement avec les nouvelles couleurs**.

## Les couleurs : comment les utiliser

```typescript
const { colors } = useTheme();

// === FONDS ===
colors.bg.primary       // Fond principal (#000 dark, #FFF light)
colors.bg.secondary     // Fond des cartes/groupes (#1C1C1E dark, #F2F2F7 light)
colors.bg.hover         // Fond au tap (pressé)
colors.bg.elevated      // Fond des modals/sheets

// === TEXTES ===
colors.text.primary     // Texte principal (blanc dark, noir light)
colors.text.secondary   // Texte secondaire (gris 60%)
colors.text.tertiary    // Texte tertiaire (gris 30%)
colors.text.quaternary  // Texte le plus discret (gris 18%)
colors.text.placeholder // Texte placeholder dans les inputs
colors.text.inverse     // Texte sur fond coloré (noir dark, blanc light)

// === SÉPARATEURS ===
colors.separator.default // Séparateur opaque (entre sections)
colors.separator.hairline // Séparateur fin (entre items d'un groupe)

// === SYSTÈME (couleurs sémantiques Apple) ===
colors.system.blue      // Accent principal, liens
colors.system.green     // Succès, terminé
colors.system.red       // Erreur, danger
colors.system.orange    // Avertissement
colors.system.yellow    // Priorité médium
colors.system.purple    // Focus track
colors.system.gray      // Inactif, secondaire

// === SPÉCIAL ===
colors.nowLine          // Couleur de la ligne "MAINTENANT" dans la timeline
```

## La typographie : comment l'utiliser

```typescript
const { typography } = useTheme();

// === STYLES PRÉDÉFINIS (taille + graisse + couleur incluses) ===
typography.largeTitle   // 34px bold — écran principal
typography.title1       // 28px bold
typography.title2       // 22px bold
typography.title3       // 20px semibold — titres de section
typography.headline     // 17px semibold — titres de carte
typography.body         // 17px regular — texte courant
typography.callout      // 16px regular
typography.subheadline  // 15px regular — sous-titres
typography.footnote     // 13px regular — métadonnées
typography.caption1     // 12px regular — légendes
typography.screenTitle  // 34px bold — titre des écrans
typography.sectionHeader // 13px regular UPPERCASE — en-têtes de section Apple
typography.score        // 56px bold — chiffre du score

// === TAILLES SEULES (sans graisse/couleur) ===
typography.sizes.xs     // 11
typography.sizes.sm     // 13
typography.sizes.base   // 15
typography.sizes.lg     // 17
typography.sizes.xl     // 20
typography.sizes.xxl    // 24
typography.sizes.xxxl   // 32
typography.sizes.score  // 56
typography.sizes.timer  // 46

// === GRAISSES SEULES ===
typography.weights.normal   // '400'
typography.weights.medium   // '500'
typography.weights.semibold // '600'
typography.weights.bold     // '700'
```

## Utilisation dans un `<Text>`

```typescript
// Style prédéfini (taille + graisse + couleur déjà inclus)
<Text style={typography.headline}>Titre de carte</Text>

// Style prédéfini + override de couleur
<Text style={[typography.headline, { color: colors.system.blue }]}>Lien bleu</Text>

// Taille et graisse séparées (si aucun style prédéfini ne matche)
<Text style={{ fontSize: typography.sizes.sm, fontWeight: typography.weights.medium }}>
  Texte custom
</Text>
```

## Les section headers (pattern Apple)

Le pattern universel pour les titres de section dans Flowday :

```typescript
<Text
  style={[
    typography.sectionHeader,
    { paddingHorizontal: 32, paddingBottom: 8 },
  ]}
>
  Tâches prioritaires
</Text>
```

**Règle** : `paddingHorizontal: 32` et `paddingBottom: 8` systématiquement.

## Les groupes Apple (cartes groupées)

Le pattern pour les listes groupées (comme dans Réglages iOS) :

```typescript
<View
  style={{
    backgroundColor: colors.bg.secondary,
    borderRadius: 13,           // Radius lg
    marginHorizontal: 16,
    overflow: 'hidden',         // Pour que le border radius coupe les enfants
  }}
>
  {/* Items avec séparateurs indentés */}
  {items.map((item, index) => (
    <View key={item.id}>
      <ItemComponent item={item} />
      {index < items.length - 1 && (
        <View style={{
          height: 0.5,
          backgroundColor: colors.separator.hairline,
          marginLeft: 57,       // Séparateur indenté
        }} />
      )}
    </View>
  ))}
</View>
```

## Les espacements (Spacing)

```
xs: 4   — très petit
sm: 8   — petit
md: 12  — moyen
lg: 16  — standard (padding horizontal des écrans)
xl: 20  — grand
xxl: 24 — très grand
xxxl: 32 — énorme
```

Règle : tous les paddings/margins doivent être des multiples de 4 si possible.
Le padding horizontal standard des écrans est 16 (lg).

---

# 5 — ARCHITECTURE DU PROJET

```
Flowday/
├── app/                          # Routes (Expo Router file-based)
│   ├── _layout.tsx              # Layout racine (redirection morning ritual)
│   ├── morning-ritual.tsx       # Morning Ritual (5 étapes)
│   ├── evening-wrap.tsx         # Evening Wrap (4 étapes)
│   ├── focus.tsx                # Focus Mode (pomodoro)
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar (5 onglets)
│       ├── index.tsx            # Accueil (Dashboard)
│       ├── planning.tsx         # Planning (Timeline + Tâches)
│       ├── week.tsx             # Semaine (éditeur template)
│       ├── blocks.tsx           # Blocs (CRUD Life Blocks)
│       └── settings.tsx         # Réglages (thème, config)
│
├── src/
│   ├── types/                   # Types TypeScript (lis-les pour comprendre les données)
│   │   ├── task.ts             # Task, Priority
│   │   ├── lifeBlock.ts        # LifeBlock, LifeBlockColor
│   │   ├── template.ts         # TemplateBlock, WeeklyTemplate
│   │   ├── dayScore.ts         # DayScore
│   │   ├── focus.ts            # FocusSession, FocusState
│   │   └── ritual.ts           # RitualLog, Mood, configurations
│   │
│   ├── features/               # Stores Zustand (logique métier)
│   │   ├── tasks/store.ts      # CRUD tâches
│   │   ├── lifeBlocks/store.ts # CRUD blocs de vie
│   │   ├── templates/store.ts  # Templates hebdomadaires
│   │   ├── dayScore/store.ts   # Scores quotidiens
│   │   ├── rituals/store.ts    # Rituals matin/soir
│   │   ├── focus/store.ts      # Sessions focus/pomodoro
│   │   └── theme/store.ts      # Thème dark/light
│   │
│   ├── components/             # Composants réutilisables
│   │   ├── ui/                 # Composants génériques (Button, Card, etc.)
│   │   ├── dayScore/           # Affichage du score
│   │   ├── tasks/              # Cartes de tâches
│   │   ├── timeline/           # Composants de la timeline
│   │   ├── lifeBlocks/         # Cartes + modal édition bloc
│   │   ├── templates/          # Cartes + modal édition template
│   │   └── shared/             # Composants partagés (EmptyState, etc.)
│   │
│   ├── theme/                  # Design system
│   │   ├── colors.ts           # Palettes dark/light + typo
│   │   └── index.ts            # useTheme() hook
│   │
│   └── utils/
│       ├── id.ts               # generateId() (pas uuid)
│       ├── haptics.ts          # Feedback haptique
│       └── streaks.ts          # Calcul des streaks
```

## Flux de données (comment les données circulent)

```
Stores (Zustand persist)
    ↓
  Composant utilise useXxxStore() pour lire les données
    ↓
  Le composant appelle une action (ex: toggleTask)
    ↓
  Le store met à jour son state
    ↓
  Zustand notifie tous les composants abonnés → re-render
    ↓
  Le middleware persist sauvegarde dans AsyncStorage
```

---

# 6 — LES STORES ZUSTAND EXPLIQUÉS

## Store Theme (`src/features/theme/store.ts`)

Clé AsyncStorage : `flowday-theme`

```typescript
// State
themeName: 'dark' | 'light'

// Actions
setTheme(name)    // Change le thème
toggleTheme()     // Bascule dark ↔ light
```

Utilisé par `useTheme()` — tu n'appelles jamais ce store directement.

## Store Life Blocks (`src/features/lifeBlocks/store.ts`)

Clé AsyncStorage : `flowday-lifeblocks`

```typescript
// State
blocks: LifeBlock[]

// Actions
addBlock(data)              // Crée un bloc
updateBlock(id, updates)    // Modifie un bloc
archiveBlock(id)            // Archive (soft delete)
unarchiveBlock(id)          // Désarchive
reorderBlock(id, direction) // Monte/descend

// Getters (lecture dérivée, pas d'abonnement)
getActiveBlocks()       // Blocs non archivés, triés par order
getBlockById(id)        // Trouve un bloc par ID
```

Un `LifeBlock` :
```typescript
{
  id: string,
  name: string,         // "Sport", "Work"...
  emoji: string,        // "🏃", "💻"...
  color: string,        // '#30D158' (une des 12 couleurs)
  isArchived: boolean,
  weeklyGoalMinutes: number,  // Objectif en minutes/semaine
  order: number,        // Position dans la liste
}
```

## Store Templates (`src/features/templates/store.ts`)

Clé AsyncStorage : `flowday-templates`

```typescript
// State
templates: WeeklyTemplate[]
activeTemplateId: string | null

// Actions
addTemplate(name)                       // Crée un template
setActiveTemplate(id)                   // Active un template
addBlockToTemplate(templateId, block)   // Ajoute un bloc à un jour
updateTemplateBlock(templateId, id, upd)// Modifie un bloc
removeTemplateBlock(templateId, id)     // Supprime un bloc

// Getters
getActiveTemplate()    // Le template actif
getBlocksForDay(0-6)   // Blocs pour un jour (0=lundi)
getTodayBlocks()       // Blocs pour aujourd'hui
```

Un `TemplateBlock` :
```typescript
{
  id: string,
  lifeBlockId: string,  // Référence à un LifeBlock
  dayOfWeek: 0-6,        // 0 = lundi
  startTime: "09:00",    // Heure de début
  endTime: "12:00",      // Heure de fin
  title?: string,        // Titre optionnel (ex: "Deep Work")
  isFlexible: boolean,   // Peut bouger
}
```

## Store Tasks (`src/features/tasks/store.ts`)

Clé AsyncStorage : `flowday-tasks`

```typescript
// State
tasks: Task[]

// Actions
addTask(data)        // Crée une tâche
toggleTask(id)       // Bascule completed ↔ incomplet
deleteTask(id)       // Supprime
updateTask(id, upd)  // Modifie

// Getters
getTodayTasks()              // Tâches du jour
getTodayTasksByLifeBlock(id)  // Tâches du jour pour un bloc
getIncompleteTodayTasks()     // Tâches non terminées du jour
```

## Store Day Score (`src/features/dayScore/store.ts`)

Clé AsyncStorage : `flowday-dayscores`

```typescript
// State
scores: DayScore[]
pomodoroGoal: number  // Objectif pomodoro par jour (défaut: 6)

// Actions
incrementPomodoro(date)      // +1 pomodoro
setMorningRitualDone(date)   // Rituel matin fait
setEveningWrapDone(date)     // Rituel soir fait
updateBlockValidation(...)   // Met à jour % blocs
updateTasksPercent(...)      // Met à jour % tâches
```

**Formule du score** : `Blocs×0.4 + Tâches×0.3 + Pomodoros×0.2 + RitualsPoints`

## Store Rituals (`src/features/rituals/store.ts`)

Clé AsyncStorage : `flowday-rituals`

```typescript
// State
logs: RitualLog[]
morningConfig: MorningRitualConfig
eveningConfig: EveningWrapConfig

// Actions
hasDoneMorningToday()  // true si morning fait aujourd'hui
hasDoneEveningToday()  // true si evening fait aujourd'hui
logMorningRitual({ mood?, intention? })
logEveningWrap({ note? })
```

## Store Focus (`src/features/focus/store.ts`)

Clé AsyncStorage : `flowday-focus`

```typescript
// State
sessions: FocusSession[]
focusState: FocusState  // État actuel du timer

// Actions
startFocus(taskId, title)  // Démarre une session
pauseFocus()               // Met en pause
resumeFocus()              // Reprend
stopFocus()                // Termine
abandonPomodoro()          // Abandonne le pomodoro actuel
tick()                     // Appelé chaque seconde par setInterval
```

---

# 7 — LE PATTERN THEME-AWARE

C'est le seul pattern que tu vas appliquer. Partout. Sans exception.

## Avant (mauvais — ce qu'il faut corriger)

```typescript
const styles = StyleSheet.create({
  text: {
    fontSize: 17,           // ❌ En dur
    color: '#FFFFFF',       // ❌ En dur, cassé en light mode
  },
  card: {
    backgroundColor: '#1C1C1E', // ❌ En dur
  }
});

// Dans le JSX
<Text style={styles.text}>...</Text>
```

## Après (bon — ce que tu dois écrire)

```typescript
function MonComposant() {
  const { colors, typography } = useTheme();

  return (
    <View style={{
      backgroundColor: colors.bg.secondary,
      borderRadius: 13,
      padding: 16,
    }}>
      <Text style={typography.headline}>
        Titre
      </Text>
      <Text style={typography.footnote}>
        Sous-titre
      </Text>
    </View>
  );
}
```

## Table de conversion : fontSize en dur → token

| Tu vois ça | Tu mets ça |
|-----------|------------|
| `fontSize: 10` | `typography.sizes.xs` |
| `fontSize: 11` | `typography.sizes.xs` |
| `fontSize: 12` | `typography.sizes.sm` (ou `typography.caption1`) |
| `fontSize: 13` | `typography.sizes.sm` (ou `typography.footnote`) |
| `fontSize: 14` | `typography.sizes.base` |
| `fontSize: 15` | `typography.sizes.base` (ou `typography.subheadline`) |
| `fontSize: 16` | `typography.sizes.lg` (ou `typography.callout`) |
| `fontSize: 17` | `typography.sizes.lg` (ou `typography.body` / `typography.headline`) |
| `fontSize: 20` | `typography.sizes.xl` (ou `typography.title3`) |
| `fontSize: 22` | `typography.title2` |
| `fontSize: 24` | `typography.sizes.xxl` |
| `fontSize: 28` | `typography.title1` |
| `fontSize: 32` | `typography.sizes.xxxl` |
| `fontSize: 46` | `typography.timer` |
| `fontSize: 56` | `typography.score` |
| `fontSize: 64` | `typography.sizes.score` |
| `fontSize: 72` | `typography.sizes.score` |

## Quand utiliser un style prédéfini vs une taille seule ?

**Style prédéfini** (contient taille + graisse + couleur) → pour les textes
courants : titres, sous-titres, paragraphes.

**Taille seule** (`typography.sizes.*`) + graisse seule (`typography.weights.*`) →
pour les cas spécifiques : timer, score, badge, ou quand la couleur du style
prédéfini n'est pas la bonne.

---

# 8 — TASK LIST COMPLÈTE

Chaque ligne à modifier, fichier par fichier.

---

## PHASE 1 : Bugs critiques (app crash)

### FICHIER : `app/(tabs)/week.tsx`

| Ligne | Action | Code |
|-------|--------|------|
| 27 | Extraire `typography` | `const { colors } = useTheme();` → `const { colors, typography } = useTheme();` |
| 238 | `fontSize: 13` | `typography.sizes.sm` |
| 252 | `fontSize: 20, fontWeight: '600'` | `typography.title3` (supprimer ces 2 lignes du StyleSheet) |

⚠️ Vérifie que les lignes 127 et 129 utilisent bien `typography.screenTitle` et `typography.subheadline`.

### FICHIER : `app/(tabs)/blocks.tsx`

| Ligne | Action | Code |
|-------|--------|------|
| 35 | Extraire `typography` | `const { colors } = useTheme();` → `const { colors, typography } = useTheme();` |
| 204 | `fontSize: 16` | `typography.sizes.lg` |
| 206 | `fontSize: 17` | `typography.sizes.lg` |
| 213 | `fontSize: 15` | `typography.sizes.base` |
| 260 | `fontSize: 13` (sectionHeader) | Supprimer et utiliser `typography.sectionHeader` |

⚠️ Vérifie que les lignes 127 et 128 utilisent bien `typography.screenTitle` et `typography.subheadline`.

### FICHIER : `app/(tabs)/planning.tsx`

| Ligne | Action | Code |
|-------|--------|------|
| 255-256 | Référence à `styles.headerTitle` et `styles.dateLabel` inexistants | Remplacer par `typography.screenTitle` et `typography.subheadline` |

**À remplacer (lignes 255-256) :**
```tsx
// AVANT
<Text style={[styles.headerTitle, { color: colors.text.primary }]}>Planning</Text>
<Text style={[styles.dateLabel, { color: colors.text.secondary }]}>{formatDateFr(new Date())}</Text>

// APRÈS
<Text style={[typography.screenTitle, { color: colors.text.primary }]}>Planning</Text>
<Text style={[typography.subheadline, { color: colors.text.secondary }]}>{formatDateFr(new Date())}</Text>
```

---

## PHASE 2 : Petites corrections (1-2 lignes par fichier)

### FICHIER : `src/components/timeline/CurrentTimeLine.tsx`

| Ligne(s) | Action | Avant | Après |
|----------|--------|-------|-------|
| 12, 13, 14, 15 | Remplacer `colors.system.red` | `colors.system.red` | `colors.nowLine` |

### FICHIER : `src/components/timeline/HourMarker.tsx`

| Ligne | Action | Avant | Après |
|-------|--------|-------|-------|
| 17 | fontSize en dur | `fontSize: 12` | `fontSize: typography.sizes.xs` |

### FICHIER : `app/(tabs)/planning.tsx` (suite)

| Ligne(s) | Action | Code |
|----------|--------|------|
| 541 | Supprimer `+ 40` | `height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT + 40` → `height: (END_HOUR - START_HOUR + 1) * HOUR_HEIGHT` |
| 542 | Supprimer `paddingBottom` | Supprimer `paddingBottom: 40,` |

---

## PHASE 3 : Écrans de taille moyenne

### FICHIER : `app/(tabs)/settings.tsx`

| Ligne | Action | Avant | Après |
|-------|--------|-------|-------|
| 127 | Couleur en dur | `'#FF9F0A'` | `colors.system.orange` |
| 58 (2×) | fontSize en dur | `fontSize: 17` | `fontSize: typography.sizes.lg` |
| 63 | fontSize en dur | `fontSize: 17` | `fontSize: typography.sizes.lg` |
| 85 | fontSize en dur | `fontSize: 13` | `fontSize: typography.sizes.sm` |
| 180 | fontSize en dur | `fontSize: 13` | `fontSize: typography.sizes.sm` |
| 181 | fontSize en dur | `fontSize: 12` | `fontSize: typography.sizes.xs` |
| 199 | Supprimer du StyleSheet | `sectionHeader: { fontSize: 13, textTransform: 'uppercase', ... }` | Utiliser `typography.sectionHeader` dans le JSX |

---

## PHASE 4a : `app/focus.tsx`

| Ligne | Action | Code |
|-------|--------|------|
| 23 | Extraire `typography` | `const { colors, typography } = useTheme();` |
| 140 | `fontSize: 17` | `fontSize: typography.sizes.lg` |
| 146 | `fontSize: 15` | `fontSize: typography.sizes.base` |
| 169 | `fontSize: 20` (taskTitle) | `typography.title3` |
| 177 | `fontSize: 56` (timer) | `typography.timer` |
| 183 | `fontSize: 13` (modeLabel) | `typography.sizes.sm` |
| 197 | `fontSize: 13` (dailyGoal) | `typography.sizes.sm` |
| 212 | `fontSize: 17` (noTask) | `typography.sizes.lg` |
| 218 | `fontSize: 17` (backBtnText) | `typography.sizes.lg` |

Note : les lignes 169, 177, 183, 197, 212, 218 sont dans le `StyleSheet.create()`.

---

## PHASE 4b : Modals

### FICHIER : `src/components/lifeBlocks/EditBlockModal.tsx`

Extraire `typography` de `useTheme()` (ligne où `const { colors } = useTheme()`).

| Ligne | Action | Avant | Après |
|-------|--------|-------|-------|
| 253 | `fontSize: 20` | Titre modal | `typography.sizes.xl` |
| 263 | `fontSize: 13` | Label | `typography.sizes.sm` |
| 273 | `fontSize: 17` | Input | `typography.sizes.lg` |
| 290 | `fontSize: 24` | Emoji | `typography.sizes.xxl` |
| 305 | `fontSize: 13` | GoalHint | `typography.sizes.sm` |
| 318 | `fontSize: 17` | SaveBtn | `typography.sizes.lg` |
| 329 | `fontSize: 17` | ArchiveBtn | `typography.sizes.lg` |

### FICHIER : `src/components/templates/EditTemplateBlockModal.tsx`

Extraire `typography` de `useTheme()`.

| Ligne | Action | Avant | Après |
|-------|--------|-------|-------|
| 181 | Legacy alias | `colors.border` | `colors.separator.default` |
| 217 | `fontSize: 17` | Picker item | `typography.sizes.lg` |
| 232 | `fontSize: 17` | Picker item | `typography.sizes.lg` |
| 271 | `fontSize: 17` | Toggle text | `typography.sizes.lg` |
| 339 | `fontSize: 20` | Title | `typography.sizes.xl` |
| 349 | `fontSize: 13` | Label | `typography.sizes.sm` |
| 356 | `fontSize: 17` | DayText | `typography.sizes.lg` |
| 374 | `fontSize: 16` | Emoji | `typography.sizes.lg` |
| 377 | `fontSize: 13` | Name | `typography.sizes.sm` |
| 389 | `fontSize: 12` | TimeLabel | `typography.sizes.xs` |
| 399 | `fontSize: 20` | Separator | `typography.sizes.xl` |
| 406 | `fontSize: 17` | Input | `typography.sizes.lg` |
| 410 | `fontSize: 13` | ErrorText | `typography.sizes.sm` |
| 427 | `fontSize: 17` | SaveBtn | `typography.sizes.lg` |
| 438 | `fontSize: 17` | DeleteBtn | `typography.sizes.lg` |

---

## PHASE 4c : Morning Ritual & Evening Wrap (gros fichiers)

### FICHIER : `app/morning-ritual.tsx`

Ligne ~38 : Extraire `typography` : `const { colors, typography } = useTheme();`

| Ligne | fontSize actuel | Remplacer par |
|-------|----------------|---------------|
| 109 | 15 | `typography.sizes.base` |
| 127 | 28 | `typography.sizes.xl` (en fait 28 → `typography.title1`) |
| 130 | 15 | `typography.sizes.base` |
| 168 | 20 | `typography.sizes.xl` |
| 170 | 17 | `typography.sizes.lg` |
| 173 | 13 | `typography.sizes.sm` |
| 214 | 17 | `typography.sizes.lg` |
| 220 | 13 | `typography.sizes.sm` |
| 240 | 20 | `typography.sizes.xl` |
| 256 | 15 | `typography.sizes.base` |
| 317 | 17 | `typography.sizes.lg` |
| 339 | 17 | `typography.sizes.lg` |
| 354 | 17 | `typography.sizes.lg` |
| 389* | 32 | `typography.sizes.xxxl` |
| 395* | 17 | `typography.sizes.lg` |
| 400* | 15 | `typography.sizes.base` |
| 403* | 15 | `typography.sizes.base` |

*StyleSheet

### FICHIER : `app/evening-wrap.tsx`

Ligne ~48 : Extraire `typography` : `const { colors, typography } = useTheme();`

| Ligne | fontSize actuel | Remplacer par |
|-------|----------------|---------------|
| 126 | 72 | `typography.sizes.score` |
| 129 | 17 | `typography.sizes.lg` |
| 143 | 13 | `typography.sizes.sm` |
| 149 | 13 | `typography.sizes.sm` |
| 171 | 17 | `typography.sizes.lg` |
| 186 | 17 | `typography.sizes.lg` |
| 200 | 13 | `typography.sizes.sm` |
| 212 | 13 | `typography.sizes.sm` |
| 224 | 13 | `typography.sizes.sm` |
| 246 | 17 | `typography.sizes.lg` |
| 263 | 15 | `typography.sizes.base` |
| 273 | 64 | `typography.sizes.score` |
| 276 | 17 | `typography.sizes.lg` |
| 291 | 11 | `typography.sizes.xs` |
| 294 | 15 | `typography.sizes.base` |
| 298 | 20 | `typography.sizes.xl` |
| 321 | 17 | `typography.sizes.lg` |
| 342 | 17 | `typography.sizes.lg` |
| 357 | 17 | `typography.sizes.lg` |
| 392* | 32 | `typography.sizes.xxxl` |
| 398* | 17 | `typography.sizes.lg` |

*StyleSheet

---

## PHASE 5 : Cleanup

### FICHIER : `package.json`

Supprimer ces 3 lignes :
```
"@types/uuid": "^10.0.0",
"expo-linear-gradient": "~15.0.8",
"uuid": "^14.0.0",
```

Puis lancer :
```bash
npm install
```

### FICHIER : `src/components/ui/Card.tsx`

Vérifier que les couleurs en dur dans le StyleSheet ont bien été supprimées.
Si le StyleSheet contient des `#1C1C1E` ou `#38383A` → les supprimer.

---

# 9 — GUIDE ÉTAPE PAR ÉTAPE

## Étape 1 : Corriger les bugs critiques (15 min)

```bash
# Ouvre ces 3 fichiers et applique les changements de la PHASE 1
```

1. Ouvre `app/(tabs)/week.tsx`
2. Ligne 27 : ajoute `typography` à la déstructuration
3. Ligne 238 : change `fontSize: 13` → `fontSize: typography.sizes.sm`
4. Ligne 252 : remplace `fontSize: 20, fontWeight: '600'` par `...typography.title3`
5. Sauvegarde.

6. Ouvre `app/(tabs)/blocks.tsx`
7. Ligne 35 : ajoute `typography` à la déstructuration
8. Lignes 204, 206, 213, 260 : remplace les fontSize en dur
9. Sauvegarde.

10. Ouvre `app/(tabs)/planning.tsx`
11. Lignes 255-256 : remplace `styles.headerTitle` et `styles.dateLabel` par les tokens
12. Sauvegarde.

**Teste** : `npx expo start` → vérifie que les onglets Semaine, Blocs, Planning
ne crashent plus.

## Étape 2 : CurrentTimeLine + HourMarker (5 min)

1. Ouvre `src/components/timeline/CurrentTimeLine.tsx`
2. Remplace les 5 occurrences de `colors.system.red` par `colors.nowLine`
3. Sauvegarde.

4. Ouvre `src/components/timeline/HourMarker.tsx`
5. Ligne 17 : remplace `fontSize: 12` par `fontSize: typography.sizes.xs`
6. Sauvegarde.

## Étape 3 : Planning +40 workaround (2 min)

1. Ouvre `app/(tabs)/planning.tsx`
2. Ligne 541 : supprime `+ 40`
3. Ligne 542 : supprime `paddingBottom: 40,`
4. Sauvegarde.

## Étape 4 : Settings (10 min)

1. Ouvre `app/(tabs)/settings.tsx`
2. Ligne 127 : `'#FF9F0A'` → `colors.system.orange`
3. Lignes 58, 63, 85, 180, 181 : remplace les fontSize par `typography.sizes.*`
4. Ligne 199 : supprime `sectionHeader` du StyleSheet, utilise `typography.sectionHeader` dans le JSX
5. Sauvegarde.

## Étape 5 : Focus (10 min)

1. Ouvre `app/focus.tsx`
2. Ajoute `typography` à la déstructuration
3. Remplace les 8 fontSize en dur (voir tableau PHASE 4a)
4. Sauvegarde.

## Étape 6 : Modals (15 min)

1. Ouvre `src/components/lifeBlocks/EditBlockModal.tsx`
2. Ajoute `typography`, remplace les 7 fontSize
3. Sauvegarde.

4. Ouvre `src/components/templates/EditTemplateBlockModal.tsx`
5. Ajoute `typography`, remplace les 15 fontSize + le `colors.border`
6. Sauvegarde.

## Étape 7 : Morning Ritual + Evening Wrap (30 min)

1. Ouvre `app/morning-ritual.tsx`
2. Ajoute `typography`
3. Parcours le fichier et remplace CHAQUE `fontSize: XX` (voir tableau PHASE 4c)
4. Sauvegarde.

5. Ouvre `app/evening-wrap.tsx`
6. Même chose.

## Étape 8 : Cleanup final (5 min)

1. Ouvre `package.json`
2. Supprime les 3 packages inutilisés
3. `npm install`
4. Vérifie que `npx expo export --platform ios` compile sans erreur.

---

# 10 — CHECK-LIST DE VALIDATION FINALE

Quand tu as fini toutes les étapes, vérifie :

- [ ] `npx expo start` lance l'app sans erreur
- [ ] Les 5 onglets s'affichent (Accueil, Planning, Semaine, Blocs, Réglages)
- [ ] La page Semaine ne crash pas
- [ ] La page Blocs ne crash pas
- [ ] La page Planning ne crash pas (header avec la date)
- [ ] La timeline affiche la ligne MAINTENANT en rouge (pas d'erreur)
- [ ] Le dashboard Accueil affiche le score, prochain bloc, streaks, tâches
- [ ] Les Réglages s'affichent correctement
- [ ] Le mode Focus fonctionne (timer, pause)
- [ ] Le Morning Ritual s'affiche
- [ ] L'Evening Wrap s'affiche
- [ ] Basculer en light mode (Réglages > Thème > Clair) :
  - [ ] Le fond devient blanc
  - [ ] Les cartes sont en gris clair (#F2F2F7)
  - [ ] Le texte est lisible (noir/gris)
  - [ ] Les couleurs système sont les bonnes (bleu = #007AFF, rouge = #FF3B30...)
  - [ ] La tab bar a un fond blanc
- [ ] `npx expo export --platform ios` compile sans erreur (bundle valide)
- [ ] `npm ls uuid` ne retourne rien (package désinstallé)

---

## Récapitulatif visuel de la correction type

Quand tu vois ce pattern dans le StyleSheet :

```typescript
const styles = StyleSheet.create({
  monTexte: {
    fontSize: 17,        // ← À SUPPRIMER
    color: '#FFFFFF',    // ← À SUPPRIMER
    fontWeight: '600',   // ← Si dans StyleSheet, à supprimer
  },
});
```

Tu le remplaces par ceci dans le JSX :

```typescript
function MonComposant() {
  const { colors, typography } = useTheme();

  return (
    <Text style={typography.headline}>  {/* Contient déjà fontSize + fontWeight + color */}
      Mon texte
    </Text>
  );
}
```

Si tu dois overrider la couleur parce qu'elle n'est pas standard :

```typescript
<Text style={[typography.headline, { color: colors.system.orange }]}>
  Texte orange
</Text>
```

---

**Bon courage. Tu vas y arriver. Un fichier à la fois, une ligne à la fois.**

Quand tu as corrigé un fichier, teste-le immédiatement (`npx expo start`) avant
de passer au suivant. Ne fais jamais 10 fichiers d'un coup sans tester.

---

# 11 — TUTORIELS : Construire chaque type d'écran

> Ces tutoriels t'apprennent à construire de zéro les 5 types d'écrans
> qu'utilise Flowday. Chaque tuto est indépendant. Commence par le premier.

---

## TUTO 1 — Écran Dashboard (Accueil)

> Modèle : `app/(tabs)/index.tsx`

Un dashboard, c'est un **ScrollView vertical** avec des **sections empilées**.
Chaque section = un titre (sectionHeader) + un contenu (groupe Apple ou carte).

### Structure squelette

```typescript
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

export default function MonDashboard() {
  const { colors, typography } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── HEADER ── */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={typography.screenTitle}>Mon App</Text>
          <Text style={[typography.subheadline, { marginTop: 2 }]}>
            mardi 26 mai
          </Text>
        </View>

        {/* ── SECTION 1 : Carte simple ── */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Prochain bloc
          </Text>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            marginHorizontal: 16,
            padding: 16,
          }}>
            <Text style={typography.headline}>🏃 Sport · 14h-15h</Text>
            <Text style={[typography.footnote, { marginTop: 2 }]}>Salle de sport</Text>
          </View>
        </View>

        {/* ── SECTION 2 : Groupe Apple (liste groupée) ── */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Tâches prioritaires
          </Text>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            {/* Item 1 */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={typography.body}>Faire une review de PR</Text>
            </View>
            {/* Séparateur indenté */}
            <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
            {/* Item 2 */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={typography.body}>Terminer l'auth Supabase</Text>
            </View>
          </View>
        </View>

        {/* ── SECTION 3 : Bannière cliquable ── */}
        <View style={{ marginBottom: 24, marginHorizontal: 16 }}>
          <Pressable style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: pressed ? colors.bg.hover : colors.bg.secondary,
            borderRadius: 13,
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderLeftWidth: 3,
            borderLeftColor: colors.system.orange,
          })}>
            <Text style={{ fontSize: 20, marginRight: 10 }}>🌅</Text>
            <View style={{ flex: 1 }}>
              <Text style={typography.headline}>Commencer la journée</Text>
              <Text style={[typography.footnote, { marginTop: 2 }]}>Morning Ritual · 5 étapes</Text>
            </View>
            <Text style={{ color: colors.text.tertiary }}>›</Text>
          </Pressable>
        </View>

        {/* Marge basse pour le scroll */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Ce qu'il faut retenir

| Pattern | Code signature |
|---|---|
| Header d'écran | `typography.screenTitle` + `typography.subheadline`, padding 16 |
| Titre de section | `typography.sectionHeader` + paddingHorizontal: 32 + paddingBottom: 8 |
| Groupe Apple | `borderRadius: 13`, `overflow: 'hidden'`, `colors.bg.secondary` |
| Séparateur entre items | `height: 0.5`, `colors.separator.hairline`, `marginLeft: 57` |
| Carte simple | Mêmes propriétés que groupe, mais `padding: 16` direct |
| Bannière action | `borderLeftWidth: 3` + couleur système, `Pressable` englobant |
| Fond de l'écran | `SafeAreaView` avec `colors.bg.primary` |
| Marge de fin de scroll | `<View style={{ height: 40 }} />` tout en bas |

### Exercice : crée ta propre page "Stats" avec

- Header : "Stats" + date
- Section 1 : une carte avec un gros chiffre (score) et un label
- Section 2 : un groupe Apple avec 3 items (streaks, sessions, tâches)
- Section 3 : une bannière verte avec un message

---

## TUTO 2 — Écran Réglages (Settings)

> Modèle : `app/(tabs)/settings.tsx`

Un écran de réglages iOS, c'est une **liste de groupes** (les fameuses cellules
d'inset groupé d'Apple). Chaque groupe a un fond grisé, des rangées cliquables,
et un séparateur indenté entre chaque rangée.

### Structure squelette

```typescript
import { View, Text, Pressable, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

export default function MonSettings() {
  const { colors, typography } = useTheme();
  const [notifications, setNotifications] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={typography.screenTitle}>Réglages</Text>
        </View>

        {/* ── GROUPE 1 ── */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Général
          </Text>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            {/* Rangée 1 */}
            <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={typography.body}>Thème</Text>
            </View>

            <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />

            {/* Rangée 2 */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
              <Text style={typography.body}>Notifications</Text>
              <Switch value={notifications} onValueChange={setNotifications} />
            </View>
          </View>
        </View>

        {/* ── GROUPE 2 ── */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Infos
          </Text>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}>
              <Text style={typography.body}>Version</Text>
              <Text style={[typography.body, { color: colors.text.secondary }]}>1.0.0</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
```

### Pattern iOS exact pour une cellule de réglages

```typescript
// Cellule cliquable avec chevron
<Pressable
  style={({ pressed }) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: pressed ? colors.bg.hover : 'transparent',
  })}
  onPress={() => {}}
>
  <Text style={typography.body}>Libellé</Text>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
    <Text style={[typography.body, { color: colors.text.secondary }]}>Valeur</Text>
    <Text style={{ color: colors.text.tertiary }}>›</Text>
  </View>
</Pressable>
```

### Ce qu'il faut retenir

| Élément | Code |
|---|---|
| Fond du groupe | `colors.bg.secondary` + `borderRadius: 13` |
| Cellule simple | `paddingVertical: 12`, `paddingHorizontal: 16` |
| Cellule avec switch/chevron | `flexDirection: 'row', justifyContent: 'space-between'` |
| Pressed state | `({ pressed }) => ({ backgroundColor: pressed ? colors.bg.hover : 'transparent' })` |
| Valeur secondaire | `colors.text.secondary` (à droite du libellé) |
| Footer de groupe | `<Text style={[typography.footnote, { paddingHorizontal: 32, marginTop: 8 }]}>` |

### Exercice : ajoute un 3e groupe "Compte" avec

- Une cellule "Email" avec valeur secondaire
- Une cellule "Déconnexion" en rouge (`colors.system.red`)
- Un texte de footer explicatif sous le groupe

---

## TUTO 3 — Écran de Liste (Blocs, Tâches)

> Modèles : `app/(tabs)/blocks.tsx`, `app/(tabs)/week.tsx`

Une liste d'entités (blocs, templates...) = un groupe Apple + des **cartes**.
Chaque carte est un composant réutilisable.

### Le composant "Carte" type

```typescript
// Fichier : MonItemCard.tsx
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

interface MonItemCardProps {
  emoji: string;
  name: string;
  subtitle: string;
  color: string;
}

export function MonItemCard({ emoji, name, subtitle, color }: MonItemCardProps) {
  const { colors, typography } = useTheme();

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      gap: 12,
    }}>
      {/* Pastille de couleur */}
      <View style={{
        width: 36,
        height: 36,
        borderRadius: 9,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>

      {/* Contenu texte */}
      <View style={{ flex: 1 }}>
        <Text style={typography.headline}>{name}</Text>
        <Text style={[typography.footnote, { marginTop: 2 }]}>{subtitle}</Text>
      </View>

      {/* Chevron */}
      <Text style={{ color: colors.text.tertiary, fontSize: 16 }}>›</Text>
    </View>
  );
}
```

### L'écran qui utilise la carte

```typescript
export default function MaListe() {
  const { colors, typography } = useTheme();
  const mesItems = [
    { id: '1', emoji: '🏃', name: 'Sport', subtitle: '3h/semaine', color: '#30D158' },
    { id: '2', emoji: '💻', name: 'Work', subtitle: '35h/semaine', color: '#0A84FF' },
    { id: '3', emoji: '📚', name: 'Lecture', subtitle: '2h/semaine', color: '#BF5AF2' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={typography.screenTitle}>Mes Blocs</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{
          backgroundColor: colors.bg.secondary,
          borderRadius: 13,
          marginHorizontal: 16,
          overflow: 'hidden',
        }}>
          {mesItems.map((item, index) => (
            <View key={item.id}>
              <MonItemCard {...item} />
              {index < mesItems.length - 1 && (
                <View style={{
                  height: 0.5,
                  backgroundColor: colors.separator.hairline,
                  marginLeft: 57,
                }} />
              )}
            </View>
          ))}
        </View>

        {/* Section "Archivés" séparée */}
        <View style={{ marginTop: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Archivés
          </Text>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            marginHorizontal: 16,
            overflow: 'hidden',
          }}>
            {/* Cartes archivées ici */}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Ce qu'il faut retenir

| Concept | Code |
|---|---|
| Extraire une carte en composant | `export function MaCarte({ ... }: Props) { ... }` |
| Pastille colorée | `width: 36, height: 36, borderRadius: 9, backgroundColor: color` |
| Séparateur indenté entre cartes | `marginLeft: 57` (57 = padding 16 + pastille 36 + gap 12 - ajustement) |
| Deux groupes séparés (actif/archivé) | Deux `<View>` avec `marginTop: 24` entre eux |
| Bouton "Ajouter" | En bas de l'écran ou en header, icône `+` |

### Exercice : crée une liste de "Projets"

- Un composant `ProjectCard` (emoji, nom, deadline, couleur)
- Une liste groupée de 4 projets
- Un bouton "Nouveau projet" en bas

---

## TUTO 4 — Écran Timeline / Planning

> Modèle : `app/(tabs)/planning.tsx`

Une timeline verticale, c'est un **ScrollView avec des éléments positionnés en
absolu** (position: absolute, top, height) calibrés sur une grille horaire.

### Version simplifiée (sans position absolute)

Pour apprendre, commence par une version simple : chaque bloc est un rectangle
de hauteur proportionnelle à sa durée, empilé dans une View normale.

```typescript
const HOUR_HEIGHT = 60; // 1 heure = 60 pixels
const START_HOUR = 6;

interface Bloc {
  startTime: string; // "09:00"
  endTime: string;   // "12:00"
  title: string;
  color: string;
}

function TimelineSimple({ blocs }: { blocs: Bloc[] }) {
  const { colors, typography } = useTheme();

  const sorted = [...blocs].sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <View>
      {sorted.map((bloc, i) => {
        const [sh, sm] = bloc.startTime.split(':').map(Number);
        const [eh, em] = bloc.endTime.split(':').map(Number);
        const dureeMinutes = (eh * 60 + em) - (sh * 60 + sm);
        const height = (dureeMinutes / 60) * HOUR_HEIGHT;

        return (
          <View key={i} style={{
            flexDirection: 'row',
            marginBottom: 4,
          }}>
            {/* Heure à gauche */}
            <View style={{ width: 52, alignItems: 'flex-end', paddingRight: 10, paddingTop: 8 }}>
              <Text style={{ fontSize: typography.sizes.xs, color: colors.text.quaternary }}>
                {bloc.startTime}
              </Text>
            </View>

            {/* Bloc coloré */}
            <View style={{
              flex: 1,
              height,
              backgroundColor: colors.bg.secondary,
              borderLeftWidth: 3,
              borderLeftColor: bloc.color,
              borderRadius: 10,
              padding: 10,
              marginRight: 16,
            }}>
              <Text style={typography.headline}>{bloc.title}</Text>
              <Text style={typography.footnote}>
                {bloc.startTime} – {bloc.endTime}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
```

### L'écran Planning complet

```typescript
export default function MonPlanning() {
  const { colors, typography } = useTheme();
  const [taches, setTaches] = useState([...]);
  const [nouvelleTache, setNouvelleTache] = useState('');

  const blocsDuJour = [
    { startTime: '09:00', endTime: '12:00', title: 'Deep Work', color: '#0A84FF' },
    { startTime: '12:00', endTime: '13:00', title: 'Déjeuner', color: '#FF9F0A' },
    { startTime: '14:00', endTime: '18:00', title: 'Work', color: '#0A84FF' },
    { startTime: '19:00', endTime: '20:00', title: 'Sport', color: '#30D158' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
          <Text style={typography.screenTitle}>Planning</Text>
          <Text style={typography.subheadline}>mardi 26 mai</Text>
        </View>

        {/* Section : Ajout rapide de tâche */}
        <View style={{ marginHorizontal: 16, marginBottom: 24 }}>
          <View style={{
            backgroundColor: colors.bg.secondary,
            borderRadius: 13,
            overflow: 'hidden',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4 }}>
              <Text style={{ fontSize: 22, color: colors.system.blue }}>+</Text>
              <TextInput
                style={{
                  flex: 1,
                  fontSize: typography.sizes.lg,
                  color: colors.text.primary,
                  paddingVertical: 10,
                  marginLeft: 4,
                }}
                placeholder="Nouvelle tâche..."
                placeholderTextColor={colors.text.placeholder}
                value={nouvelleTache}
                onChangeText={setNouvelleTache}
              />
            </View>
          </View>
        </View>

        {/* Section : Tâches du jour */}
        {taches.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
              Tâches
            </Text>
            <View style={{
              backgroundColor: colors.bg.secondary,
              borderRadius: 13,
              marginHorizontal: 16,
              overflow: 'hidden',
            }}>
              {taches.map((t, i) => (
                <View key={t.id}>
                  <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
                    <Text style={[
                      typography.body,
                      t.done && { color: colors.text.quaternary, textDecorationLine: 'line-through' }
                    ]}>
                      {t.title}
                    </Text>
                  </View>
                  {i < taches.length - 1 && (
                    <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Section : Timeline */}
        <View style={{ marginBottom: 24 }}>
          <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingBottom: 8 }]}>
            Planning
          </Text>
          <TimelineSimple blocs={blocsDuJour} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Ce qu'il faut retenir

| Concept | Explication |
|---|---|
| `HOUR_HEIGHT = 60` | 1 heure = 60px de hauteur dans la timeline |
| Hauteur d'un bloc | `(durée en minutes / 60) * HOUR_HEIGHT` |
| Input d'ajout rapide | Dans un groupe Apple, avec l'icône `+` à gauche |
| Tâches en groupe | Comme un groupe Apple classique, avec checkbox |
| `borderLeftWidth: 3` | La barre de couleur à gauche du bloc |
| `marginLeft: 57` | Le séparateur indenté (toujours le même) |

### Exercice : crée ta propre timeline

- 4 blocs du matin (06h-12h)
- Affiche les heures à gauche de chaque bloc
- Ajoute une section "Tâches du matin" au-dessus

---

## TUTO 5 — Écran à étapes (Ritual, Onboarding)

> Modèles : `app/morning-ritual.tsx`, `app/evening-wrap.tsx`

Un écran à étapes, c'est un **état local** (`useState`) qui dit à quelle étape
on est, et un **rendu conditionnel** : chaque étape affiche un contenu différent.

### Version simple (3 étapes)

```typescript
import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

export default function MonRitual() {
  const { colors, typography } = useTheme();
  const [etape, setEtape] = useState(0); // 0, 1, 2
  const [humeur, setHumeur] = useState<string | null>(null);
  const [intention, setIntention] = useState('');

  const TOTAL_ETAPES = 3;

  const suivant = () => {
    if (etape < TOTAL_ETAPES - 1) setEtape(etape + 1);
    else terminer();
  };

  const terminer = () => {
    // Sauvegarde dans le store
    console.log('Terminé !', { humeur, intention });
  };

  const progres = ((etape + 1) / TOTAL_ETAPES) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg.primary }}>
      {/* Barre de progression */}
      <View style={{ height: 3, backgroundColor: colors.bg.hover }}>
        <View style={{
          width: `${progres}%`,
          height: '100%',
          backgroundColor: colors.system.blue,
        }} />
      </View>

      {/* Contenu de l'étape */}
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={[typography.footnote, { marginBottom: 8 }]}>
          Étape {etape + 1} sur {TOTAL_ETAPES}
        </Text>

        {/* ── ÉTAPE 0 ── */}
        {etape === 0 && (
          <View>
            <Text style={typography.title2}>Comment te sens-tu ?</Text>
            <View style={{ flexDirection: 'row', gap: 16, marginTop: 20 }}>
              {['😔', '😐', '😊'].map((emoji) => (
                <Pressable
                  key={emoji}
                  onPress={() => setHumeur(emoji)}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    backgroundColor: humeur === emoji ? colors.system.blue : colors.bg.secondary,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{emoji}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* ── ÉTAPE 1 ── */}
        {etape === 1 && (
          <View>
            <Text style={typography.title2}>Ton intention du jour</Text>
            <TextInput
              style={{
                fontSize: typography.sizes.xl,
                color: colors.text.primary,
                marginTop: 20,
                padding: 0,
              }}
              placeholder="Aujourd'hui, je veux..."
              placeholderTextColor={colors.text.placeholder}
              value={intention}
              onChangeText={setIntention}
              multiline
            />
          </View>
        )}

        {/* ── ÉTAPE 2 ── */}
        {etape === 2 && (
          <View>
            <Text style={typography.title2}>Récapitulatif</Text>
            <Text style={[typography.body, { marginTop: 16 }]}>
              Ton humeur : {humeur}
            </Text>
            <Text style={[typography.body, { marginTop: 8 }]}>
              Ton intention : {intention || 'Aucune'}
            </Text>
          </View>
        )}
      </View>

      {/* Boutons en bas */}
      <View style={{
        flexDirection: 'row',
        justifyContent: etape > 0 ? 'space-between' : 'flex-end',
        paddingHorizontal: 16,
        paddingBottom: 32,
        paddingTop: 16,
      }}>
        {etape > 0 && (
          <Pressable onPress={() => setEtape(etape - 1)}>
            <Text style={[typography.body, { color: colors.text.secondary }]}>
              Retour
            </Text>
          </Pressable>
        )}
        <Pressable
          onPress={suivant}
          style={{
            backgroundColor: colors.system.blue,
            paddingHorizontal: 24,
            paddingVertical: 14,
            borderRadius: 10,
          }}
        >
          <Text style={[typography.headline, { color: colors.text.inverse }]}>
            {etape === TOTAL_ETAPES - 1 ? 'Terminer' : 'Continuer'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

### Ce qu'il faut retenir

| Concept | Code |
|---|---|
| État de l'étape | `const [etape, setEtape] = useState(0)` |
| Rendu conditionnel | `{etape === 0 && <View>...</View>}` |
| Barre de progression | `width: '${(etape+1)/total*100}%'` |
| Bouton suivant vs terminer | `etape === total - 1 ? 'Terminer' : 'Continuer'` |
| Données collectées | `useState` pour chaque champ (humeur, intention, note...) |
| Sauvegarde finale | Appeler `terminer()` → écrit dans le store Zustand |

### Exercice : crée un onboarding 4 étapes

- Étape 0 : "Bienvenue" avec un texte et un bouton
- Étape 1 : Sélection d'emoji (parmi 6 emojis)
- Étape 2 : Saisie du prénom (TextInput)
- Étape 3 : Récapitulatif + bouton "C'est parti"
- Barre de progression en haut

---

## TUTO 6 — Écran Focus / Plein écran

> Modèle : `app/focus.tsx`

Un écran focus, c'est un **écran minimaliste** avec un **compte à rebours**
(`setInterval`) et des **boutons** pour pause/reprendre/abandonner.

### Version ultra simple

```typescript
import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';

const DUREE = 25 * 60; // 25 minutes en secondes

export default function MonFocus() {
  const { colors, typography } = useTheme();
  const [secondes, setSecondes] = useState(DUREE);
  const [enPause, setEnPause] = useState(false);
  const [demarre, setDemarre] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tick chaque seconde
  useEffect(() => {
    if (demarre && !enPause && secondes > 0) {
      intervalRef.current = setInterval(() => {
        setSecondes((s) => s - 1);
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [demarre, enPause]);

  // Fin du timer
  useEffect(() => {
    if (secondes === 0 && demarre) {
      // Timer terminé !
    }
  }, [secondes]);

  const minutes = Math.floor(secondes / 60);
  const secs = secondes % 60;
  const temps = `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: colors.bg.primary,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Timer */}
      <Text style={{
        fontSize: typography.sizes.timer,
        color: colors.text.primary,
        fontWeight: '300',
        letterSpacing: -1,
      }}>
        {temps}
      </Text>

      {/* Label mode */}
      <Text style={[typography.subheadline, { marginTop: 8 }]}>
        {enPause ? 'Pause' : 'Focus'}
      </Text>

      {/* Boutons */}
      <View style={{ flexDirection: 'row', gap: 20, marginTop: 40 }}>
        {!demarre ? (
          <Pressable
            onPress={() => setDemarre(true)}
            style={{
              backgroundColor: colors.system.blue,
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 10,
            }}
          >
            <Text style={[typography.headline, { color: colors.text.inverse }]}>
              Démarrer
            </Text>
          </Pressable>
        ) : (
          <>
            <Pressable
              onPress={() => setEnPause(!enPause)}
              style={{
                backgroundColor: colors.bg.secondary,
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 10,
              }}
            >
              <Text style={typography.headline}>
                {enPause ? 'Reprendre' : 'Pause'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => { setDemarre(false); setSecondes(DUREE); }}
              style={{
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 10,
              }}
            >
              <Text style={[typography.headline, { color: colors.system.red }]}>
                Abandonner
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
```

### Ce qu'il faut retenir

| Concept | Explication |
|---|---|
| `useRef` pour l'intervalle | Évite de perdre la référence entre renders |
| `useEffect` + `setInterval` | Le tick du timer. Cleanup avec `clearInterval` |
| Écran plein écran | `flex: 1` + `alignItems: 'center'` + `justifyContent: 'center'` |
| Fond noir profond | `colors.bg.primary` = `#000000` (dark) |
| Timer en light | `fontWeight: '300'` + `letterSpacing: -1` = style Apple |
| Bouton abandonner | Rouge, discret, pas de fond |

### Exercice : améliore le focus

- Ajoute une barre de progression circulaire (avec `View` + `borderRadius`)
- Alterne automatiquement 25 min focus / 5 min pause
- Affiche le nombre de pomodoros complétés en bas

---

## RÉSUMÉ DES 6 PATTERNS

| N° | Type d'écran | Signatures clés | Fichier modèle |
|---|---|---|---|
| 1 | Dashboard | ScrollView + sections + groupes Apple + bannières | `app/(tabs)/index.tsx` |
| 2 | Réglages | Groupes avec cellules + switch/chevron + footer | `app/(tabs)/settings.tsx` |
| 3 | Liste | Groupes + cartes composant + séparateurs indentés | `blocks.tsx`, `week.tsx` |
| 4 | Timeline | Grille horaire + blocs positionnés + tâches embed | `app/(tabs)/planning.tsx` |
| 5 | Étapes | useState(etape) + rendu conditionnel + barre de progres | `morning-ritual.tsx` |
| 6 | Focus | setInterval + état pause/reprise + plein écran | `focus.tsx` |

---

## LES BASES ABSOLUES DE REACT NATIVE

> 5 minutes de lecture avant de coder. Si tu comprends ça, tu comprends tout Flowday.

### 1. Un composant = une fonction qui retourne du JSX

```typescript
export default function MonEcran() {
  return (
    <View>
      <Text>Hello</Text>
    </View>
  );
}
```

- `export default` = ce composant est la page (route Expo Router)
- `function Nom()` = le composant
- `return (<View>...</View>)` = ce qui s'affiche. Toujours UN seul élément racine.

### 2. Le state local : useState

```typescript
const [compteur, setCompteur] = useState(0);

// Lire : compteur
// Modifier : setCompteur(compteur + 1)
// React re-rend le composant automatiquement quand le state change
```

### 3. Les hooks fondamentaux

```typescript
useState(valeurInitiale)     // State local
useEffect(() => { ... }, []) // Code exécuté au montage du composant
useMemo(() => calcul, [dep]) // Valeur recalculée seulement si "dep" change
useRef(valeurInitiale)       // Valeur persistante sans re-render
```

### 4. Le style : TOUT en JS, 0 CSS

```typescript
// Style inline (dans le JSX)
<View style={{ backgroundColor: 'red', padding: 16 }}>

// Style via StyleSheet (généralement en bas du fichier)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});
// Usage : <View style={styles.container}>

// Combiner 2 styles
<Text style={[styles.titre, { color: 'red' }]}>
```

### 5. Layout Flexbox (obligatoire à connaître)

```typescript
flexDirection: 'row'      // Horizontal
flexDirection: 'column'   // Vertical (défaut)
justifyContent: 'center'  // Alignement axe principal
alignItems: 'center'      // Alignement axe secondaire
gap: 12                   // Espace entre enfants (React Native moderne)
flex: 1                   // Prend tout l'espace disponible
```

### 6. Le cycle de vie d'un composant

```
1. Le composant est créé → la fonction s'exécute
2. Le JSX est retourné → React Native l'affiche
3. useEffect(() => {...}, []) s'exécute (une seule fois)
4. L'utilisateur interagit → setState → retour à l'étape 1 (re-render)
5. Le composant est retiré → cleanup des useEffect
```

### 7. Props : passer des données à un composant enfant

```typescript
// Définition
function MaCarte({ titre, couleur }: { titre: string; couleur: string }) {
  return (
    <View style={{ backgroundColor: couleur }}>
      <Text>{titre}</Text>
    </View>
  );
}

// Usage
<MaCarte titre="Sport" couleur="#30D158" />
```

### 8. .map() : afficher une liste

```typescript
const items = ['Pomme', 'Banane', 'Orange'];

{items.map((item, index) => (
  <Text key={index}>{item}</Text>
))}

// key={...} est OBLIGATOIRE. Utilise un id unique si possible.
```

### 9. Conditionnel : afficher/cacher

```typescript
// SI condition ALORS affiche
{score > 80 && <Text>Excellent !</Text>}

// SI condition ALORS A SINON B
{estCharge ? <Text>Chargé</Text> : <Text>Vide</Text>}
```

### 10. Pressable : rendre cliquable

```typescript
<Pressable
  onPress={() => console.log('cliqué !')}
  style={({ pressed }) => ({
    backgroundColor: pressed ? '#333' : '#111',  // Changement au toucher
    padding: 16,
  })}
>
  <Text>Appuie ici</Text>
</Pressable>
```

Voilà. Avec ces 10 concepts + les 6 patterns d'écran ci-dessus, tu peux
comprendre 100% du code de Flowday et créer n'importe quel écran. Le reste,
c'est juste de la répétition et de la lecture de doc.
