# Flowday

> Outil de design de vie pour développeurs et knowledge workers.
> React Native + Expo SDK 54 · iOS & Android

---

## Stack actuelle

| Technologie | Version |
|---|---|
| React Native | 0.81.5 |
| Expo SDK | ~54.0.33 |
| Expo Router | ~6.0.23 |
| Zustand | ^5.0.13 |
| AsyncStorage | 2.2.0 |
| Reanimated | ~4.1.1 |
| @gorhom/bottom-sheet | ^5.2.14 |

[Documentation technique complète → AGENTS.md](./AGENTS.md)

---

## Statut d'implémentation

### ✅ MVP v1.0 — Complet

- Life Blocks (CRUD, 5 seeded, 12 couleurs, archive, réordonner)
- Weekly Template (éditeur 7 jours, validation anti-chevauchement)
- Daily Timeline (scroll 06h-23h, ligne "MAINTENANT", blocs, créneaux libres)
- Tasks (CRUD, priorité, liées aux blocs)
- Day Score (Blocs 40% + Tâches 30% + Pomodoros 20% + Rituals 10%)
- Morning Ritual (5 étapes, humeur, overview, priorités, intention)
- Evening Wrap (4 étapes, report/suppression tâches, note, score final)
- Focus Mode (Pomodoro 25/5, plein écran, points session)
- Thèmes Dark + Light (switchable dans Réglages)

### 🔴 Bugs critiques à corriger

| Bug | Description | Priorité |
|---|---|---|
| Light mode cassé | Morning Ritual, Evening Wrap, EditBlockModal, EditTemplateModal, Button, Card, IconButton, PrioritySelector/Badge — couleurs dark en dur → illisible en light | Haute |
| Day Score % à 0 | `pomodorosPercent` et `ritualsPercent` jamais mis à jour par le store → toujours 0% dans l'affichage | Haute |
| Focus double-count | `tick()` du store et `useEffect` UI peuvent compter un pomodoro deux fois | Haute |
| Day Score scope | Blocs respectés compte tous les Life Blocks actifs au lieu de seulement ceux planifiés aujourd'hui | Moyenne |
| `userInterfaceStyle` | `"light"` dans `app.json` → devrait être `"automatic"` pour suivre le système | Moyenne |

### 🧹 Dead code à nettoyer

- `uuid` + `@types/uuid` — remplacé par `generateId()` custom
- `expo-linear-gradient` — jamais importé

---

## Plan de travail — 8 sessions

Chaque session correspond à un commit. Ordre recommandé : bugs d'abord, features ensuite.

---

### Session 1 — Bugs critiques

**Objectif :** rendre l'app utilisable en light mode + corriger le Day Score

- [ ] Corriger les couleurs en dur dans :
  - `app/morning-ritual.tsx`
  - `app/evening-wrap.tsx`
  - `src/components/lifeBlocks/EditBlockModal.tsx`
  - `src/components/templates/EditTemplateBlockModal.tsx`
  - `src/components/ui/Button.tsx`
  - `src/components/ui/Card.tsx`
  - `src/components/ui/IconButton.tsx`
  - `src/components/shared/PrioritySelector.tsx`
  - `src/components/shared/PriorityBadge.tsx`
  - `src/components/shared/ProgressBar.tsx`
- [ ] `app.json` → `"userInterfaceStyle": "automatic"`
- [ ] Day Score : calculer et stocker `pomodorosPercent` et `ritualsPercent` dans le store
- [ ] Day Score : filtrer les blocs respectés sur ceux planifiés aujourd'hui (template blocks du jour), pas tous les actifs

```bash
git add .
git commit -m "fix: light mode compatibility, day score percentages and scope"
```

---

### Session 2 — Focus timer + Cleanup

**Objectif :** fiabiliser le focus mode et nettoyer les dépendances mortes

- [ ] Déplacer la logique `completePomodoro` du `useEffect` UI vers le store `tick()`
- [ ] Mutualiser `formatDuration` avec `timeToMinutes` (supprimer la duplication)
- [ ] Désinstaller les packages inutilisés :
  ```bash
  npx expo uninstall uuid @types/uuid expo-linear-gradient
  ```

