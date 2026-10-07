# Tests

Lancer les tests avec :

```bash
npm test
```

La suite couvre actuellement 28 cas :

- calcul et limite du score à 100 ;
- enregistrement d’un Pomodoro dans le score ;
- ajout, validation et filtrage des tâches ;
- sauvegarde des tâches ;
- calcul des séries ;
- transition focus → pause → focus ;
- pause et reprise du timer ;
- rattrapage du timer après un passage en arrière-plan ;
- refus d’un second démarrage Focus et remise à zéro au changement de jour ;
- report du Morning Ritual avec « Plus tard » ;
- mise à jour du score après validation d’une tâche ;
- rejet des objectifs négatifs, horaires invalides et identifiants inconnus ;
- gestion des dates locales et changements de mois ;
- journal du vécu : minutes déduites du statut, fidélité des blocs sans tâche, créneaux à venir ignorés ;
- migrations des données locales (ordre des étapes, échec sans perte, anciennes données non versionnées).

Le typecheck se lance avec :

```bash
npm run typecheck
```

Les tests sont séparés par fonctionnalité :

```text
tests/
├── focus-action.test.ts
├── dates.test.ts
├── life-blocks.test.ts
├── pomodoro.test.ts
├── rituals.test.ts
├── score.test.ts
├── streaks.test.ts
├── tasks.test.ts
└── templates.test.ts
```
