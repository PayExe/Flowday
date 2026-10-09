# Flowday — Découpage par version

> Complète [`ROADMAP.md`](ROADMAP.md), qui dit *quoi* et *pourquoi*. Ce document dit
> *dans quelle version*. Mis à jour le 9 octobre 2026.

**Principe : une version = une thèse.** Une version qui mélange trois sujets ne se
raconte pas, ne se teste pas et ne se communique pas.

| Version | Thèse | État |
|---|---|---|
| **0.2.0** | « L'app est belle, et elle mesure ce que tu vis » | ✅ livrée, taguée `v0.2.0` |
| **0.3.0** | « L'app te montre l'écart » | 🟡 en cours (audit des dépendances fait) |
| **0.4.0** | « L'app est publiable et testée par de vraies personnes » | ⚪️ plus tard |
| **0.5.0+** | « L'app est présente hors de l'app » (widgets, calendrier) | ⚪️ quand il y aura un Mac |

---

## 0.2.0 — Refonte UI **et socle du vécu** *(livrée sur `main`, tag `v0.2.0`)*

15 commits, 103 fichiers, +9 108 / −3 745. Refonte visuelle, animations, onboarding
de premier lancement, persistance versionnée, export des données, toast d'undo,
notifications.

**Et surtout, dans le dernier commit (`f815057`), la mécanique centrale du P0 :**

- ✅ `BlockLog` (`src/types/blockLog.ts`), son store et `src/features/blockLogs/lived.ts`
- ✅ `blocks.tsx` lit désormais le **temps vécu** — la tautologie du temps planifié
  affiché comme temps passé est corrigée, et `timeSpentMinutes` est devenu
  `livedMinutes`
- ✅ `blockValidation.ts` supprimé : le score passe par `blockFidelity`, donc un bloc
  sans tâche compte enfin
- ✅ Validation manuelle depuis le planning (`BlockStatusIcon`, `TimelineBlock`,
  `BlockDetailSheet`)
- ✅ 8 tests dans `tests/block-logs.test.ts`

Autrement dit, les points 1, 2 et une partie du 3 du ROADMAP sont **déjà faits**.
La 0.2.0 n'est donc pas « que de l'UI » : elle contient le changement de modèle qui
rend le reste possible.

### État de santé — vérifié le 7 octobre 2026

| Contrôle | Résultat |
|---|---|
| `npm run typecheck` | ✅ propre |
| `npm run lint` | ✅ propre |
| `npm test` | ✅ 86 tests, 17 fichiers |
| `npm audit` | ⚠️ 41 vulnérabilités (1 faible, 13 modérées, 24 hautes, 3 critiques) — **22 depuis l'audit du 8 octobre**, voir 0.3.0 |

### À faire avant de merger sur `main` — fait

Rien de fonctionnel — uniquement de la cohérence. Compter une soirée.

- [x] **Bumper la version.** `package.json` et `app.json` annoncent encore `0.1.0`
      alors que la branche s'appelle `v.0.2.0/UI`. Les deux doivent passer à `0.2.0`
      — `app.json` sert déjà de source à l'affichage de version dans les réglages.
- [x] **`tests/TESTS.md` est périmé.** Il annonce « 28 cas », il y en a **86**. La
      liste détaillée ne couvre plus la moitié de la suite.
- [x] **La liste de fonctionnalités du `README` est périmée.** Elle ne mentionne ni
      l'onboarding, ni les notifications, ni l'export, ni le FR/EN, ni l'undo. Et
      « adding data export and backup » est encore listé dans les améliorations
      *futures* alors que l'export existe.
- [x] **Merger et taguer `v0.2.0`.** Le tag sert de point de retour une fois que la
      0.3.0 commencera à changer le modèle de données.

### Décisions assumées pour cette version

