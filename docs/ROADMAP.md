# Flowday — Direction produit et feuille de route

> Document de travail interne, écrit le 7 octobre 2026 sur la base du code de la
> branche `v.0.2.0/UI`, puis relu et corrigé contre le code le même jour (décision
> sur le public, ordre adapté au développement sans Mac). Il répond à une seule question : qu'est-ce qui
> différencierait Flowday des autres applications de planification, et que faut-il
> changer, supprimer ou ajouter pour y arriver.
>
> Ce n'est pas une liste de tâches à faire en entier. C'est un ordre de priorité.

---

## 1. Le constat

### Ce qui est déjà construit

Environ 11 000 lignes de TypeScript, 10 écrans, 11 stores Zustand, 83 tests sur la
logique répartis en 17 fichiers, des migrations de persistance versionnées, i18n
FR/EN, un onboarding, un undo, des retours haptiques. Les labels d'accessibilité
sont nombreux mais pas encore complets (voir `docs/todo/todo.md`).

**La qualité technique n'est pas le problème.** Le score pondéré de
`src/features/dayScore/store.ts` avec redistribution des poids quand une catégorie
est vide est une vraie finesse de produit : quelqu'un qui n'a pas de tâches un jour
n'est pas puni pour ça.

### Le trou dans la catégorie

Chaque famille de concurrents optimise un seul moment :

| Famille | Exemples | Ce qu'ils optimisent | Ce qui leur manque |
|---|---|---|---|
| Timeline / time-blocking | Structured, TimeBloc, Sorted | L'**avant** : poser sa journée | Aucune boucle de retour, aucun bilan |
| Habit trackers | Streaks, Routinery, Finch | Le **pendant** : cocher | Hors du temps réel, ignorent l'agenda |
| Task managers | Todoist, Things, TickTick | La **capture** | Liste infinie, aucun rapport au temps |
| Focus timers | Forest, Session, Opal | Une **session** | Aucune vision d'ensemble |
| Rituels / réflexion | Sunsama, Stoic | Le **cadrage** | Desktop, chers, ignorent les domaines de vie |

**Presque personne ne compare l'intention à la réalité, par domaine de vie, dans le
temps.** Tout le monde fait planifier, certains font cocher, personne ne met devant
l'écart.

---

## 2. Le positionnement

### La thèse

> **Flowday n'est pas un planificateur. C'est le miroir entre la vie que tu as
> prévue et la vie que tu as vécue.**

Ce repositionnement ne demande presque aucune fonctionnalité nouvelle — il demande
de relire celles qui existent :

| Aujourd'hui | Avec la thèse |
|---|---|
| La semaine type est une commodité | C'est une **déclaration d'intention** : voilà qui je veux être |
| La validation de bloc est une case à cocher | C'est la **mesure du réel** |
| L'Evening Wrap est un journal | C'est la **réconciliation quotidienne** |
| Le score est de la gamification | C'est un **taux de fidélité à sa propre parole** |

### Pourquoi c'est défendable

Le modèle de données contient déjà tout le côté « intention » :

- `TemplateBlock` (start/end par domaine, par jour) → les minutes que la personne a
  **décidé** de consacrer à chaque domaine ;
- `LifeBlock.weeklyGoalMinutes` → l'objectif explicite par domaine ;
- `RitualLog` (`mood` le matin, `note` le soir) → du signal qualitatif daté.

Ce qui manque, c'est le côté « réel » (voir P0). Et une fois les deux côtés
présents, l'artefact produit devient impossible à copier : un concurrent ne peut pas
falsifier six mois d'historique personnel. **Le produit s'améliore avec l'usage.**

### Les trois autres angles réellement ownables

1. **La semaine est la primitive, pas la journée.** Tous les concurrents font
   planifier chaque jour. Flowday fait *concevoir une semaine une fois*, puis la
   vivre. « Décide une fois, pas chaque matin. » Déjà construit, et c'est une arme
   sur la fatigue décisionnelle.
2. **Le réalisme de capacité.** La semaine type connaît les heures disponibles.
   Aucune app ne refuse de laisser planifier 14 h d'intentions dans une journée de
   9 h, parce que c'est désagréable à entendre. C'est précisément pour ça que c'est
   défendable face à Structured.