```bash
git add .
git commit -m "fix: focus timer double-count, deduplicate formatDuration, remove dead deps"
```

---

### Session 3 — Theme transition + Polish

**Objectif :** animation fluide Dark ↔ Light et vérification complète light mode

- [ ] Ajouter une animation `withTiming` sur les couleurs via `useAnimatedStyle`
- [ ] Vérifier écran Today, Week, Blocks, Settings en light mode
- [ ] Vérifier les séparateurs indentés partout (marginLeft sous l'icône)
- [ ] Vérifier les touch targets 44×44 minimum

```bash
git add .
git commit -m "feat: smooth theme transition with reanimated, full light mode polish"
```

---

### Session 4 — Notifications

**Objectif :** rappels rituals et fin de pomodoro

- [ ] Installer `expo-notifications`
  ```bash
  npx expo install expo-notifications
  ```
- [ ] Notification Morning Ritual (heure configurable, défaut 8h00)
- [ ] Notification Evening Wrap (heure configurable, défaut 20h00)
- [ ] Notification fin de pomodoro (à la fin du timer focus)
- [ ] Paramètres de notification dans l'écran Settings

```bash
git add .
git commit -m "feat: ritual and pomodoro notifications"
```

---

### Session 5 — Drag & drop + UX

**Objectif :** interactions tactiles avancées

- [ ] Installer `react-native-draggable-flatlist`
  ```bash
  npx expo install react-native-draggable-flatlist
  ```
- [ ] Remplacer les boutons up/down par du drag & drop dans l'écran Life Blocks
- [ ] Drag & drop pour réordonner les blocs dans le Template Editor
- [ ] Swipe to archive sur un Life Block
- [ ] Bottom sheet "ajouter une tâche" sur long-press d'un bloc timeline
- [ ] Parsing durée estimée dans l'input tâche : `"~1h30"` → `90` minutes

```bash
git add .
git commit -m "feat: drag-drop reorder, swipe archive, bottom sheet add task, duration parsing"
```

---

### Session 6 — Time Defender + Streaks

**Objectif :** garde du temps et suivi des séquences

- [ ] Calcul capacité journalière = `(workBlockMinutes + flexBlockMinutes) * 0.85`
- [ ] Suggestion de placement quand on ajoute une tâche avec durée estimée
- [ ] Détection de surcharge (journée > 95% utilisée)
- [ ] Nouveau store ou extension pour les streaks par Life Block
- [ ] Interface `BlockStreak` : currentStreak, longestStreak, lastActiveDate, minimumMinutes
- [ ] Affichage du streak dans `LifeBlockCard`

```bash
git add .
git commit -m "feat: time defender capacity calculation and life block streaks"
```

---

### Session 7 — Weekly Review + Momentum Score

**Objectif :** rapport de fin de semaine et tendance

- [ ] Écran `/weekly-review` avec le rapport complet
- [ ] Calcul du Momentum Score : `moyenne Day Scores × ratio tâches`
- [ ] 4 règles d'insight algorithmique (journée < 40, bloc < 50%, corrélation matin, record/streak)
- [ ] Auto-redirect le dimanche soir vers la review
- [ ] Affichage momentum dans le header de l'écran Today

```bash
git add .
git commit -m "feat: weekly review with insights and momentum score"
```

---

### Session 8 — Intégrations + Paywall (v2.0)

**Objectif :** GitHub OAuth dans la timeline et préparation monétisation

- [ ] Installer les packages OAuth
  ```bash
  npx expo install expo-auth-session expo-web-browser expo-crypto
  ```
- [ ] Authentification GitHub OAuth
- [ ] Pull des commits du jour dans le bloc Work de la timeline
- [ ] (Optionnel) Installer RevenueCat
  ```bash
  npx expo install @revenuecat/react-native-purchases
  ```
- [ ] (Optionnel) Templates multiples (limité en free, illimité en Pro)
- [ ] (Optionnel) Paywall avec RevenueCat

```bash
git add .
git commit -m "feat: github integration and pro paywall"
```

---

## Pour lancer

```bash
npx expo start       # Dev
npx expo export --platform ios  # Vérification bundle
```

Bundle iOS ~3.1 MB (HBC) · Modules : 1082