- ⚠️ **Les 41 vulnérabilités ne sont pas bloquantes ici**, et ne justifient pas un
      `npm audit fix --force` qui casserait Expo Router ou Vitest. L'application ne
      fait **aucune requête réseau** (aucun `fetch` dans `src/` ni `app/`) : la
      surface concernée est la chaîne de build, pas les utilisateurs. À reprendre
      sérieusement avant la 0.4.0, pas maintenant.
- ⚠️ **Le journal existe mais n'a qu'un seul chemin d'écriture** : la validation à la
      main depuis le planning. Tant que la notification de fin de bloc n'existe pas,
      il faut ouvrir l'app pour que le vécu soit enregistré. Acceptable pour une
      version intermédiaire, pas pour des utilisateurs réels.
- ⚠️ **Le score est encore à quatre catégories.** `updateBlockValidation` subsiste
      dans `useDayScoreSync`, alimenté par `blockFidelity` au lieu des tâches. La
      simplification à deux axes attend la 0.3.0.

---

## 0.3.0 — « Montrer l'écart »

Le journal du vécu existe depuis la 0.2.0, mais **personne ne le voit** : il alimente
une barre de progression sur l'écran Blocs, et c'est tout. Cette version lui donne
son écran, et les deux chemins d'écriture qui lui manquent.

### Critère de réussite

> Après une semaine d'usage **sans jamais ouvrir l'app pour valider**, voir
> **prévu vs vécu par domaine de vie** sur un écran dédié.

Les deux moitiés comptent : la collecte sans friction, et la restitution.

### Contenu, dans l'ordre des dépendances

1. **La notification de fin de bloc** — trois actions (Fait / En partie / Pas fait),
   l'écriture se fait sans ouvrir l'app. C'est le point le plus structurant : le
   journal n'a aujourd'hui qu'un seul chemin d'écriture, et il exige d'ouvrir l'app.
   *Technique : il n'existe aucune catégorie ni action de notification dans
   `src/features/notifications/` pour l'instant — `setNotificationCategoryAsync` et
   le listener de réponse sont à construire.*
2. **Le Focus crédite un domaine** — `lifeBlockId` sur `FocusSession`
   (`src/types/focus.ts`). Troisième chemin d'écriture, et le plus précis : des
   minutes réellement mesurées au lieu d'être déduites d'un statut.
3. **L'écran Bilan** — le nouvel onglet, qui fait passer l'app de 5 à 6. Semaine et
   mois, prévu vs vécu par domaine. Branche enfin `WeekScore`
   (`src/types/dayScore.ts:18`), aujourd'hui type mort. **C'est l'écran qui justifie
   l'application.**
4. **Le score à deux axes** — Fidélité / Équilibre, en remplacement des quatre
   catégories et de `updateBlockValidation`. *(décision à confirmer, cf. ROADMAP §9)*

### Déjà livré en 0.2.0 — à ne pas refaire

Le socle `BlockLog`, la fin de la validation par tâche et la validation manuelle
depuis le planning sont faits (commit `f815057`). Le « Premier pas concret » du
ROADMAP §10 est donc **terminé**, de même que les points 1 et 2 du P0.

### Nettoyages qui tombent naturellement dans cette version

Parce qu'ils touchent au même code, autant les faire ici :

- ❌ `estimatedMinutes` (`src/types/task.ts:11`) — champ mort, à supprimer ou à
  brancher sur le calcul de capacité.
- ❌ `WeekScore` — cesse d'être mort en étant branché sur l'écran Bilan (point 3).
- 〽️ `isFlexible` — trancher : lui donner un effet réel (décalage automatique quand
  la journée glisse) ou le retirer. Un réglage qui ne fait rien érode la confiance.
- 〽️ `initializeDefaults` (`templates/store.ts:181`) — remplacer les index
  positionnels `lifeBlockIds[0]/[1]/[2]` par des identifiants explicites.
- ✅ ~~Renommer `timeSpent` / `timeSpentMinutes`~~ — fait en 0.2.0 (`livedMinutes`).

