### À corriger en priorité

✅ / ❌ / 〽️​

✅ 1. Fiabiliser le timer Pomodoro  
- Empêcher plusieurs sessions simultanées.✅
- Corriger le timer quand l’application passe en arrière-plan.✅
- Ne compter que le vrai temps de concentration, pas les pauses.✅

✅ 2. Corriger le bouton « Plus tard »
- Le bouton navigue vers l’accueil et l’état `skippedForToday` empêche la réouverture automatique pour la journée. ✅
- Ajouter un état du type `skippedForToday`. ✅

✅ 3. Corriger la synchronisation du score 
- Le score des tâches se met maintenant à jour lorsqu’une tâche est cochée ou décochée. ✅
- Les scores affichés sont normalisés avec les anciennes données sur tous les écrans. ✅

✅ 4. Corriger les dates et changements de jour 
- La gestion utilise maintenant la date locale de manière cohérente. ✅
- Les cas autour de minuit et des changements d’heure sont couverts. ✅
- Les compteurs quotidiens sont réinitialisés au démarrage d’un nouveau jour. ✅

✅ 5. Améliorer les tests Ajoute quelques tests pour :
- le timer en pause et reprise ; ✅
- le passage en arrière-plan ; ✅
- plusieurs démarrages de focus ; ✅
- le bouton « Plus tard » ; ✅
- le changement de jour ; ✅
- la mise à jour du score après modification d’une tâche. ✅


✅ -  Uniformiser la langue de l’application
✅ -  Ajouter l’état skippedForToday au Morning Ritual
✅ -  Décider comment un Life Block est validé (à la main dans le Planning : Fait / En partie / Pas fait ; notification de fin de bloc à venir)
〽️ -  Ajouter les labels d’accessibilité manquants
〽️ -  Ajouter quelques tests UI ou d’intégration
✅ -  Ajouter une stratégie de migration des données locales (`src/utils/persistence.ts`)
〽️ -  Ajouter les informations de contact au README


✅ À faire rapidement aussi
- Corriger tests/TESTS.md : il indique maintenant 28 tests. ✅
- Ajouter une section Known limitations dans le README. ✅
- Vérifier les vulnérabilités avec npm audit, sans utiliser --force aveuglément. ✅
  Audit du 8 octobre 2026 : 42 → 23, plus aucune critique. Les 3 failles d'origine
  restantes sont sans correctif compatible, voir `docs/RELEASES.md`.
- Ajouter quelques accessibilityLabel et accessibilityRole aux boutons avec icônes. ✅
- Valider les valeurs dans les stores : objectifs négatifs, horaires invalides, identifiants inexistants. ✅
