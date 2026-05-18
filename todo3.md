# FLOWDAY — Product Spec Complet

> Document de référence produit pour Kimi K2.6
> Ne pas modifier la vision. Implémenter fidèlement.

---

## Vision

Flowday n'est pas un gestionnaire de tâches.
C'est un **outil de design de vie** pour développeurs et knowledge workers.

L'idée centrale : tu ne subis pas ta semaine, tu la **conçois**. Une fois ta semaine type définie, Flowday t'aide à la tenir jour après jour, en intégrant le boulot, le sport, la santé, l'apprentissage — tout dans une seule interface sobre et rapide.

Concurrent direct : aucun. Sunsama s'en approche mais est trop lourd et trop cher. Things 3 est beau mais ne touche pas à la vie en dehors du travail. Flowday est la première app qui traite une journée de dev comme un système complet.

---

## Utilisateur cible

**Profil principal** : développeur 22-35 ans, solo ou en startup, qui utilise déjà Linear / Notion / GitHub, qui aime les outils bien foutus, qui a essayé 10 apps de productivité et les a toutes désinstallées.

**Douleurs réelles** :

- Il oublie de faire du sport parce que le boulot prend tout
- Il finit ses journées sans savoir ce qu'il a accompli
- Ses tâches sont dans 4 outils différents
- Il n'a pas de rituel matin/soir, ses journées sont chaotiques
- Il ne sait pas si sa semaine était "bonne" ou non

**Ce qu'il veut** : une app qui ressemble à son éditeur de code — rapide, keyboard-friendly, zéro fioriture, qui lui fait sentir qu'il a le contrôle.

---

## Architecture produit

```
Flowday
├── Core
│   ├── Life Blocks (catégories de vie personnalisables)
│   ├── Weekly Template (semaine type)
│   ├── Daily Timeline (la journée en temps réel)
│   └── Tasks (tâches liées aux blocs)
│
├── Intelligence
│   ├── Day Score
│   ├── Time Defender
│   ├── Morning Ritual
│   ├── Evening Wrap
│   └── Weekly Review
│
├── Gamification
│   ├── Streaks par Life Block
│   └── Momentum Score
│
├── Intégrations (Pro)
│   ├── GitHub
│   ├── Google / Apple Calendar
│   └── Linear / Jira
│
└── Distribution
    ├── Widget iOS
    ├── Siri Shortcuts
    └── Focus Mode
```

---

## FEATURE 1 — Life Blocks

### Concept

Un Life Block est une **catégorie de vie** que l'utilisateur définit lui-même. Ce n'est pas une liste prédéfinie rigide. L'app propose des blocs par défaut mais tout est personnalisable.

Chaque bloc représente un domaine de vie auquel l'utilisateur veut consacrer du temps intentionnellement.

### Blocs par défaut (modifiables)

```
💻  Work          Boulot, code, réunions
🏃  Sport         Salle, course, vélo, yoga
🍳  Health        Cuisine, courses, sommeil
📚  Learning      Livres, cours, articles, veille tech
🧘  Recharge      Temps libre, famille, amis, rien
```

### Personnalisation complète

L'utilisateur peut :

- **Renommer** n'importe quel bloc
- **Changer l'emoji** — picker emoji natif iOS
- **Changer la couleur** — palette de 12 couleurs (les accents Apple du design system)
- **Créer un bloc custom** — ex: "🎸 Musique", "✍️ Écriture", "🌱 Side project"
- **Archiver un bloc** — il disparaît de l'UI sans perdre l'historique
- **Réordonner** les blocs par drag & drop

### Structure de données

```typescript
interface LifeBlock {
  id: string;
  name: string; // "Sport", "Deep Work", "Musique"
  emoji: string; // "🏃", "💻", "🎸"
  color: LifeBlockColor; // une des 12 couleurs définies
  isArchived: boolean;
  weeklyGoalMinutes: number; // objectif hebdo en minutes (ex: 300 = 5h)
  order: number; // position dans l'UI
  createdAt: string;
  updatedAt: string;
}

type LifeBlockColor =
  | "#30D158" // vert Apple
  | "#FF453A" // rouge Apple
  | "#FFD60A" // jaune Apple
  | "#BF5AF2" // violet Apple
  | "#0A84FF" // bleu Apple
  | "#FF9F0A" // orange Apple
  | "#FF375F" // rose Apple
  | "#5E5CE6" // indigo Apple
  | "#32ADE6" // cyan Apple
  | "#AC8E68" // marron Apple
  | "#6C6C70" // gris Apple
  | "#FFFFFF"; // blanc
```

