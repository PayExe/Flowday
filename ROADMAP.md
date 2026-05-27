# Flowday — Roadmap d'Améliorations pour Agent IA

> **Contexte** : Audit complet du projet (27 mai 2026) — 46 problèmes identifiés.
> Ce document est découpé en **5 parties indépendantes**, chacune sur une branche Git dédiée.
> Chaque partie contient des **issues** numérotées, triées par priorité.
>
> **Règle d'or** : Ne jamais modifier la Partie 1 de `AGENTS.md` (documentation legacy).
> Toujours utiliser `useTheme()` — jamais de couleur en dur.

---

## Structure de branches

```
main
├── fix/critical-bugs        → Partie 1 : Bugs bloquants + quick wins
├── ux/essential-ergonomics  → Partie 2 : Ergonomie essentielle
├── ui/visual-polish         → Partie 3 : Esthétique & polish visuel
├── feat/missing-features    → Partie 4 : Fonctionnalités manquantes
└── tech/debt-foundations    → Partie 5 : Dette technique & fondations
```

**Après chaque partie** : ouvrir une PR vers `main`, review, merge, puis créer la branche suivante depuis `main`.

---

# PARTIE 1 — Bugs critiques & Quick Wins

> **Branche** : `fix/critical-bugs`
> **Issue** : `fix-01` à `fix-10`
> **Temps estimé** : 3h

---

## Issue fix-01 — Splash blanc en dark mode

**Priorité** : 🔴 Critique
**Fichier** : `app.json`

Le splash screen a `"backgroundColor": "#ffffff"` en dur. En dark mode, l'utilisateur voit un flash blanc avant que l'app ne charge.

**Action** :
- Remplacer par `"backgroundColor": "#000000"` (le fond dark est le défaut, plus doux pour les yeux)
- Alternative : définir dynamiquement via `expo-splash-screen` si nécessaire

**Validation** : Lancer l'app en dark mode → pas de flash blanc au démarrage.

---

## Issue fix-02 — Evening Wrap jamais déclenché automatiquement

**Priorité** : 🔴 Critique
**Fichier** : `app/_layout.tsx`

`eveningConfig.time` existe dans le store `ritualStore` mais `_layout.tsx` ne l'utilise pas. Seul le Morning Ritual a un auto-redirect. L'utilisateur doit penser à ouvrir l'Evening Wrap manuellement.

**Action** :
1. Dans `_layout.tsx`, ajouter un `useEffect` qui vérifie si l'heure actuelle dépasse `eveningConfig.time` ET si l'evening wrap n'a pas été fait aujourd'hui ET si `eveningConfig.enabled === true`
2. Rediriger vers `/evening-wrap` si conditions remplies
3. Gérer le cas où l'utilisateur est déjà sur `/evening-wrap` (ne pas rediriger en boucle)
4. Ne rediriger qu'une fois (utiliser un `useRef` pour tracker)

**Validation** : Mettre l'heure de l'evening wrap à une heure passée → l'app doit rediriger automatiquement.

---

## Issue fix-03 — Pomodoro daily count ne reset jamais

**Priorité** : 🔴 Critique
**Fichier** : `src/features/focus/store.ts`

`dailyPomodoroCount` est dans `focusState` qui persiste via AsyncStorage. À minuit, le compteur ne se remet pas à zéro.

**Action** :
1. Ajouter une logique de reset dans `startFocus` : avant de démarrer, vérifier si la date sauvegardée correspond à aujourd'hui. Si non, reset `dailyPomodoroCount = 0`
2. Stocker une propriété `lastResetDate` dans le `focusState` pour tracker le dernier reset
3. Ou plus simple : réinitialiser `dailyPomodoroCount` au début de chaque session si la date a changé

**Validation** : Lancer un pomodoro, avancer la date système, relancer → le daily count doit être à 0.

---

## Issue fix-04 — TaskCard onDelete inopérant dans Planning et Home

**Priorité** : 🟠 Haute
**Fichiers** : `app/(tabs)/planning.tsx`, `app/(tabs)/index.tsx`

Les deux écrans passent `onDelete={() => {}}` aux `TaskCard`, rendant impossible la suppression de tâches via le context menu. L'utilisateur ne peut pas supprimer une tâche depuis ces écrans.

**Action** :
1. Dans `planning.tsx`, importer `deleteTask` depuis `useTaskStore`
2. Passer `onDelete={handleDeleteTask}` au `TaskCard`, où `handleDeleteTask` appelle `deleteTask(id)`
3. Même chose dans `index.tsx`
4. Ajouter une confirmation `Alert.alert` avant suppression

**Validation** : Long-press sur une tâche → "Supprimer" → la tâche disparaît.

---

## Issue fix-05 — Calcul du score : rituals mal pondérés

**Priorité** : 🟠 Haute
**Fichier** : `src/features/dayScore/store.ts`

```typescript
// Actuel (ligne 21-37)
const ritualsPercent = ritualsPoints * 10; // 10 points → 100%
const total = blocksPercent * 0.4 + tasksPercent * 0.3 + pomodorosPercent * 0.2 + ritualsPoints;
```

`ritualsPoints` est ajouté **brut** (0-10) au lieu de `ritualsPercent * 0.1`. Les rituels pèsent jusqu'à 10 points dans un score sur 100, au lieu de 10% du score.

**Action** :
- Remplacer `+ ritualsPoints` par `+ ritualsPercent * 0.1` dans `computeTotal`
- Vérifier que le score max théorique est bien 100

**Validation** : Faire les 2 rituels + quelques tâches → le score doit refléter 10% pour les rituels, pas +10 points bruts.

---

## Issue fix-06 — Streaks : logique fragile (gap de 1 jour)

**Priorité** : 🟠 Haute
**Fichier** : `src/utils/streaks.ts`