3. **Le ton honnête plutôt qu'encourageant.** Toute la catégorie est en mode
   pom-pom girl. Une app qui dit sans ciller « tu as sauté le sport 3 semaines
   d'affilée » occupe un espace vide. Honnête ne veut pas dire culpabilisant : on
   **constate l'écart** et on **propose d'ajuster le plan**, on ne juge pas la
   personne (voir point 20).

### Les fausses différenciations (ne pas y passer trois mois)

- ❌ **« Un plus beau design »** — Structured a déjà gagné là-dessus, et un design se
  copie en un sprint.
- ❌ **« L'IA planifie ta journée »** — tout le monde a shippé ça en 2024-25, c'est
  devenu du bruit, et les gens ne confient pas leur agenda à un LLM.
- ❌ **Plus de fonctionnalités** — la catégorie meurt de l'obésité ; Amazing Marvin
  est le contre-exemple parfait.
- ❌ **La gamification** — Habitica possède le terrain, et ça attire des utilisateurs
  qui churnent.

### Le public : décidé

**Toute personne qui veut une application pour piloter sa vie, pas seulement sa
journée de travail.** Pas de niche démographique (étudiants, TDAH, freelances…).

Le risque d'un public large, c'est un message flou. La réponse n'est pas de choisir
un profil mais de choisir **un problème que tout le monde reconnaît** :

> **Tu sais ce que tu veux faire de ta semaine. Flowday te montre ce que tu en fais
> vraiment.**

Le sport qui saute, la lecture qui n'arrive jamais, le projet perso qui meurt, la
famille qui passe après le travail : tout le monde a un domaine qu'il sacrifie sans
s'en rendre compte. C'est exactement ce que le bilan de dérive révèle.

Conséquences :

- **Produit** : rien ne change, le P0 sert tout le monde.
- **Onboarding** : des semaines types qui couvrent large (point 18).
- **Distribution** : sans communauté ciblée, elle passera par le contenu (« ma
  semaine prévue vs vécue » en vidéo verticale) et une fiche App Store qui montre
  l'écran de bilan, pas la timeline.

---

## 3. P0 — La mécanique centrale

*Sans ça, tout le reste est du vernis. Compter 3 à 4 semaines.*

### 〽️ 1. L'app ne mesure pas le temps vécu, elle mesure ce qui était prévu

**C'est le point le plus important de ce document.**

Dans `app/(tabs)/blocks.tsx:22`, `getWeeklyMinutes()` additionne les durées de la
**semaine type**. Donc la barre de progression de chaque domaine se remplit à 100 %
dès que le template correspond à l'objectif — même si rien n'a été fait de la
semaine. La variable s'appelle `timeSpent` et la prop `timeSpentMinutes`
(`src/components/lifeBlocks/LifeBlockCard.tsx:14`) : le code prétend afficher du
temps vécu alors qu'il affiche du temps planifié.

**C'est une tautologie, et c'est exactement ce qui rend Flowday identique aux
autres.**

Ce qu'il faut, un journal du réel :

```ts
interface BlockLog {
  date: string;              // YYYY-MM-DD
  lifeBlockId: string;
  templateBlockId?: string;  // absent si bloc ajouté à la volée
  plannedMinutes: number;
  status: 'done' | 'partial' | 'skipped';
  source: 'notification' | 'manual';
}
```

**On ne demande pas de minutes à l'utilisateur.** Saisir « 47 minutes » est une
corvée et une fausse précision. Le statut suffit, et les minutes vécues s'en
déduisent : *fait* = prévu, *en partie* = la moitié, *pas fait* = 0. Les seules
minutes exactes viennent du Focus (point 4), qui s'additionnent par domaine.