### Objectif hebdomadaire

Chaque bloc a un objectif en minutes par semaine.
L'utilisateur le définit librement : "Je veux faire 5h de sport cette semaine", "Je veux 30h de code".

L'app calcule en temps réel : temps passé dans les blocs de la semaine courante vs objectif.

```
💻 Work       ████████░░  28h / 35h
🏃 Sport      ███░░░░░░░  1h30 / 5h
📚 Learning   █░░░░░░░░░  45min / 3h
```

### UI — Écran de gestion des Life Blocks

Accessible depuis Réglages → Life Blocks.

- Liste des blocs avec leur couleur / emoji / nom / objectif hebdo
- Bouton "+" en haut à droite pour créer
- Long press → mode édition avec drag & drop pour réordonner
- Swipe left → archiver (jamais supprimer pour préserver l'historique)

---

## FEATURE 2 — Weekly Template (Semaine Type)

### Concept

L'utilisateur dessine sa semaine idéale **une seule fois**. Chaque lundi, cette semaine type devient le squelette de sa semaine réelle. Il peut ajuster au quotidien, mais le template est la base.

C'est la feature la plus puissante de Flowday. Elle force l'intentionnalité.

### Templates multiples

L'utilisateur peut créer plusieurs templates :

```
🗓  Semaine normale     ← actif par défaut
⚡  Semaine de crunch   ← quand y'a un deadline
🏖  Mode vacances       ← pas de blocs work, que du sport/recharge
🎯  Semaine de sprint   ← 40h+ de code, minimum de distractions
```

Switcher de template = 1 tap. L'app applique le nouveau template à partir du lundi suivant.

**Limite freemium** : 1 template en gratuit, illimité en Pro.

### Structure d'un bloc dans un template

```typescript
interface TemplateBlock {
  id: string;
  lifeBlockId: string; // référence au Life Block
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = lundi
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  title?: string; // optionnel — "Deep Work", "Chest day"
  notes?: string; // optionnel
  isFlexible: boolean; // flexible = peut bouger dans la journée
}
```

### Vue éditeur de semaine type

- Vue grille 7 jours × 24h, scrollable verticalement
- Chaque bloc affiché dans sa couleur Life Block
- Tap sur un créneau vide → créer un bloc
- Tap sur un bloc existant → éditer (durée, titre, notes)
- Drag → déplacer dans la grille
- Les heures affichées : 6h → 23h (pas de 0h-5h sauf si l'utilisateur crée un bloc nuit)

### Validation dominicale

Le dimanche soir à 20h (heure configurable), notification :
_"Ta semaine de lundi arrive. 2 min pour la valider ?"_

L'app ouvre un écran de review rapide :

- Affiche les 5 prochains jours avec les blocs du template
- L'utilisateur peut drag & drop pour ajuster
- Bouton "Valider" → la semaine est confirmée

---

## FEATURE 3 — Daily Timeline

### Concept

La timeline est l'écran principal de l'app. Elle montre **la journée entière** de façon verticale, avec les blocs du template du jour, les tâches associées, et l'heure courante.

Elle répond à la question : _"Qu'est-ce que je suis censé faire là, maintenant ?"_

### Éléments visuels

```
│  08:00
│  ┌─────────────────────────────┐
│  │ 🏃 Sport                    │  ← bloc Life Block (couleur bloc)
│  │ Salle · 1h                  │
│  └─────────────────────────────┘
│  09:00 ─────── MAINTENANT ─────── ← ligne rouge avec heure
│  ┌─────────────────────────────┐
│  │ 💻 Deep Work               │  ← bloc actif (légèrement mis en avant)
│  │  ☐ Finir l'auth Supabase   │
│  │  ☐ Review PR de Marc       │
│  │  ✓ Setup Expo Router       │
│  └─────────────────────────────┘
│  12:00
│     (créneau libre)
│  13:00
│  ┌─────────────────────────────┐
│  │ 🍳 Health                  │
│  │ Préparer les repas semaine  │
│  └─────────────────────────────┘
```

### Comportements

- **Ligne de temps** : ligne fine rouge/blanche qui descend en temps réel, avec l'heure affichée dessus
- **Bloc actif** : le bloc en cours est légèrement plus lumineux, fond `#1A1A1A` → `#222222`
- **Tâches dans les blocs** : les tâches associées à ce Life Block ET prévues aujourd'hui apparaissent à l'intérieur du bloc de la timeline
- **Créneau libre** : si aucun bloc entre 12h et 13h → affiché sobrement comme une zone grise avec "Libre"
- **Charge indicator** : en haut de l'écran, une petite jauge discrète : `Journée chargée · 8h planifiées`
- **Scroll** : la timeline scroll automatiquement pour montrer l'heure courante au tiers supérieur de l'écran à l'ouverture

### Ajouter une tâche à un bloc

Long press sur un bloc → bottom sheet pour ajouter une tâche directement liée à ce bloc.

---

## FEATURE 4 — Day Score

### Concept

Un score entre 0 et 100, calculé en temps réel, qui reflète la qualité de la journée en cours. Affiché en grand sur l'écran Aujourd'hui.

Ce n'est pas un jugement. C'est un miroir.

### Calcul

```
Day Score = moyenne pondérée de 4 composantes :

1. Blocs respectés (40%)
   Nombre de blocs de la timeline validés / nombre total de blocs
   Un bloc est "validé" si l'utilisateur l'a marqué comme fait, ou si des tâches de ce bloc ont été complétées pendant la période

2. Tâches complétées (30%)
   Tâches cochées aujourd'hui / tâches prévues aujourd'hui
   Plafonné à 100% (faire plus que prévu ne pénalise pas)

3. Pomodoros complétés (20%)
   Pomodoros finis / objectif pomodoro du jour (configurable, défaut 6)

4. Ritual score (10%)
   Morning Ritual fait = +5pts
   Evening Wrap fait = +5pts
```

### Affichage

```
┌─────────────────────────────────────┐
│                                     │
│              74                     │  ← grand, sobre
│         Bonne journée               │  ← label contextuel
│                                     │
│  Blocs    ████████░░  80%           │
│  Tâches   ██████░░░░  60%           │
│  Focus    █████████░  90%           │
│  Rituals  █████░░░░░  50%           │
│                                     │
└─────────────────────────────────────┘
```

### Labels contextuels selon le score

```
90-100  "Journée parfaite. 🔥"
75-89   "Bonne journée."
60-74   "Journée correcte."
45-59   "Journée mitigée."
30-44   "Journée difficile."
0-29    "Ça arrive."
```

Pas de jugement excessif. Pas d'emoji malheureux. Neutre et adulte.

---

## FEATURE 5 — Time Defender

### Concept

Quand l'utilisateur ajoute une tâche avec une durée estimée, Flowday calcule si la journée peut l'absorber et propose un placement intelligent.

C'est le garde-du-corps de la journée. Il empêche la surcharge silencieuse.

### Comportement

**Scénario 1 — Journée a de la place**

```
Tu ajoutes : "Refactoriser le module auth · ~1h30"
Flowday : "Tu as 2h de libre entre 15h et 17h dans ton bloc Work.
           Je la place là ?"
           [Oui, place-la]  [Choisir moi-même]
```

**Scénario 2 — Journée pleine**

```
Tu ajoutes : "Refactoriser le module auth · ~1h30"
Flowday : "Ta journée est déjà à 95%. Cette tâche ne rentre pas confortablement.
           Demain matin (9h-10h30) est libre."
           [Mettre demain]  [Forcer aujourd'hui]  [Sans date]
```

**Scénario 3 — Aucune durée estimée**
L'app ne bloque rien, elle suggère juste : _"Combien de temps ça prendra ?"_
Champ optionnel, jamais obligatoire.

### Calcul de capacité journalière

```typescript
// Capacité = durée totale des blocs Work + blocs flex de la journée
// Moins le temps déjà alloué à des tâches avec durée estimée
// Moins un buffer de 15% (marge automatique)

const dailyCapacity = (workBlockMinutes + flexBlockMinutes) * 0.85;
const usedMinutes = tasks
  .filter((t) => t.scheduledDate === today && t.estimatedMinutes)
  .reduce((sum, t) => sum + t.estimatedMinutes, 0);
const availableMinutes = dailyCapacity - usedMinutes;
```

---

## FEATURE 6 — Morning Ritual

### Concept

Chaque matin, à l'ouverture de l'app (ou via notification configurable), un écran de 30 secondes prépare la journée. Rapide. Jamais chiant.

### Flow (5 étapes, aucune obligatoire)

```
Étape 1 — Bonjour
"Bonjour. Mardi 18 juin."
"Comment tu te sens ?"
   🔴 Pas top    🟡 Bof    🟢 En forme
   [1 tap, on passe à la suite]

Étape 2 — Ta journée
Affiche les blocs du jour de façon condensée.
"Aujourd'hui : Sport 8h, Deep Work 9h-12h, Courses 13h, Learning 21h"
[Ça me va →]

Étape 3 — Tes 3 priorités
L'app propose 3 tâches (les plus prioritaires / overdue / deadline proche).
L'utilisateur peut les valider ou les changer.
"Tes 3 tâches du jour :"
   🔴 Finir l'auth Supabase
   🟡 Review PR de Marc
   🟢 Lire chapitre 3 de Clean Code
[Valider →]

Étape 4 — Intention (optionnel)
"Un mot pour cette journée ?" — champ libre, 1-3 mots max
Ex: "Focus", "Récupération", "Sprint", "Equilibre"
Affiché discrètement dans le header de la journée.
[Passer →]  ou  [Écrire →]

Étape 5 — Lancé
"C'est parti. Day score : 0 → objectif 80+."
[Commencer la journée]
```

### Configuration

- Heure de notification du Morning Ritual (défaut : 8h00)
- Possibilité de désactiver certaines étapes
- "Mode rapide" — saute directement à l'étape 3

---

## FEATURE 7 — Evening Wrap

### Concept

Le soir (heure configurable, défaut 20h), l'app invite à un bilan de journée de 2 minutes. C'est le moment de clore proprement, pas de traîner des tâches non faites indéfiniment.

### Flow

```
Étape 1 — Bilan visuel
Affiche le Day Score final avec le détail.
"Journée à 74. Blocs : 80% · Tâches : 60% · Focus : 90%"

Étape 2 — Tâches non faites
Liste les tâches prévues aujourd'hui mais non cochées.
Pour chacune, l'utilisateur choisit :
   [Report demain]  [Report cette semaine]  [Supprimer]
Décision forcée — pas de "je verrai plus tard"

Étape 3 — Note du jour (optionnel)
Champ libre, 1-3 phrases max.
"Qu'est-ce qui s'est passé aujourd'hui ?"
Stocké dans l'historique, jamais affiché à personne.

Étape 4 — Score final + streak
"Journée validée. 🔥 Streak Work : 12 jours."
[Bonne nuit]
```

---

## FEATURE 8 — Weekly Review

### Concept

Chaque dimanche soir, rapport automatique de la semaine. C'est la feature qui crée la rétention long terme. Les utilisateurs qui font leur Weekly Review chaque semaine ne désinstallent jamais l'app.

### Structure du rapport

```
SEMAINE DU 12 AU 18 JUIN

Day Scores
Lun  ████████░░  82
Mar  ██████░░░░  61
Mer  █████████░  91
Jeu  ███░░░░░░░  34   ← journée difficile
Ven  ████████░░  79
Sam  ████░░░░░░  44
Dim  ──────────  (pas de score le dimanche par défaut)

Moyenne semaine : 65  ↑ +8 vs semaine dernière

─────────────────────────────────────

Temps par Life Block (réel vs objectif)

💻 Work        28h / 35h   ██████████░░░░  -7h
🏃 Sport       4h30 / 5h   █████████░░░░░  -30min
🍳 Health      3h / 2h     ██████████████  ✓ objectif dépassé
📚 Learning    45min / 3h  ███░░░░░░░░░░░  -2h15
🧘 Recharge    6h / 4h     ██████████████  ✓

─────────────────────────────────────

Tâches
Créées cette semaine   : 24
Complétées             : 18  (75%)
Reportées              : 4
Supprimées             : 2

Pomodoros complétés    : 31  (objectif : 30) ✓

─────────────────────────────────────

Insight de la semaine

"Tu as codé 28h mais ton objectif est 35h.
 Jeudi (-7pts) a pesé lourd. Tes 3 meilleures journées
 avaient toutes un bloc Deep Work avant 10h."

─────────────────────────────────────

Streaks actifs
🔥 Work consecutive days : 5
🔥 Morning Ritual : 12
💔 Sport : streak cassé vendredi

─────────────────────────────────────

[Valider ma semaine suivante →]
```

### Génération de l'insight

L'insight est calculé algorithmiquement (pas d'IA externe nécessaire pour la v1) :

```typescript
// Règles d'insight en ordre de priorité :
// 1. Si une journée a un score < 40 → analyser ce qui a cloché
// 2. Si un Life Block est < 50% de l'objectif → le signaler
// 3. Corréler heure du premier bloc Work vs Day Score → pattern matin/soir
// 4. Streak cassé → le mentionner
// 5. Record personnel → le célébrer
```

---

## FEATURE 9 — Streaks & Momentum

### Streaks par Life Block

Chaque Life Block a son propre streak : nombre de jours consécutifs où l'utilisateur a atteint son quota minimum pour ce bloc.

```typescript
interface BlockStreak {
  lifeBlockId: string;
  currentStreak: number; // jours consécutifs actuels
  longestStreak: number; // record personnel
  lastActiveDate: string; // pour calculer si le streak est toujours actif
  minimumMinutes: number; // quota min pour valider un jour (ex: 30min de sport)
}
```

### Momentum Score

Score global de la semaine en cours, mis à jour chaque soir.

```
Momentum = (moyenne des Day Scores de la semaine) × (ratio tâches complétées)
```

Affiché sous forme de tendance dans le header de l'écran Aujourd'hui :

```
↑ Bonne semaine  (momentum 78)
↓ Semaine difficile  (momentum 41)
→ Semaine stable  (momentum 62)
```

---

## FEATURE 10 — Focus Mode

### Concept

Un mode plein écran minimaliste, activable depuis n'importe où. Masque tout sauf la tâche en cours et le timer. Zéro distraction.

### UI

```
─────────────────────────────────────
(fond noir total, rien d'autre)


      Finir l'auth Supabase


         23:47
      ●●●●○○○○○○


      [Pause]        [Abandonner]


─────────────────────────────────────
```

- Tâche en cours : texte centré, 20px, blanc
- Timer : `MM:SS` en grand (46px), sobre
- Indicateur de session : points remplis/vides (1 par pomodoro, max 8)
- Pas de navigation. Pas de tab bar. Juste la tâche.
- Activation : bouton "Focus" dans la vue tâche, ou 3D Touch sur l'icône app

---

## FEATURE 11 — Widget iOS

### Types de widgets

**Small (2×2)**

```
┌──────────────────┐
│  Flowday         │
│                  │
│  74              │
│  Bonne journée   │
└──────────────────┘
```

**Medium (4×2)**

```
┌─────────────────────────────────────┐
│  Mardi · 74pts                      │
│                                     │
│  💻 Deep Work  ████████  9h-12h     │
│  ☐ Finir auth Supabase              │
│  ☐ Review PR de Marc                │
└─────────────────────────────────────┘
```

**Large (4×4)**
Timeline complète de la journée, blocs colorés.

### Tech

`expo-widgets` ou widget natif via Expo Modules API.
Les données sont lues depuis le storage partagé (App Group sur iOS).

---

## FEATURE 12 — Intégrations (Pro)

### GitHub

```
Connexion via OAuth GitHub.
Pull quotidien des commits de l'utilisateur.
Chaque commit apparaît dans la timeline comme un micro-event dans le bloc Work.

"14h32 · 3 commits · flowday/flowday"

Bénéfice : le Day Score Work se calcule aussi sur l'activité GitHub réelle,
pas seulement sur les tâches cochées.
```

### Google / Apple Calendar

```
Import one-way des events calendrier.
Les events apparaissent dans la timeline en lecture seule.
Couleur : gris neutre (#3A3A3A) pour les distinguer des blocs Flowday.
Aucune modification du calendrier depuis Flowday (v1).
```

### Linear / Jira

```
Pull des issues assignées à l'utilisateur.
L'utilisateur choisit quelles issues importer comme tâches Flowday.
Sync unidirectionnelle : quand une tâche Flowday est cochée,
l'issue Linear passe en "Done" automatiquement.
```

---

## Modèle économique

### Flowday Free — forever

- Tâches illimitées
- 1 Weekly Template
- 5 Life Blocks max
- Timeline journalière
- Timer Pomodoro
- Day Score (basique, sans détail)
- Morning Ritual et Evening Wrap
- Historique 30 jours

### Flowday Pro — 2,99€/mois · 24,99€/an

- Templates illimités
- Life Blocks illimités + personnalisation complète
- Day Score détaillé
- Weekly Review avec insights
- Streaks avancés + historique illimité
- Widget iOS (Medium + Large)
- Toutes les intégrations (GitHub, Calendar, Linear)
- Thèmes : Dark, OLED (vrai #000000), Tinted (accent coloré sur fond)
- Siri Shortcuts
- Export données (CSV / JSON)

### Flowday Lifetime — 59,99€ one-time

- Tout Pro pour toujours
- Disponible uniquement les 90 premiers jours après le lancement
- Badge "Early Adopter" dans le profil (social proof subtil)
- Accès prioritaire aux bêtas futures

### Logique de conversion

- Le Free est suffisamment utile pour créer l'habitude
- Le Pro se justifie dès qu'on veut les intégrations ou le Widget
- Le Lifetime convertit les early adopters et finance le développement initial
- Pas de trial limité dans le temps — l'utilisateur découvre la valeur naturellement

---

## Roadmap de lancement

### v1.0 — MVP (lancement App Store)

Objectif : l'essentiel, irréprochable.

```
✓ Life Blocks (5 par défaut, personnalisation complète)
✓ Weekly Template (1 template, éditeur drag & drop)
✓ Daily Timeline (avec ligne de temps live)
✓ Tasks (CRUD, priorité, durée estimée)
✓ Timer Pomodoro (basique, dans le Focus Mode)
✓ Morning Ritual
✓ Evening Wrap
✓ Day Score (calcul basique)
✓ Design system complet (Apple/X)
✓ Persistance locale (MMKV)
```

Ne pas inclure en v1.0 : intégrations, widget, weekly review, streaks avancés.

### v1.5 — Rétention

```
+ Streaks par Life Block
+ Weekly Review (algorithmique, sans IA)
+ Time Defender
+ Momentum Score
+ Widget iOS Small et Medium
+ Notifications intelligentes (streak en danger, ritual rappel)
```

### v2.0 — Monétisation

```
+ Paywall Pro (RevenueCat)
+ Templates multiples
+ Thèmes OLED et Tinted
+ Widget Large
+ Export données
+ Siri Shortcuts
```

### v2.5 — Intégrations

```
+ GitHub OAuth + commits dans timeline
+ Google Calendar import
+ Apple Calendar import
+ Linear sync
+ Jira sync (beta)
```

---

## Principes de développement

### Ce qu'on ne compromet jamais

1. **La rapidité** — chaque action doit répondre en < 100ms. Jamais de loader pour une action locale.
2. **Le design** — aucune exception au design system. Une seule déviation ouvre la porte au chaos.
3. **La simplicité** — si une feature demande une explication, elle est trop complexe.
4. **L'honnêteté** — le Day Score dit la vérité. L'app ne flatte pas l'utilisateur.

### Stack technique rappel

```
React Native + Expo SDK 52
Expo Router (navigation)
NativeWind v4 (styles)
React Native Reusables (composants UI)
Zustand (state)
MMKV (persistance locale)
react-native-reanimated (animations)
@gorhom/bottom-sheet (sheets)
lucide-react-native (icônes)
RevenueCat (abonnements, v2.0)
```

### Priorités d'implémentation

Toujours dans cet ordre :

1. Ça marche (fonctionnel, sans bug)
2. Ça va vite (pas de jank, pas de lag)
3. Ça ressemble à quelque chose (design)
4. Ça impressionne (animations, polish)

Ne jamais commencer par 4 si 1 n'est pas fait.
