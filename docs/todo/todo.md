### À corriger en priorité

✅ / ❌ / 〽️​

✅ 1. Fiabiliser le timer Pomodoro  
- Empêcher plusieurs sessions simultanées.✅
- Corriger le timer quand l’application passe en arrière-plan.✅
- Ne compter que le vrai temps de concentration, pas les pauses.✅

〽️ 2. Corriger le bouton « Plus tard »
- Le bouton navigue bien vers l’accueil, mais l’état `skippedForToday` reste à ajouter pour éviter la réouverture automatique. 〽️
- Ajoute un état du type skippedForToday. 〽️​

〽️ 3. Corriger la synchronisation du score 
- Le score des tâches se met maintenant à jour lorsqu’une tâche est cochée ou décochée. ✅
- Vérifier encore les scores affichés avec d’anciennes données sur tous les écrans. 〽️

〽️ 4. Corriger les dates et changements de jour 
- La gestion utilise maintenant la date locale de manière cohérente. ✅
- Vérifier encore les cas autour de minuit. 〽️
- Les compteurs quotidiens sont réinitialisés au démarrage d’un nouveau jour. ✅

✅ 5. Améliorer les tests Ajoute quelques tests pour :
- le timer en pause et reprise ; ✅
- le passage en arrière-plan ; ✅
- plusieurs démarrages de focus ; ✅
- le bouton « Plus tard » ; ✅
- le changement de jour ; ✅
- la mise à jour du score après modification d’une tâche. ✅






✅ À faire rapidement aussi
- Corriger tests/TESTS.md : il indique maintenant 28 tests. ✅
- Ajouter une section Known limitations dans le README. ✅
- Vérifier les vulnérabilités avec npm audit, sans utiliser --force aveuglément. 〽️
  22 vulnérabilités restent à traiter, dont certaines nécessitent des mises à jour majeures.
- Ajouter quelques accessibilityLabel et accessibilityRole aux boutons avec icônes. ✅
- Valider les valeurs dans les stores : objectifs négatifs, horaires invalides, identifiants inexistants. ✅
