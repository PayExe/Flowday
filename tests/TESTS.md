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

La suite couvre actuellement **103 cas** répartis sur 18 fichiers, un par domaine
fonctionnel.

| Fichier | Cas | Ce qui est couvert |
|---|---:|---|
| `notification-schedule.test.ts` | 15 | Planification des rappels : rituels, début et fin des blocs, anticipation, priorité des fins de bloc dans le budget iOS |
| `block-logs.test.ts` | 12 | Journal du vécu : minutes déduites du statut, minutes du Focus par domaine sans double comptage, fidélité des blocs sans tâche, créneaux à venir ignorés, écriture dans le store |
| `score.test.ts` | 9 | Calcul du score, limite à 100, parts sans rien à mesurer dont le poids est réparti |
| `day-navigation.test.ts` | 9 | Clés de date, tâches par jour, navigation entre les journées |
| `tasks.test.ts` | 7 | Ajout, validation, filtrage, replanification, et undo après suppression |
| `pomodoro.test.ts` | 8 | Transitions focus → pause → focus, pause et reprise, rattrapage après arrière-plan, domaine repris de la tâche, secondes de focus par jour |
| `ritual-schedule.test.ts` | 6 | Ouverture automatique des rituels, report avec « Plus tard » |
| `block-end-notification.test.ts` | 5 | Réponses à la notification de fin de bloc : statut écrit au journal, date du bloc, contenus invalides ignorés |
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