Si un jour est manqué mais que les 2 jours suivants sont valides, le streak tombe à 0 puis à 1. La logique ne tolère aucun écart.

**Correction visée** :
- Option A : Garder le comportement strict mais ajouter une tolérance de 1 jour (si `score.date === today || yesterday || dayBefore`)
- Option B : Ajouter un paramètre `maxGapDays = 0` à `calculateStreaks`
- Choisir l'option B pour rester flexible

**Action** :
1. Ajouter un paramètre `maxGapDays = 0` à la fonction
2. Si un jour est manqué mais qu'on est dans la tolérance, ne pas casser le streak
3. Recalculer après avoir sauté le jour manquant

**Validation** : Créer 3 scores valides consécutifs, en sauter un, en créer un 4e → le streak doit être à 4.

---

## Issue fix-07 — Divider : remplacer `height: 1` par `0.5`

**Priorité** : 🟡 Moyenne
**Fichier** : `src/components/ui/Divider.tsx`

Le `Divider` utilise `height: 1` au lieu de `0.5` comme tous les autres séparateurs de l'app. Incohérence visuelle.

**Action** :
- Remplacer `height: 1` par `height: 0.5` ligne 14

**Validation** : Vérifier que le divider a la même épaisseur que les `hairline` dans les groupes.

---

## Issue fix-08 — Settings : heure du ritual non éditable

**Priorité** : 🟡 Moyenne
**Fichier** : `app/(tabs)/settings.tsx`

`renderCell` affiche `morningConfig.time` et `eveningConfig.time` mais sans `onPress` → impossible de changer l'heure depuis l'UI.

**Action** **MINIMALE** (sans time picker complexe) :
1. Rendre l'heure éditable via un `Alert.prompt` ou un `TextInput` simple
2. À terme, utiliser `@react-native-community/datetimepicker` ou un picker wheel natif

Pour cette issue, faire le **minimum** : un `Alert.prompt` qui demande "Nouvelle heure (HH:MM)" et valide le format.

**Validation** : Appuyer sur l'heure dans Réglages → popup → entrer "09:00" → l'heure est mise à jour.

---

## Issue fix-09 — Focus mode back button trop petit

**Priorité** : 🟡 Moyenne
**Fichier** : `app/focus.tsx`

Le bouton close fait 36×36 (`width: 36, height: 36`), en dessous du minimum HIG de 44×44.

**Action** :
- Remplacer par `width: 44, height: 44, borderRadius: 12`
- Ajuster le `hitSlop` si nécessaire

**Validation** : Le bouton est plus large et facile à taper.

---

## Issue fix-10 — Incohérence typographique (fontSize en dur)

**Priorité** : 🟢 Basse
**Fichiers** : Plusieurs fichiers listés ci-dessous

Des `fontSize` en dur violent la règle "Zéro font size en dur" du `AGENTS.md`.

**Action** : Remplacer les `fontSize` en dur par `typography.sizes.*`. Fichiers à scanner :

```bash
rg "fontSize: \d+" --type tsx app/ src/
```

