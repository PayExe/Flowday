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