À partir de là, « prévu vs vécu par domaine » devient une simple requête. **Tout le
reste de la différenciation se construit sur ce seul type.** Prévoir une migration
dans `src/utils/persistence.ts` (les scores existants n'ont pas ces données : les
laisser sans `BlockLog` plutôt que d'inventer des valeurs).

### 〽️ 2. Un bloc sans tâche est invisible pour le score

`src/features/dayScore/blockValidation.ts:12` : `if (blockTasks.length === 0) continue;`

Donc « Sport 19h-20h » sans tâche attachée ne compte **jamais** dans les 40 % du
score. C'est un trou dans la boucle principale : la majorité des blocs de vie
(sport, lecture, repas, sommeil) n'ont naturellement pas de tâche.

**Un bloc doit se valider pour lui-même, pas via une tâche-proxy.**

À noter : `docs/todo/todo.md` contient déjà « 〽️ Décider comment un Life Block est
validé ». C'est la même question, et c'est la question centrale du produit.

**Réponse recommandée** : un bloc se valide

- **par la notification de fin de bloc** (point 3), le chemin principal ;
- **à la main** depuis le planning, pour rattraper un oubli ;
- et le **Focus** crédite des minutes exactes au domaine (point 4).

La règle actuelle « une tâche cochée valide le bloc » disparaît : les tâches restent
des tâches, elles ne servent plus de proxy.

En attendant, le score ne pénalise plus ce trou : une catégorie sans rien à mesurer
est retirée et son poids redistribué. Mais ça masque le problème, ça ne le règle pas.

### 〽️ 3. Collecter le réel sans créer une corvée

L'infra de notifications existe déjà (`src/features/notifications/schedule.ts`,
avec anticipation réglable sur le début des blocs). Ajouter la **notification de fin
de bloc** avec trois boutons d'action :

> **Sport, 19h-20h — tu l'as fait ?**  ·  *Fait*  ·  *En partie*  ·  *Pas fait*

Une seule tap, hors de l'application, et le journal se remplit. C'est la brique qui
rend tout le reste possible, et elle réutilise une infrastructure déjà en place.