**Mapping à appliquer** :
- `fontSize: 11` → `typography.sizes.xs`
- `fontSize: 13` → `typography.sizes.sm`
- `fontSize: 15` → `typography.sizes.base`
- `fontSize: 17` → `typography.sizes.lg`
- `fontSize: 20` → `typography.sizes.xl`
- `fontSize: 28` → `typography.sizes.xxl` (ou garder `fontSize: 28` si c'est intentionnel)
- `fontSize: 32` → `typography.sizes.xxxl`
- `fontSize: 56` → `typography.sizes.score`
- `fontSize: 64` → (pas dans les tokens, à ajouter ou laisser)
- `fontSize: 72` → (pas dans les tokens, à ajouter ou laisser)

Ne pas remplacer les `fontSize` qui font partie d'un style `typography.xxx` (ils sont déjà tokenisés).

**Validation** : `rg "fontSize: \d+" --type tsx app/ src/` ne retourne que des usages légitimes (dans `colors.ts` ou dans des styles de typographie).

---

# PARTIE 2 — Ergonomie essentielle

> **Branche** : `ux/essential-ergonomics`
> **Issue** : `ux-01` à `ux-10`
> **Temps estimé** : 6h
> **Dépendance** : Partie 1 mergée dans main

---

## Issue ux-01 — Morning Ritual : bouton "Passer" / "Plus tard"

**Priorité** : 🔴 Critique
**Fichier** : `app/morning-ritual.tsx`

Actuellement, une fois redirigé vers le Morning Ritual, impossible de le quitter sans faire les 5 étapes. Si l'utilisateur ouvre l'app pour checker rapidement, c'est frustrant.

**Action** :
1. Ajouter un bouton "Plus tard" dans le header (à gauche de "Flowday")
2. Au clic → `router.replace('/')` pour revenir à l'accueil
3. Ne PAS logger le ritual (l'utilisateur n'a pas fait le rituel)
4. Option : ajouter un `Alert` "Es-tu sûr ? Tu peux le faire plus tard." avec "Continuer" et "Plus tard"

**Design** :
```
[← Plus tard]          Flowday          [●●●○○]
```

**Validation** : Ouvrir l'app → redirigé vers Morning Ritual → cliquer "Plus tard" → retour à l'accueil.

---

## Issue ux-02 — Timeline : bouton "Revenir à maintenant"

**Priorité** : 🔴 Critique
**Fichier** : `app/(tabs)/planning.tsx`

Une fois qu'on a scrollé dans la timeline, impossible de revenir à l'heure actuelle sans scroller manuellement.

**Action** :
1. Ajouter un state `isScrolledAway` qui détecte si l'utilisateur a scrollé loin du current time
2. Afficher un petit bouton flottant "Maintenant ↓" (style pilule Apple) quand `isScrolledAway === true`
3. Le bouton appelle `scrollRef.current?.scrollTo({ y: nowY - 120, animated: true })`
4. Cacher le bouton une fois revenue à la position

**Design** :
```
Pilule semi-transparente centrée horizontalement, sous le header
[ ↓ Maintenant ]
```

**Validation** : Scroller loin dans la timeline → le bouton apparaît → clic → scroll smooth vers maintenant.

---

## Issue ux-03 — Evening Wrap : option "Ignorer les tâches"

**Priorité** : 🟠 Haute
**Fichier** : `app/evening-wrap.tsx`

Si des tâches sont non faites, le bouton "Suivant" est désactivé. Impossible de passer sans décider pour chaque tâche. Devrait y avoir un "Passer quand même".

**Action** :
1. Ajouter un toggle ou bouton "Ignorer les tâches non faites" dans le footer de l'étape 2
2. Au clic, définir `allTasksHandled = true` localement (ne pas modifier les tâches)
3. Option : afficher un texte "Ces tâches resteront pour demain"

**Validation** : Tâches non faites → clic "Ignorer" → le bouton Suivant s'active.

---

## Issue ux-04 — Accueil : quick-add tâche

**Priorité** : 🟠 Haute
**Fichier** : `app/(tabs)/index.tsx`

Pour ajouter une tâche, il faut aller dans Planning. L'accueil devrait permettre un ajout rapide.

**Action** :
1. Ajouter un bouton "+" dans le header de l'accueil
2. Au clic → ouvrir un petit input inline (similaire à Planning) ou une `Alert.prompt`
3. La tâche est créée avec `priority: 'medium'`, `scheduledDate: todayISO()`, sans `lifeBlockId`
4. Fermer l'input après ajout

**Design** :
```
[Accueil]                              [+]
Jeudi 27 mai 2026
```

**Validation** : Appuyer sur + → taper "Acheter du pain" → entrée → la tâche apparaît dans les tâches prioritaires.

---

## Issue ux-05 — Haptics cohérents partout

**Priorité** : 🟠 Haute
**Fichiers** : `app/morning-ritual.tsx`, `app/evening-wrap.tsx`, `app/focus.tsx`, `app/(tabs)/planning.tsx`, `app/(tabs)/week.tsx`, `app/(tabs)/blocks.tsx`

Les retours haptiques sont utilisés de façon inconstante. Objectif : chaque action utilisateur a un feedback.

**Action** : Ajouter `hapticLight()` sur :
1. **Morning Ritual** : passage d'étape (bouton Suivant), sélection de mood
2. **Evening Wrap** : passage d'étape, décision sur tâche (demain/semaine/supprimer)
3. **Focus** : pause, resume, abandon
4. **Planning** : toggle tâche (déjà fait ✅), création de tâche
5. **Week** : ajout/suppression de bloc
6. **Blocks** : archivage, restauration, réordonnancement

Utiliser `hapticWarning()` sur :
- Suppression de tâche
- Abandon de pomodoro
- Archivage de bloc

**Validation** : Chaque action listée déclenche un retour haptique.

---

## Issue ux-06 — LifeBlock reorder : remplacer flèches par drag-and-drop

**Priorité** : 🟡 Moyenne
**Fichiers** : `app/(tabs)/blocks.tsx`, `src/components/lifeBlocks/LifeBlockCard.tsx`

Actuellement, il faut appuyer sur ▲ ou ▼ pour réordonner. Remplacer par du drag-and-drop natif.

**Action** :
1. Installer `react-native-draggable-flatlist` (vérifier compatibilité Expo SDK 54)
2. Remplacer le `FlatList` actuel par `DraggableFlatList`
3. Remplacer `renderActiveBlock` par le renderItem de DraggableFlatList
4. Utiliser `onDragEnd` pour appeler `reorderBlock(fromIndex, toIndex)` (adapter le store si nécessaire)
5. Supprimer les props `onMoveUp`, `onMoveDown`, `canMoveUp`, `canMoveDown` de `LifeBlockCard`

**Alternative si package incompatible** : Implémenter un drag manuel avec `PanResponder` ou `Gesture Handler`.

**Validation** : Appui long sur un bloc → glisser vers le haut/bas → l'ordre est sauvegardé.

---

## Issue ux-07 — Swipe-to-complete sur les TaskCard

**Priorité** : 🟡 Moyenne
**Fichier** : `src/components/tasks/TaskCard.tsx`

Ajouter un geste de swipe natif pour compléter/supprimer une tâche.

**Action** :
1. Wrapper le `TaskCard` dans un `Swipeable` (utiliser `react-native-gesture-handler` déjà installé)
2. Swipe droite → fond vert + icône check → toggle complet
3. Swipe gauche → fond rouge + icône trash → suppression (avec confirmation)
4. Garder le `ContextMenu` pour les actions avancées

**Alternative si trop complexe** : Ajouter seulement le swipe-to-complete (plus simple et plus impactant).

**Validation** : Swiper une tâche vers la droite → elle se complète. Swiper vers la gauche → elle se supprime.

---

## Issue ux-08 — FAB : éviter le chevauchement avec le contenu

**Priorité** : 🟡 Moyenne
**Fichier** : `app/(tabs)/planning.tsx`

Le FAB est toujours visible et peut masquer la dernière heure de la timeline. Ajouter un espacement ou le faire disparaître au scroll.

**Action** :
1. Option A (simple) : Ajouter un `paddingBottom` supplémentaire en bas de la timeline pour que le contenu ne soit jamais sous le FAB
2. Option B (mieux) : Cacher le FAB quand l'utilisateur scrolle vers le bas, le montrer quand il scrolle vers le haut (animation scale/fade)
3. Vérifier le `bottom: 88` sur différents devices (iPhone SE vs iPhone 15 Pro Max)

**Validation** : Scroller tout en bas de la timeline → le dernier bloc n'est pas masqué par le FAB.

---

## Issue ux-09 — Confirmation avant archivage de LifeBlock

**Priorité** : 🟢 Basse
**Fichiers** : `app/(tabs)/blocks.tsx`, `src/components/lifeBlocks/LifeBlockCard.tsx`

Archiver un LifeBlock via le context menu est immédiat et silencieux. Pas de confirmation ni d'undo.

**Action** :
1. Dans `LifeBlockCard`, avant d'appeler `onArchive()`, afficher une `Alert.alert` :
   - Titre : "Archiver {block.name} ?"
   - Message : "Ce bloc ne sera plus visible dans le planning. Tu pourras le restaurer depuis les archives."
   - Boutons : "Annuler" (cancel), "Archiver" (destructive)
2. Option : Ajouter une snackbar "Bloc archivé · Annuler" avec un timer de 3s (plus complexe, pour plus tard)

**Validation** : Long-press sur un bloc → Archiver → popup de confirmation → Annuler → le bloc est toujours là.

---

## Issue ux-10 — Emoji picker : ajouter le clavier emoji natif

**Priorité** : 🟢 Basse
**Fichier** : `src/components/lifeBlocks/EditBlockModal.tsx`

La grille de 20 emojis est limitée. Permettre d'utiliser le clavier emoji natif du téléphone.

**Action** :
1. Remplacer la grille d'emojis par un `TextInput` avec `keyboardType="default"` (le clavier emoji est accessible via le globe sur iOS)
2. L'input est centré, gros (fontSize 32), maxLength 2
3. Garder une rangée de suggestions (les 20 emojis actuels) en dessous pour sélection rapide
4. Mettre à jour l'emoji en temps réel

**Validation** : Appuyer sur l'emoji → clavier natif → sélectionner un emoji → mis à jour.

---

# PARTIE 3 — Esthétique & Polish visuel

> **Branche** : `ui/visual-polish`
> **Issue** : `ui-01` à `ui-10`
> **Temps estimé** : 8h
> **Dépendance** : Partie 2 mergée dans main

---

## Issue ui-01 — Tab bar : ajouter un fond flouté (blur)

**Priorité** : 🔴 Critique
**Fichier** : `app/(tabs)/_layout.tsx`

La tab bar a un fond opaque `colors.bg.primary`. iOS natif utilise un effet de flou (`UIBlurEffect`). Le package `expo-blur` est déjà installé.

**Action** :
1. Importer `BlurView` depuis `expo-blur`
2. Remplacer le `backgroundColor` du `tabBarStyle` par un `BlurView` en arrière-plan
3. Définir `tabBarStyle.backgroundColor: 'transparent'`
4. Ajouter le `BlurView` avec `intensity={isDark ? 80 : 60}` et `tint={isDark ? 'dark' : 'light'}`
5. Garder le `borderTopWidth: 0.5` pour la séparation

**Note** : Expo Router Tabs ne supporte pas nativement un fond blur. Il faudra peut-être wrapper le contenu du tab bar avec un BlurView en absolute.

**Validation** : La tab bar a un effet de flou translucide comme iOS natif, en dark et light mode.

---

## Issue ui-02 — Remplacer le streak emoji par SFSymbol

**Priorité** : 🟠 Haute
**Fichier** : `app/(tabs)/index.tsx`

L'emoji 🔥 (ligne 206) n'est pas cohérent avec le reste de l'app qui utilise SFSymbols.

**Action** :
- Remplacer `<Text style={{ fontSize: 28 }}>🔥</Text>` par `<Symbol name={SymbolNames.flame} size={28} color={colors.system.orange} />`

**Validation** : L'icône flame SFSymbol s'affiche dans la section Streaks.

---

## Issue ui-03 — Animation du score (compteur qui monte)

**Priorité** : 🟠 Haute
**Fichier** : `src/components/dayScore/DayScoreHeader.tsx`

Le score s'affiche directement à sa valeur. Ajouter une animation de compteur qui monte.

**Action** :
1. Utiliser `useEffect` + `requestAnimationFrame` pour animer de 0 à la valeur cible
2. Durée : 800ms, easing ease-out
3. Option : utiliser `react-native-reanimated` avec `withTiming` pour plus de fluidité
4. Appliquer sur le score de l'accueil ET sur l'evening wrap (étape 1 et 4)

**Pseudo-code** :
```typescript
const [displayScore, setDisplayScore] = useState(0);
useEffect(() => {
  const duration = 800;
  const startTime = Date.now();
  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    setDisplayScore(Math.round(score * progress));
    if (progress < 1) requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}, [score]);
```

**Validation** : Le score passe de 0 à 72 en montant progressivement.

---

## Issue ui-04 — Modals → BottomSheetModal natif

**Priorité** : 🟠 Haute
**Fichiers** : `src/components/lifeBlocks/EditBlockModal.tsx`, `src/components/templates/EditTemplateBlockModal.tsx`

Les modals d'édition utilisent `Modal` de React Native. `@gorhom/bottom-sheet` est déjà installé et un wrapper `BottomSheetModal.tsx` existe. Remplacer pour un rendu natif iOS.

**Action** :
1. Dans `EditBlockModal.tsx` : remplacer `<Modal visible={...}>` par le composant `BottomSheetModal`
2. Même chose dans `EditTemplateBlockModal.tsx`
3. Utiliser `snapPoints={['75%']}` ou `['80%']` selon le contenu
4. Ajouter le `BottomSheetModalProvider` si pas déjà présent (il est dans `_layout.tsx`)
5. Gérer le backdrop (flou automatique avec `@gorhom/bottom-sheet`)

**Validation** : L'édition d'un bloc ouvre un bottom sheet qui glisse depuis le bas, avec backdrop flouté.

---

## Issue ui-05 — Empty states avec illustration / animation

**Priorité** : 🟡 Moyenne
**Fichier** : `src/components/shared/EmptyState.tsx`

Les empty states sont texte + icône, statiques. Ajouter des micro-animations.

**Action** :
1. Ajouter un `useEffect` avec `Animated` pour faire apparaître l'empty state en fondu (opacity 0→1, translateY 10→0)
2. Ajouter une animation de "flottement" subtile sur l'icône (scale pulse)
3. Ajouter un `subtitle` optionnel si pas déjà présent
4. Option : ajouter un `action` (bouton CTA) pour guider l'utilisateur

**Validation** : Un empty state apparaît avec un fondu et l'icône pulse doucement.

---

## Issue ui-06 — Focus mode : cercle de progression circulaire

**Priorité** : 🟡 Moyenne
**Fichier** : `app/focus.tsx`

Le focus mode est trop minimaliste. Ajouter un cercle de progression autour du timer.

**Action** :
1. Créer un composant `CircularProgress` utilisant `react-native-reanimated` ou `react-native-svg`
2. Afficher le temps restant au centre
3. Le cercle se remplit en sens anti-horaire (ou horaire) selon le temps restant
4. Couleur : `colors.system.blue` en focus, `colors.system.green` en pause
5. Taille : ~200px de diamètre

**Alternative SVG légère** :
```tsx
import Svg, { Circle } from 'react-native-svg';
// stroke-dasharray + stroke-dashoffset animés
```

**Validation** : Un cercle entoure le timer et se vide proportionnellement au temps restant.

---

## Issue ui-07 — Step indicator animé (Morning/Evening Rituals)

**Priorité** : 🟡 Moyenne
**Fichiers** : `app/morning-ritual.tsx`, `app/evening-wrap.tsx`

Les points d'étape sont statiques. Animer la transition quand on passe d'une étape à l'autre.

**Action** :
1. Utiliser `Animated.Value` pour animer la largeur du point actif (passe de 8 à 24)
2. Ajouter une animation de scale sur le point qui devient actif
3. Désactiver l'animation si `reduceMotion` est activé (accessibilité)

**Validation** : En passant de l'étape 1 à 2, le point 1 rétrécit et le point 2 s'élargit avec une animation fluide.

---

## Issue ui-08 — Animation de transition entre écrans

**Priorité** : 🟡 Moyenne
**Fichier** : `app/_layout.tsx`

La navigation entre écrans est instantanée (pas d'animation). Ajouter des animations de transition.

**Action** :
1. Dans le `Stack` de `_layout.tsx`, ajouter `screenOptions={{ animation: 'slide_from_right' }}`
2. Pour les modals (Morning Ritual, Evening Wrap, Focus), utiliser `presentation: 'modal'` ou `animation: 'slide_from_bottom'`
3. Vérifier que ça ne casse pas l'auto-redirect

**Validation** : Naviguer entre les tabs → animation de fondu. Ouvrir Morning Ritual → slide from bottom.

---

## Issue ui-09 — Barres de progression avec animation

**Priorité** : 🟢 Basse
**Fichiers** : `app/evening-wrap.tsx`, `src/components/shared/ProgressBar.tsx`

Les barres de score dans l'evening wrap passent directement à leur valeur. Animer la largeur.

**Action** :
1. Dans `ProgressBar`, ajouter un `useEffect` avec `Animated.timing` pour animer `width` de 0% à la valeur cible
2. Durée : 600ms, délai échelonné (stagger) pour chaque barre
3. Appliquer aussi à la barre de streak dans `index.tsx`

**Validation** : Les barres de l'evening wrap step 1 se remplissent de gauche à droite avec un stagger.

---

## Issue ui-10 — Micro-interaction bounce sur toggle tâche

**Priorité** : 🟢 Basse
**Fichier** : `src/components/tasks/TaskCard.tsx`

Quand on coche une tâche, pas d'animation visuelle (juste haptic). Ajouter un petit bounce.

**Action** :
1. Utiliser `Animated.spring` sur la checkbox au moment du toggle
2. Scale de 1 → 1.2 → 1 (bounce subtil)
3. Désactiver si `reduceMotion`

**Validation** : Cocher une tâche → la checkbox fait un petit rebond satisfaisant.

---

# PARTIE 4 — Fonctionnalités manquantes

> **Branche** : `feat/missing-features`
> **Issue** : `feat-01` à `feat-08`
> **Temps estimé** : 12h
> **Dépendance** : Partie 3 mergée dans main

---

## Issue feat-01 — Export / Import des données (JSON)

**Priorité** : 🔴 Critique
**Fichiers** : Nouveau fichier `src/utils/backup.ts`, `app/(tabs)/settings.tsx`

Aucun moyen de sauvegarder ou transférer les données. L'utilisateur perd tout s'il change de téléphone.

**Action** :
1. Créer `src/utils/backup.ts` avec :
   - `exportAllData()` → lit tous les stores, retourne un JSON structuré
   - `importAllData(json)` → valide le JSON, écrase les stores
2. Ajouter une section "Données" dans `settings.tsx` avec :
   - "Exporter les données" → `Share.share({ message: JSON.stringify(data) })` ou écriture fichier
   - "Importer des données" → `DocumentPicker` ou paste depuis clipboard
   - "Réinitialiser toutes les données" → `Alert` de confirmation + clear AsyncStorage
3. Ajouter un footer avec la date de dernier export

**Structure du JSON d'export** :
```json
{
  "version": 1,
  "exportedAt": "2026-05-27T...",
  "data": {
    "lifeBlocks": [...],
    "templates": [...],
    "tasks": [...],
    "dayScores": [...],
    "ritualLogs": [...],
    "focusSessions": [...]
  }
}
```

**Validation** : Exporter → réinitialiser → importer → toutes les données sont restaurées.

---

## Issue feat-02 — Vue Historique / Analytics

**Priorité** : 🟠 Haute
**Fichiers** : Nouveau fichier `app/(tabs)/history.tsx` OU intégré dans l'accueil

Les scores sont stockés mais invisibles. Ajouter une vue pour voir ses tendances.

**Action** :
1. Créer une section "Historique" dans l'accueil (scroll horizontal de 7 derniers jours)
2. Chaque jour affiche un cercle coloré : score 0-29 rouge, 30-59 orange, 60-79 jaune, 80-100 vert
3. Au clic sur un jour → modal avec détail du score (comme evening wrap step 1)
4. Ajouter une ligne de tendance simple (moyenne mobile 7 jours)
5. Option future : heatmap style GitHub (voir feat-08)

**Design** :
```
[L M M J V S D]
 ● ● ● ● ● ○ ○   ← cercles colorés
Score moyen : 72  ↑12% vs semaine dernière
```

**Validation** : Les 7 derniers jours apparaissent avec leur score. Clic sur un jour → détail.

---

## Issue feat-03 — Notifications (rappels de blocs + pomodoro)

**Priorité** : 🟠 Haute
**Fichiers** : Nouveau fichier `src/utils/notifications.ts`, `app/_layout.tsx`

Aucun rappel pour les événements de la journée.

**Action** :
1. Installer/configurer `expo-notifications`
2. Créer `src/utils/notifications.ts` avec :
   - `scheduleBlockReminder(blockName, startTime)` → notif 5 min avant le début du bloc
   - `schedulePomodoroEnd()` → notif quand le pomodoro est fini
   - `scheduleEveningWrapReminder(time)` → notif à l'heure configurée
3. Dans `planning.tsx`, programmer les rappels de blocs au chargement
4. Dans `settings.tsx`, ajouter un toggle "Notifications" par type (blocs, focus, rituals)
5. Demander la permission au premier lancement

**Validation** : Un bloc commence à 10:00 → notification à 9:55 "Sport dans 5 minutes".

---

## Issue feat-04 — Tâches récurrentes

**Priorité** : 🟡 Moyenne
**Fichiers** : `src/types/task.ts`, `src/features/tasks/store.ts`, `app/(tabs)/planning.tsx`

Impossible de créer une tâche qui se répète chaque jour / chaque semaine.

**Action** :
1. Ajouter au type `Task` :
   ```typescript
   repeat?: 'daily' | 'weekly' | 'weekdays' | null;
   ```
2. Dans `addTask`, si `repeat` est défini, ne rien faire (la tâche est créée normalement)
3. Créer une fonction `generateRecurringTasks()` dans le store qui :
   - Cherche les tâches avec `repeat`
   - Vérifie si une instance existe déjà pour aujourd'hui
   - Si non, crée une copie avec `scheduledDate: todayISO()`
4. Appeler cette fonction dans `_layout.tsx` au démarrage et dans `planning.tsx` au mount
5. Dans l'UI d'ajout de tâche, ajouter un sélecteur "Répéter" (une fois, chaque jour, chaque semaine, jours ouvrés)

**Validation** : Créer une tâche "Méditer" avec repeat daily. Le lendemain, elle apparaît automatiquement.

---

## Issue feat-05 — Pomodoro : break long après 4 sessions

**Priorité** : 🟡 Moyenne
**Fichier** : `src/features/focus/store.ts`, `app/focus.tsx`

Le cycle pomodoro n'a que des breaks courts (5 min). La méthode classique alterne 4× (25+5) puis un break long de 15-30 min.

**Action** :
1. Ajouter une constante `LONG_BREAK_MINUTES = 15`
2. Dans la fonction `tick()`, quand un pomodoro se termine :
   - Vérifier `sessionPomodoroCount % 4 === 0 && sessionPomodoroCount > 0`
   - Si oui → `timeRemaining = LONG_BREAK_MINUTES * 60`
   - Sinon → `timeRemaining = BREAK_MINUTES * 60`
3. Afficher "Pause longue · 15 min" dans le focus mode quand c'est le cas
4. Ajouter un paramètre `longBreakMinutes` dans le store (configurable dans Settings)

**Validation** : Faire 4 pomodoros → le 4e break est de 15 minutes au lieu de 5.

---

## Issue feat-06 — Templates multiples (semaines alternatives)

**Priorité** : 🟡 Moyenne
**Fichiers** : `src/features/templates/store.ts`, `app/(tabs)/week.tsx`

Un seul template actif. Impossible d'avoir "Semaine normale" et "Semaine vacances" et de switcher.

**Action** :
1. Dans le store `templateStore`, ajouter :
   - `setActiveTemplate(templateId: string)`
   - `deleteTemplate(templateId: string)`
   - `duplicateTemplate(templateId: string)`
2. Dans `week.tsx` :
   - Afficher le nom du template actif dans le header
   - Ajouter un sélecteur de template (picker ou sheet avec la liste)
   - Bouton "+" pour créer un nouveau template
   - Swipe ou long-press pour dupliquer/supprimer
3. Garder la rétrocompatibilité (le template actuel devient le défaut)

**Validation** : Créer "Semaine vacances", y ajouter des blocs, switcher entre les deux → les plannings changent.

---

## Issue feat-07 — Undo / Snackbar après actions destructives

**Priorité** : 🟢 Basse
**Fichiers** : Nouveau composant `src/components/shared/Snackbar.tsx`, plusieurs écrans

Pas de "undo" après suppression de tâche ou archivage de bloc.

**Action** :
1. Créer un composant `Snackbar` :
   - Position absolute en bas (au-dessus de la tab bar)
   - Fond `colors.bg.elevated`, radius 13
   - Message + bouton "Annuler"
   - Auto-dismiss après 4 secondes
2. L'utiliser dans :
   - Suppression de tâche : "Tâche supprimée · Annuler"
   - Archivage de bloc : "Bloc archivé · Annuler"
   - Suppression de template block : "Bloc retiré · Annuler"
3. L'annulation restaure l'élément dans le store

**Validation** : Supprimer une tâche → snackbar apparaît → clic "Annuler" → la tâche revient.

---

## Issue feat-08 — Calendrier heatmap (vue mensuelle)

**Priorité** : 🟢 Basse
**Fichiers** : Nouveau composant `src/components/dayScore/ScoreHeatmap.tsx`, `app/(tabs)/index.tsx`

Ajouter une heatmap style GitHub pour visualiser les scores sur le mois.

**Action** :
1. Créer `ScoreHeatmap.tsx` :
   - Affiche les ~30 derniers jours en grille 7 colonnes (1 par jour de semaine)
   - Chaque cellule = 1 jour, couleur basée sur le score
   - Palette : `transparent` (pas de données) → `#30D15822` (bas) → `#30D158` (100)
2. L'ajouter dans l'accueil, sous les streaks
3. Option : permettre de swiper pour voir les mois précédents

**Palette proposée** :
```
0      → transparent
1-29   → colors.bg.hover
30-59  → colors.system.orange + 30% opacity
60-79  → colors.system.yellow + 50% opacity
80-100 → colors.system.green
```

**Validation** : La heatmap montre les 30 derniers jours avec des carrés colorés.

---

# PARTIE 5 — Dette technique & Fondations

> **Branche** : `tech/debt-foundations`
> **Issue** : `tech-01` à `tech-08`
> **Temps estimé** : 10h
> **Dépendance** : Partie 1 mergée dans main (peut être fait en parallèle de 2-3-4)

---

## Issue tech-01 — Accessibilité de base

**Priorité** : 🔴 Critique
**Fichiers** : Tous les écrans et composants

Aucun support d'accessibilité. Screen readers (VoiceOver) inutilisables.

**Action** : Ajouter sur tous les éléments interactifs :
1. `accessibilityLabel` : description courte ("Tâche : Acheter du pain, priorité haute")
2. `accessibilityRole` : `"button"`, `"checkbox"`, `"link"`, `"header"`, `"tab"`
3. `accessibilityHint` : ce que l'action va faire ("Double-tapez pour marquer comme terminé")
4. `accessibilityState` : `{ selected: true/false, disabled: true/false, checked: true/false }`
5. Sur les images/icons : `accessibilityLabel` descriptif

**Fichiers prioritaires** (par ordre d'impact) :
1. `src/components/tasks/TaskCard.tsx`
2. `app/(tabs)/planning.tsx`
3. `app/morning-ritual.tsx`
4. `app/evening-wrap.tsx`
5. `app/focus.tsx`
6. `app/(tabs)/index.tsx`
7. `app/(tabs)/week.tsx`
8. `app/(tabs)/blocks.tsx`
9. `app/(tabs)/settings.tsx`

**Validation** : Activer VoiceOver → naviguer dans l'app → tous les éléments sont lisibles et actionnables.

---

## Issue tech-02 — Structure i18n (internationalisation)

**Priorité** : 🟠 Haute
**Fichiers** : Nouveau dossier `src/i18n/`, modifications dans tous les écrans

Tout le texte est en français en dur. Aucune infrastructure de traduction.

**Action** :
1. Choisir une lib légère compatible Expo Go : `i18next` + `react-i18next` ou une solution maison
2. Créer `src/i18n/locales/fr.json` avec toutes les strings actuelles
3. Créer `src/i18n/locales/en.json` avec les traductions anglaises
4. Créer `src/i18n/index.ts` avec `useTranslation()` hook
5. Remplacer progressivement les strings en dur par `t('key')`

**Ne pas traduire tous les écrans d'un coup** — prioriser :
1. Settings (déjà en français, simple)
2. Accueil (dashboard)
3. Morning/Evening Rituals
4. Planning
5. Week/Blocks

**Validation** : Changer la locale → l'UI passe en anglais.

---

## Issue tech-03 — Tests (base)

**Priorité** : 🟠 Haute
**Fichiers** : Nouveaux fichiers `__tests__/`

Zéro test dans le projet.

**Action** :
1. Installer `jest`, `@testing-library/react-native`, `jest-expo`
2. Configurer `jest.config.js`
3. Écrire des tests pour les stores Zustand (les plus critiques) :
   - `dayScore/store.test.ts` : calcul du score, edge cases
   - `tasks/store.test.ts` : CRUD, tri par priorité
   - `streaks.test.ts` : calcul de streaks
4. Écrire des tests de rendu pour les composants clés :
   - `TaskCard.test.tsx` : affichage, toggle, priorité
   - `DayScoreHeader.test.tsx` : affichage du score
   - `TimelineBlock.test.tsx` : rendu avec/sans tâches

**Commande de test** : Ajouter `"test": "jest"` dans `package.json`

**Validation** : `npm test` passe avec au moins 15 tests.

---

## Issue tech-04 — TypeScript strict mode

**Priorité** : 🟡 Moyenne
**Fichier** : `tsconfig.json`

Le `tsconfig.json` n'a probablement pas le mode strict activé.

**Action** :
1. Vérifier `tsconfig.json`
2. Activer `"strict": true` (ou progressivement : `noImplicitAny`, `strictNullChecks`)
3. Corriger les erreurs TypeScript qui apparaissent
4. Ajouter des types manquants (vérifier les `any` dans les stores et composants)

**Attention** : Activer tout d'un coup peut générer beaucoup d'erreurs. Y aller par étapes :
- Étape 1 : `strictNullChecks: true`
- Étape 2 : `noImplicitAny: true`
- Étape 3 : `strict: true`

**Validation** : `npx tsc --noEmit` ne retourne aucune erreur.

---

## Issue tech-05 — Nettoyage des imports legacy

**Priorité** : 🟡 Moyenne
**Fichiers** : `src/theme/colors.ts`, `src/theme/index.ts`, divers composants

Le fichier `colors.ts` contient des propriétés "Legacy flat aliases" (`bgPrimary`, `bgSurface`, `border`, etc.) qui dupliquent `bg.*` et `separator.*`. Le `Card.tsx` utilise `colors.bgSurface` au lieu de `colors.bg.secondary`.

**Action** :
1. Scanner tous les fichiers qui utilisent les aliases legacy :
   ```bash
   rg "colors\.bgPrimary|colors\.bgSurface|colors\.bgInput|colors\.bgHover|colors\.bgBlockActive|colors\.border|colors\.textPrimary|colors\.textSecondary|colors\.textTertiary|colors\.textInverse|colors\.accentPrimary|colors\.accentSubtle|colors\.success|colors\.danger|colors\.warning|colors\.info" --type tsx
   ```
2. Remplacer chaque alias par son équivalent `colors.*` structuré :
   - `colors.bgSurface` → `colors.bg.secondary`
   - `colors.border` → `colors.separator.default`
   - `colors.success` → `colors.system.green`
   - etc.
3. Marquer les aliases comme `@deprecated` dans `colors.ts`
4. **Ne pas les supprimer** (risque de casser du code non scanné), juste les déprécier

**Validation** : `rg "colors\.bgSurface|colors\.border|colors\.success"` ne retourne rien hors de `colors.ts`.

---

## Issue tech-06 — Suppression des packages inutilisés

**Priorité** : 🟢 Basse
**Fichier** : `package.json`

D'après `AGENTS.md` v1, il faut "Désinstaller `uuid`, `@types/uuid`, `expo-linear-gradient`". Vérifier que c'est fait et scanner d'autres packages inutilisés.

**Action** :
1. Vérifier les packages listés dans `AGENTS.md` :
   ```bash
   npm ls uuid @types/uuid expo-linear-gradient
   ```
2. Si présents, désinstaller :
   ```bash
   npm uninstall uuid @types/uuid expo-linear-gradient
   ```
3. Scanner les imports dans le code pour détecter d'autres packages inutilisés
4. Vérifier aussi `date-fns` (AGENTS.md dit "utilisé avec précaution" et le code utilise des helpers maison pour les dates)

**Validation** : `npm ls` ne montre que les packages réellement utilisés.

---

## Issue tech-07 — Standardisation des helpers de date

**Priorité** : 🟢 Basse
**Fichiers** : `app/_layout.tsx`, `app/morning-ritual.tsx`, `app/evening-wrap.tsx`, `app/(tabs)/index.tsx`, `app/(tabs)/planning.tsx`, `src/features/focus/store.ts`, `src/features/rituals/store.ts`

La fonction `todayISO()` est dupliquée dans **7 fichiers**. `formatDateFr()` est dupliquée dans **2 fichiers**. `timeToMinutes()` dans **3 fichiers**. `tomorrowISO()` et `endOfWeekISO()` dans `evening-wrap.tsx`.

**Action** :
1. Créer `src/utils/date.ts` avec toutes les fonctions exportées :
   ```typescript
   todayISO(): string
   tomorrowISO(): string
   endOfWeekISO(): string
   formatDateFr(date: Date): string
   timeToMinutes(time: string): number
   currentMinutes(): number
   formatDuration(min: number): string
   DAY_LABELS: string[]
   ```
2. Remplacer toutes les définitions locales par des imports depuis `src/utils/date`
3. Garder une seule source de vérité

**Validation** : `rg "function todayISO|function formatDateFr|function timeToMinutes|const DAY_LABELS" --type tsx --type ts` ne retourne que le fichier `src/utils/date.ts`.

---

## Issue tech-08 — .gitignore et fichiers sensibles

**Priorité** : 🟢 Basse
**Fichiers** : `.gitignore`

Vérifier que les fichiers de config/persistance ne sont pas commités.

**Action** :
1. Vérifier `.gitignore` contient :
   ```
   node_modules/
   .expo/
   dist/
   *.jks
   *.p8
   *.p12
   *.key
   *.mobileprovision
   *.orig.*
   web-build/
   .env
   ```
2. Vérifier qu'aucun fichier sensible n'est tracké :
   ```bash
   git ls-files | rg -i "secret|token|key|env"
   ```
3. Ajouter `.vscode/` si pas déjà fait (préférence personnelle)

**Validation** : Pas de fichiers sensibles dans `git ls-files`.

---

## Résumé des dépendances entre parties

```
Partie 1 (fix) ──────┐
                      ├──> Partie 5 (tech) — parallélisable
                      │
                      └──> Partie 2 (ux) ──> Partie 3 (ui) ──> Partie 4 (feat)
```

- Les Parties 1 et 5 peuvent être faites en parallèle
- La Partie 2 dépend de la Partie 1 (bug fixes)
- La Partie 3 dépend de la Partie 2 (l'ux change avant le polish)
- La Partie 4 dépend de la Partie 3 (nouvelles features sur UI propre)

---

## Pour l'agent IA : workflow type par partie

```bash
# 1. Créer la branche
git checkout -b fix/critical-bugs

# 2. Travailler les issues une par une
# Pour chaque issue :
#   - Modifier les fichiers
#   - Tester visuellement (npx expo start)
#   - Commit avec message conventionnel

# Exemple de commits :
git commit -m "fix: splash screen white flash in dark mode (fix-01)"
git commit -m "fix: evening wrap auto-redirect never triggered (fix-02)"

# 3. Push et PR
git push origin fix/critical-bugs
# Ouvrir une PR "Partie 1 — Bugs critiques & Quick Wins"
# Lister les issues complétées dans la description

# 4. Merge dans main, puis :
git checkout main
git pull
git checkout -b ux/essential-ergonomics
# ... répéter
```

---

_Document généré le 27 mai 2026. 46 problèmes → 46 issues sur 5 parties._
