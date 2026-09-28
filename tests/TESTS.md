# Tests

Lancer les tests avec :

```bash
npm test
```

La suite couvre 9 cas :

- calcul et limite du score à 100 ;
- enregistrement d’un Pomodoro dans le score ;
- ajout, validation et filtrage des tâches ;
- sauvegarde des tâches ;
- calcul des séries ;
- transition focus → pause → focus ;
- pause et reprise du timer ;
- gestion des dates locales et changements de mois.

Le typecheck se lance avec :

```bash
npm run typecheck
```

Les tests sont séparés par fonctionnalité :

```text
tests/
├── dates.test.ts
├── score.test.ts
├── tasks.test.ts
├── streaks.test.ts
└── pomodoro.test.ts
```
