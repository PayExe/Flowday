# Tests

Lancer les tests avec :

```bash
npm test
```

Le typecheck se lance avec :

```bash
npm run typecheck
```

## Couverture

La suite couvre actuellement **86 cas** répartis sur 17 fichiers, un par domaine
fonctionnel.

| Fichier | Cas | Ce qui est couvert |
|---|---:|---|
| `block-logs.test.ts` | 8 | Journal du vécu : minutes déduites du statut, fidélité des blocs sans tâche, créneaux à venir ignorés, écriture dans le store |
| `score.test.ts` | 9 | Calcul du score, limite à 100, parts sans rien à mesurer dont le poids est réparti |
| `day-navigation.test.ts` | 9 | Clés de date, tâches par jour, navigation entre les journées |
| `notification-schedule.test.ts` | 9 | Planification des rappels : rituels, début des blocs, anticipation |
| `tasks.test.ts` | 7 | Ajout, validation, filtrage, replanification, et undo après suppression |
| `pomodoro.test.ts` | 6 | Transitions focus → pause → focus, pause et reprise, rattrapage après arrière-plan |
| `ritual-schedule.test.ts` | 6 | Ouverture automatique des rituels, report avec « Plus tard » |
| `persistence.test.ts` | 5 | Migrations locales : ordre des étapes, échec sans perte, données non versionnées |
| `rituals.test.ts` | 5 | Enregistrement du Morning Ritual et de l'Evening Wrap |
| `templates.test.ts` | 5 | Semaine type : créneaux, chevauchements, copie d'un jour |
| `focus-action.test.ts` | 4 | Refus d'un second démarrage, remise à zéro au changement de jour |
| `dates.test.ts` | 3 | Dates locales, changements de mois, passage de minuit |
| `life-blocks.test.ts` | 3 | Blocs de vie et noms des blocs de départ selon la langue |
| `onboarding.test.ts` | 3 | Premier lancement et détection des utilisateurs existants |
| `i18n.test.ts` | 2 | Complétude des traductions FR/EN |
| `backup.test.ts` | 1 | Export JSON des données locales |
| `streaks.test.ts` | 1 | Calcul des séries |

## Portée

Les tests portent sur les **stores et la logique métier**. Le rendu des composants,
les interactions tactiles et l'accessibilité ne sont pas couverts automatiquement :
ils sont vérifiés à la main sur appareil.

Les validations d'entrée sont testées avec les cas limites attendus — objectifs
négatifs, horaires invalides, identifiants inconnus.