Les actions de notification (`setNotificationCategoryAsync` d'`expo-notifications`)
ne demandent pas de code natif : c'est faisable sans Mac. Comportement à confirmer
sur un vrai iPhone, dans Expo Go puis en dev build. C'est aussi ce qui rend les
widgets moins urgents : la collecte hors de l'app existe déjà par ce biais.

### 〽️ 4. Rattacher le Focus aux domaines

`FocusSession` (`src/types/focus.ts`) n'a que `taskId`. Ajouter `lifeBlockId` :
chaque pomodoro devient des minutes réelles créditées à un domaine. Le Focus arrête
alors d'être un gadget qui concurrence Forest et devient **l'instrument de mesure**.

### 〽️ 5. L'écran qui n'existe pas : le bilan

*C'est aussi là que le type mort `WeekScore` (point 15) trouve enfin un usage.*

Il y a 5 onglets (Aujourd'hui, Planning, Semaine, Blocs, Réglages) et **aucun écran
d'historique**. Les `scores` sont persistés depuis le début et n'apparaissent que
sous forme de streak et d'une mini-bande 7 jours (`app/(tabs)/index.tsx:138`). Le
type `WeekScore` (`src/types/dayScore.ts:18`) est défini et **utilisé nulle part**.

C'est l'écran-produit, celui qui justifie l'application :

> **Octobre**
> Sport — 6 h prévues → **1 h 40 vécues**
> Apprentissage — 8 h prévues → **2 h vécues**
> Travail — 20 h prévues → **31 h vécues**
>
> *Le travail a absorbé 6 h d'apprentissage. 3ᵉ mois d'affilée.*

Et le niveau au-dessus, que personne n'a : `mood` est déjà collecté le matin et
`note` le soir (`RitualLog`). Les croiser avec l'équilibre des domaines →
*« tes journées notées "good" contiennent presque toujours du sport »*. Aucun
concurrent ne peut copier ça sans ce modèle de données.

---

## 4. P1 — Le standard du marché

> **Contrainte actuelle : pas de Mac.** Tout ce qui est en JavaScript (calendrier,
> import, actions de notification) se fait depuis Windows avec Expo Go ou EAS Build.
> Les widgets, Live Activities et App Intents demandent une extension native en
> Swift : faisable via EAS, mais à l'aveugle, sans simulateur ni preview SwiftUI,
> avec un build cloud à chaque essai. **Les points 8, 9 et 10 passent donc avant 6,
> 7 et 11**, tant qu'il n'y a pas de Mac.

### 〽️ 6. Widgets — avec un piège d'architecture à connaître avant de commencer

Indispensable, mais attention : **un widget iOS ne peut pas lire AsyncStorage.**
L'extension tourne dans un autre processus. Il faudra :

- un **App Group** + un fichier ou `UserDefaults` partagé, réécrit à chaque
  changement pertinent (un « widget payload » minimal : prochain bloc, score du
  jour, streak) ;
- une extension **WidgetKit en Swift**, via un config plugin (approche communautaire
  actuelle : `expo-apple-targets`) — donc du natif, plus d'Expo Go, uniquement des
  dev builds ;
- côté Android, un widget **Glance** en Kotlin.

Compter un effort réel, pas un week-end.

Mais voilà le point intéressant : avec les **widgets interactifs** (AppIntent,
iOS 17+), les boutons *Fait / En partie / Pas fait* vont **directement sur l'écran
d'accueil**. Le widget n'est alors plus une décoration : c'est la surface de collecte
de données. La mécanique unique et le widget deviennent la même fonctionnalité.
C'est rare, et c'est fort.

### 〽️ 7. Live Activity / Dynamic Island

Le bloc en cours avec sa barre de progression, et le timer Focus, dans l'île
dynamique. Pour un planificateur de journée c'est l'élément le plus « wow » du
marché, et le plus montrable en vidéo verticale. Même extension native, ActivityKit.

### 〽️ 8. Lecture du calendrier (`expo-calendar`, lecture seule)

Sans ça, on demande de ressaisir des réunions qui existent déjà ailleurs — c'est le
motif d'abandon n°1 des planners. Et ça débloque l'angle « réalisme de capacité » :
connaître les vraies heures libres permet de refuser 14 h d'intentions dans une
journée de 9 h.

### 〽️ 9. L'import du backup

`buildExport` n'a aucun pendant : l'export est une impasse
(`app/(tabs)/settings.tsx`, `exportData`). En plus il passe par
`Share.share({ message: <tout le JSON> })`, ce qui se comportera mal dès quelques
centaines de Ko. Passer par un fichier + `expo-document-picker` pour relire, avec un
écran de confirmation avant écrasement.

### 〽️ 10. Prérequis de publication

Rien n'est soumettable en l'état :

- `ios.bundleIdentifier` et `android.package` absents de `app.json` ;
- **politique de confidentialité** obligatoire sur l'App Store (simple ici : tout
  reste sur l'appareil, aucune donnée collectée) ;
- **e-mail de support** à afficher dans les réglages et sur la fiche ;
- **remontée des crashs** (Sentry) avant que des gens paient : sans ça, on ne sait
  pas quand l'app plante chez eux ;
- un premier build **TestFlight** via EAS pour tester comme une vraie app.

### 〽️ 11. App Intents / Siri

« Dis Siri, démarre un focus », « valide mon bloc ». Peu de travail une fois
l'extension native en place, et ça place l'app dans les suggestions système.

---

## 5. P2 — À supprimer ou simplifier

*Le plus dur, et ce qui fait les bonnes applications.*

### ❌ 12. `isFlexible` : une promesse vide

Modifiable dans l'éditeur (`src/components/templates/EditTemplateBlockModal.tsx:172`),
affiché comme « Flex » sur la carte
(`src/components/templates/TemplateBlockCard.tsx:24`), et **aucun effet nulle part**.

Deux options :

- lui donner un sens réel — un bloc flexible se décale automatiquement quand la
  journée glisse (ce serait une excellente fonctionnalité) ;
- ou le supprimer.

Un réglage qui ne fait rien érode la confiance.

### ❌ 13. `estimatedMinutes` : champ mort

Déclaré dans `src/types/task.ts:11`, utilisé nulle part. Le supprimer, ou s'en servir
pour le calcul de capacité (point 8).

### 〽️ 14. Le score est trop compliqué

Voir `app/(tabs)/index.tsx:159-164` : il faut un panneau d'aide de six lignes pour
expliquer le chiffre central. Quatre catégories, quatre poids (40/30/20/10), une
règle de redistribution, et une règle « un bloc est validé dès qu'une tâche est
cochée ».

**Si le nombre principal nécessite une notice, il est trop complexe.**

Passer à deux axes lisibles instantanément :

- **Fidélité** — ai-je vécu ce que j'avais prévu ?
- **Équilibre** — mes domaines sont-ils respectés ?

La logique de redistribution déjà écrite est bonne : la garder, l'appliquer à moins
de catégories.

**À faire après `BlockLog`, pas avant** : l'axe Fidélité n'a rien à mesurer tant que
le réel n'est pas collecté. C'est une conséquence du P0, pas un chantier séparé.

### ❌ 15. `WeekScore` : type mort

`src/types/dayScore.ts:18`. À brancher sur l'écran de bilan (point 5) ou à supprimer.

### 〽️ 16. `initializeDefaults` est fragile

`src/features/templates/store.ts` utilise `lifeBlockIds[0]`, `[1]`, `[2]` comme
étant positionnellement travail / sport / déjeuner. Avec le flux actuel, le bug ne
se produit pas : la semaine type est créée au lancement avec les cinq blocs, avant
l'onboarding, qui retire ensuite les créneaux des blocs décochés. Mais un changement
d'ordre ou de flux suffirait à le déclencher. Passer par des identifiants explicites
(`default-work`, `default-sport`…), au plus tard avant les semaines types de
l'onboarding (point 18).

### ✅ 17. Ce qu'il ne faut PAS supprimer

Les **templates multiples** (`templates[]` + `activeTemplateId` sont déjà
supportés) : « semaine d'examens », « semaine de vacances ». Excellent candidat
payant, à garder.

---

## 6. P3 — Ce qui fait qu'une application est aimée

### 〽️ 18. Onboarding : sortir avec une semaine remplie en 90 secondes

C'est là que meurent les planners — sur l'écran vide. L'onboarding fait déjà les
blocs de vie et les rituels ; ajouter trois semaines types prêtes à l'emploi :
**Étudiant / Salarié / Freelance / Parent**, pour couvrir un public large. Une tap,
l'app est vivante, et l'utilisateur voit immédiatement à quoi elle sert.

Prérequis : le point 16 (des identifiants explicites dans les semaines par défaut).

### 〽️ 19. Les notifications sont déjà un point fort — les exploiter

Rituels, début de bloc avec anticipation réglable, fin de pomodoro : c'est déjà mieux
fait que beaucoup d'applications payantes. Ajouter :

- la validation de fin de bloc (point 3) ;
- le résumé hebdomadaire du dimanche soir (« ton bilan de la semaine est prêt ») —
  principal levier de retour dans l'app.

### 〽️ 20. Assumer le ton honnête

L'Evening Wrap est déjà le bon endroit. Toute la catégorie est en encouragement
permanent ; une app qui dit sans ciller « tu as sauté le sport 3 semaines d'affilée »
devient mémorable.

La règle d'écriture : **factuel, jamais moralisateur, toujours une porte de sortie.**

- ✅ « Sport : 0 h sur 3 h prévues cette semaine. Tu veux réduire le créneau ? »
- ❌ « Tu n'as pas tenu ton engagement. »

Le constat vient des chiffres, la suggestion porte sur le plan, jamais sur la
personne. Un plan irréaliste est un problème de plan.

### ✅ 21. Garder ce qui est déjà bien fait

Les `accessibilityLabel` sont présents sur la plupart des contrôles (à compléter), l'undo existe, les haptics, les migrations
versionnées, 83 tests sur la logique. **Ne pas régresser là-dessus en allant vite** —
c'est précisément ce qui fait qu'une application *paraît* chère.

---

## 7. La séquence

Cette feuille de route représente facilement 5 à 6 mois en solo. **Ne pas la faire en
entier.** L'ordre ci-dessous tient compte du développement sans Mac.

| Ordre | Quoi | Pourquoi maintenant |
|---|---|---|
| 1 | **P0 (points 1→5)** | Tant qu'on mesure le planifié au lieu du vécu, Flowday est une app de planning parmi cinquante |
| 2 | **Prérequis de publication (10)** et **TestFlight** | Tester en conditions réelles, auprès de quelques personnes, avant d'aller plus loin |
| 3 | **Import + calendrier (9, 8)** | Enlève les deux motifs d'abandon principaux, et se fait sans Mac |
| 4 | **Semaines types d'onboarding, résumé du dimanche (18, 19)** | Activation et rétention, une fois le bilan en place |
| 5 | **Widget interactif + Live Activity (6, 7)** | Quand il y aura un Mac : ils *servent* alors la mécanique au lieu de la décorer |
| — | **Suppressions P2 (12→16)** | Au fil de l'eau, en continu |

### Le piège à éviter

**Ne pas faire les widgets en premier.** Ce serait passer trois semaines dans du
Swift pour afficher joliment un chiffre qui est actuellement une tautologie. Les
widgets rendent une bonne mécanique visible ; ils ne créent pas la mécanique.

### Ce qu'on ne fait pas

- ❌ Pas d'IA qui planifie, pas de gamification, pas de refonte du design.
- ❌ Pas d'abonnement ni de serveur avant sync + widget + calendrier.
- ❌ Pas d'Android natif (widgets Glance) avant que la version iOS ait trouvé son
  public : Android reste supporté par l'app React Native, sans extensions natives.

---

## 8. Monétisation

### Pas d'abonnement maintenant

Un abonnement implique un coût serveur et une valeur continue qui n'existent pas
encore. Et surtout : la **durabilité des données** est faible (tout en AsyncStorage,
pas de compte, pas de sync, et l'export est une impasse tant que l'import n'existe
pas).

À nuancer : sur iOS, les données de l'app font partie de la **sauvegarde iCloud de
l'appareil**, donc un téléphone perdu et restauré les retrouve. Le vrai trou, c'est
le passage vers un nouvel appareil sans restauration, ou une désinstallation. C'est
ce que l'import (point 9) doit couvrir.

### Un achat unique de déblocage, 5-8 €

C'est le modèle qui marche pour une application locale (Streaks l'a prouvé) : zéro
obligation de synchronisation, support minimal.

**Ce qui peut être payant :** historique de bilan au-delà de ~2 semaines, semaines
types multiples, durées de Focus personnalisées, export du bilan mensuel.

L'achat intégré lui-même (StoreKit, via RevenueCat ou `expo-iap`) demande un dev
build : impossible dans Expo Go, faisable via EAS sans Mac.

**Ce qui ne doit jamais être payant :** le nombre de life blocks ou de tâches. Ça
donne l'impression d'une app cassée, pas d'une app à acheter.

L'abonnement ne devient défendable qu'après sync + widget + calendrier.

### Quatre points pratiques à régler avant de vendre

- ⚠️ **La licence actuelle l'interdit.** Le projet est sous
  [CC BY-NC 4.0](../LICENSE), qui interdit explicitement l'usage commercial. En tant
  que seul auteur, il est possible de relicencier — mais il faut le faire
  consciemment avant toute mise en vente.
- ⚠️ **Compte Apple Developer** : 99 €/an.
- ⚠️ **Obligations fiscales** dès le premier encaissement. À vérifier avant, pas
  après.
- ⚠️ Le `README.md` annonce actuellement « not a commercial product, portfolio
  project ». Il faudra trancher.

---

## 9. Décisions

### Prises

- [x] **Public** : toute personne qui veut piloter sa vie, pas une niche. Le message
      porte sur un problème (« ce que tu prévois vs ce que tu vis »), pas sur un
      profil. Voir section 2.
- [x] **Ton** : honnête et factuel, jamais moralisateur. Voir point 20.

### Recommandées, à confirmer

- [ ] **Validation d'un bloc** : par notification de fin de bloc, à la main depuis le
      planning, et minutes exactes via le Focus. La validation par tâche disparaît.
      (cf. `docs/todo/todo.md`)
- [ ] **Score** : deux axes (Fidélité / Équilibre), une fois `BlockLog` en place.
- [ ] **Plateforme** : iOS d'abord. Android reste supporté par React Native, sans
      widgets natifs pour l'instant.

### Encore ouvertes

- [ ] Est-ce que Flowday reste un projet portfolio, ou devient un produit ? (licence
      CC BY-NC et README à changer si produit)
- [ ] E-mail de support et nom de domaine pour la politique de confidentialité.

---

## 10. Premier pas concret

Le point 1 est le bon premier pas, et il est bien délimité :

1. ajouter le type `BlockLog` et son store, avec la migration dans
   `src/utils/persistence.ts` (les jours passés restent sans `BlockLog` : on
   n'invente pas de données) ;
2. permettre de valider un bloc **à la main** depuis le planning (Fait / En partie /
   Pas fait), et retirer la validation par tâche du score ;
3. remplacer `getWeeklyMinutes` (`app/(tabs)/blocks.tsx`) par une lecture du réel,
   et renommer `timeSpent` / `timeSpentMinutes` pour qu'ils disent la vérité ;
4. ajouter les tests correspondants dans `tests/`.

Puis, dans la foulée : la notification de fin de bloc avec ses trois actions
(point 3), qui écrit dans le même journal.

Tout le reste — bilan hebdo, bilan mensuel, corrélation avec le mood, widget
interactif — se construit sur cette seule donnée.