### Audit des dépendances — fait le 8 octobre 2026 (branche `v0.3.0/audit`)

`npm audit` : **41 → 22** (0 critique, 3 modérées, 19 hautes), sans `--force`.

- ✅ Expo aligné sur 57.0.27 (`npx expo install --fix`).
- ✅ `vitest` 2 → 5 — retire les 3 critiques et toute la chaîne de dev.
- ✅ `npm audit fix` sans `--force` (`ws` et autres).
- ✅ `overrides` : `uuid@^11.1.1` pour `xcode` — n'appelle que `uuid.v4()`, non
  concerné par la faille, et la 11 garde un build CommonJS.
- ✅ `package-lock.json` régénéré : il ne contenait plus les binaires natifs de
  `rolldown` (bug npm #4828), ce qui cassait `vitest` à chaque installation propre.

Les 22 restantes viennent de trois paquets, tous dans la chaîne Expo / navigation :

| Paquet | Pourquoi ce n'est pas corrigé |
|---|---|
| `braces@3.0.3` | Aucune version corrigée publiée |
| `node-forge@1.4.0` | Aucune version corrigée publiée (sert à la signature des mises à jour Expo) |
| `decode-uri-component@0.2.2` | Le correctif (0.5) est ESM-only ; `query-string@7` le charge en `require` au runtime → l'app casserait |

À revérifier à chaque montée d'Expo. Toujours rien de bloquant : aucune requête réseau
dans l'app.

### Explicitement hors 0.3.0

| Reporté | Vers | Pourquoi |
|---|---|---|
| Import du backup | 0.4.0 | Utile, mais ne sert pas la thèse de la version |
| Prérequis de publication, TestFlight | 0.4.0 | Mieux vaut publier une app qui mesure déjà le réel |
| Sentry, politique de confidentialité | 0.4.0 | Même raison |
| Lecture du calendrier | 0.5.0 | Gros morceau, change la notion de capacité |
| Semaines types d'onboarding | 0.4.0 | Activation — pertinent une fois le bilan en place |
| Résumé du dimanche soir | 0.4.0 | Rétention — a besoin du bilan pour exister |
| Widgets, Live Activity, App Intents | 0.5.0+ | Voir la note sur le Mac ci-dessous |
| Monétisation, sync, compte | — | Pas avant d'avoir des utilisateurs réels |

---

## 0.4.0 — « Publiable »

Tout ce qu'il faut pour mettre l'app entre les mains de quelqu'un d'autre :
`ios.bundleIdentifier` et `android.package`, politique de confidentialité, e-mail de
support, Sentry, import du backup, build EAS et TestFlight. Plus les semaines types
d'onboarding et le résumé du dimanche, qui ont besoin du bilan de la 0.3.0 pour
avoir un sens.

C'est aussi le bon moment pour reprendre `npm audit` sérieusement.

---

## 0.5.0+ — « Présent hors de l'app »

Widgets interactifs, Live Activity, lecture du calendrier, App Intents.

### Sur le Mac — précision utile

**TestFlight ne demande pas de Mac** : EAS Build compile iOS dans le cloud. La 0.4.0
est donc faisable telle quelle.

Les extensions natives (WidgetKit, ActivityKit) peuvent *techniquement* être
construites par EAS aussi, via un config plugin. Mais itérer dessus sans Xcode en
local revient à déboguer à l'aveugle, avec plusieurs minutes par essai. C'est
faisable, c'est juste pénible — d'où le report, pas l'impossibilité.

---

## Règle de découpage, pour les versions suivantes

- Une version = **une phrase** qu'on peut dire à quelqu'un.
- Les nettoyages voyagent avec le code qu'ils touchent, jamais dans une version
  « ménage » dédiée.
- Rien ne part sur `main` sans typecheck, lint et tests verts, et sans que
  `package.json`, `app.json`, `README.md` et `tests/TESTS.md` disent la vérité.
