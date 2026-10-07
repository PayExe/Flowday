import { useLanguageStore, type Language } from '../features/language/store';

type TranslationValue = string | ((params: Record<string, string | number>) => string);

const fr: Record<string, TranslationValue> = {
  'language': 'Langue', 'french': 'Français', 'english': 'English',
};

const en: Record<string, TranslationValue> = {
  'language': 'Language', 'french': 'French', 'english': 'English',
};

fr['scorePerfect'] = 'Journée parfaite';
fr['undo'] = 'Annuler';
fr['scoreGood'] = 'Bonne journée';
fr['scoreOkay'] = 'Journée correcte';
fr['scoreMixed'] = 'Journée mitigée';
fr['scoreDifficult'] = 'Journée difficile';
fr['scoreIncomplete'] = 'Journée à compléter';
fr['blocksKeptCount'] = ({ count }) => `${count} bloc${count === 1 ? '' : 's'} gardé${count === 1 ? '' : 's'}`;
fr['pendingTasksCount'] = ({ count }) => `${count} tâche${count === 1 ? '' : 's'} en attente`;
fr['plannedBlocksCount'] = ({ count }) => `${count} bloc${count === 1 ? '' : 's'} prévu${count === 1 ? '' : 's'}`;
fr['activeBlocksCount'] = ({ count }) => `${count} bloc${count === 1 ? '' : 's'} actif${count === 1 ? '' : 's'}`;
fr['streakCount'] = ({ count }) => `${count} jour${count === 1 ? '' : 's'} consécutif${count === 1 ? '' : 's'}`;
fr['bestStreakCount'] = ({ count }) => `Record : ${count} jour${count === 1 ? '' : 's'}`;
fr['tasksCount'] = ({ count }) => `${count} tâche${count === 1 ? '' : 's'}`;
fr['otherCount'] = ({ count }) => `+${count} autre${count === 1 ? '' : 's'}`;
fr['daySunShort'] = 'D'; fr['dayMonShort'] = 'L'; fr['dayTueShort'] = 'M'; fr['dayWedShort'] = 'M'; fr['dayThuShort'] = 'J'; fr['dayFriShort'] = 'V'; fr['daySatShort'] = 'S';
fr['plannedDuration'] = ({ duration }) => `${duration} planifiées`;
fr['livedOfGoal'] = ({ lived, goal, planned }) => `${lived} vécu sur ${goal} · ${planned} prévu`;
fr['livedOfPlanned'] = ({ lived, planned }) => `${lived} vécu sur ${planned} prévu`;
fr['weekSummary'] = ({ count, duration }) => `${count} créneau${count === 1 ? '' : 'x'} · ${duration}`;
fr['slotsToCreate'] = ({ count }) => `${count} créneaux seront créés.`;
fr['overlapOnDay'] = ({ day, timeRange }) => `${day} : chevauchement avec ${timeRange}`;
fr['copyDayIntro'] = ({ day, count }) => `Copier les ${count} créneaux de ${day} vers :`;
fr['pomodoroProgress'] = ({ done, goal }) => `${done} / ${goal} aujourd’hui`;
fr['blockReminderSoon'] = ({ minutes, timeRange }) => `Dans ${minutes} min · ${timeRange}`;
fr['blockReminderNow'] = ({ timeRange }) => `Ça commence · ${timeRange}`;
fr['breakReady'] = ({ minutes }) => `${minutes} min de pause, tu l’as méritée.`;
fr['focusReady'] = ({ minutes }) => `On repart pour ${minutes} min de focus.`;
fr['blockLeadOption'] = ({ minutes }) => `${minutes} min avant`;
fr['notificationsScheduled'] = ({ count }) => `${count} rappel${count === 1 ? '' : 's'} programmé${count === 1 ? '' : 's'}`;
fr['lateByDays'] = ({ count }) => (Number(count) <= 1 ? 'En retard d’un jour' : `En retard de ${count} jours`);
fr['lateTasksCount'] = ({ count }) => `${count} tâche${count === 1 ? '' : 's'} en retard`;

en['scorePerfect'] = 'Perfect day';
en['undo'] = 'Undo';
en['scoreGood'] = 'Good day';
en['scoreOkay'] = 'Okay day';
en['scoreMixed'] = 'Mixed day';
en['scoreDifficult'] = 'Difficult day';
en['scoreIncomplete'] = 'Day to complete';
en['blocksKeptCount'] = ({ count }) => `${count} block${count === 1 ? '' : 's'} kept`;
en['pendingTasksCount'] = ({ count }) => `${count} pending task${count === 1 ? '' : 's'}`;
en['plannedBlocksCount'] = ({ count }) => `${count} planned block${count === 1 ? '' : 's'}`;
en['activeBlocksCount'] = ({ count }) => `${count} active block${count === 1 ? '' : 's'}`;
en['streakCount'] = ({ count }) => `${count} consecutive day${count === 1 ? '' : 's'}`;
en['bestStreakCount'] = ({ count }) => `Record: ${count} day${count === 1 ? '' : 's'}`;
en['tasksCount'] = ({ count }) => `${count} task${count === 1 ? '' : 's'}`;
en['otherCount'] = ({ count }) => `+${count} other${count === 1 ? '' : 's'}`;
en['daySunShort'] = 'S'; en['dayMonShort'] = 'M'; en['dayTueShort'] = 'T'; en['dayWedShort'] = 'W'; en['dayThuShort'] = 'T'; en['dayFriShort'] = 'F'; en['daySatShort'] = 'S';
en['plannedDuration'] = ({ duration }) => `${duration} planned`;
en['livedOfGoal'] = ({ lived, goal, planned }) => `${lived} lived of ${goal} · ${planned} planned`;
en['livedOfPlanned'] = ({ lived, planned }) => `${lived} lived of ${planned} planned`;
en['weekSummary'] = ({ count, duration }) => `${count} slot${count === 1 ? '' : 's'} · ${duration}`;
en['slotsToCreate'] = ({ count }) => `${count} slots will be created.`;
en['overlapOnDay'] = ({ day, timeRange }) => `${day}: overlaps with ${timeRange}`;
en['copyDayIntro'] = ({ day, count }) => `Copy the ${count} slots from ${day} to:`;
en['pomodoroProgress'] = ({ done, goal }) => `${done} / ${goal} today`;
en['blockReminderSoon'] = ({ minutes, timeRange }) => `In ${minutes} min · ${timeRange}`;
en['blockReminderNow'] = ({ timeRange }) => `Starting now · ${timeRange}`;
en['breakReady'] = ({ minutes }) => `${minutes} min break, you earned it.`;
en['focusReady'] = ({ minutes }) => `Back for ${minutes} min of focus.`;
en['blockLeadOption'] = ({ minutes }) => `${minutes} min before`;
en['notificationsScheduled'] = ({ count }) => `${count} reminder${count === 1 ? '' : 's'} scheduled`;
en['lateByDays'] = ({ count }) => (Number(count) <= 1 ? 'One day late' : `${count} days late`);
en['lateTasksCount'] = ({ count }) => `${count} overdue task${count === 1 ? '' : 's'}`;

const shared: Record<string, TranslationValue> = {
  'Notifications': 'Notifications', 'Rappels des rituels': 'Ritual reminders',
  'Début des blocs': 'Block starts', 'Fin de pomodoro': 'Pomodoro end',
  'Anticipation': 'Lead time', 'À l’heure pile': 'On time',
  'Prends deux minutes pour cadrer ta journée.': 'Take two minutes to frame your day.',
  'Fais le bilan avant de couper.': 'Wrap up before you switch off.',
  'Pomodoro terminé': 'Pomodoro done', 'Pause terminée': 'Break over',
  'Ouvrir les réglages': 'Open settings',
  'Flowday te prévient à l’heure de tes rituels, même app fermée.':
    'Flowday reminds you at your ritual times, even when the app is closed.',
  'Un rappel au début de chaque créneau de ta semaine type.':
    'A reminder at the start of each slot in your weekly template.',
  'Une alerte quand un pomodoro ou une pause se termine.':
    'An alert when a pomodoro or a break ends.',
  'Les rappels suivent les heures définies ci-dessous.': 'Reminders follow the times set below.',
  'Autorise les notifications pour activer les rappels.': 'Allow notifications to enable reminders.',
  'Démarrer un focus': 'Start a focus', 'En pause': 'Paused',
  'Session Focus en cours': 'Focus session running',
  'Ajoute d’abord une tâche à faire aujourd’hui.': 'Add a task for today first.',
  'Hier': 'Yesterday', 'Date': 'Date', 'Plus tard…': 'Later…',
  'Jour précédent': 'Previous day', 'Jour suivant': 'Next day',
  'Revenir à aujourd’hui': 'Back to today', 'Date de la tâche': 'Task date',
  'En retard': 'Overdue', 'Aucune tâche ce jour-là.': 'No task that day.',
  'Replanifie-les depuis Planning.': 'Reschedule them from Planning.',
  'Navigue entre les jours avec les flèches, ou touche la date pour revenir à aujourd’hui.':
    'Move between days with the arrows, or tap the date to come back to today.',
  'Les tâches en retard restent en haut jusqu’à ce que tu les replanifies.':
    'Overdue tasks stay on top until you reschedule them.',
  'Accueil': 'Home', 'Planning': 'Planning', 'Semaine': 'Week', 'Blocs': 'Blocks', 'Réglages': 'Settings', 'Bloc': 'Block', 'Rituels': 'Rituals',
  'Thème': 'Theme', 'Sombre': 'Dark', 'Clair': 'Light', 'Activer': 'Enable', 'Heure': 'Time',
  'Annuler': 'Cancel', 'OK': 'OK', 'Ajouter': 'Add', 'Modifier': 'Edit', 'Supprimer': 'Delete',
  'Restaurer': 'Restore', 'Archiver': 'Archive', 'Créer': 'Create', 'Enregistrer': 'Save', 'Nom': 'Name',
  'Emoji': 'Emoji', 'Icône': 'Icon', 'Couleur': 'Color', 'Objectif hebdomadaire': 'Weekly goal', 'Notes (optionnel)': 'Notes (optional)',
  'Titre (optionnel)': 'Title (optional)', 'Jour': 'Day', 'Horaires': 'Schedule', 'Début': 'Start', 'Fin': 'End',
  'Créneau flexible': 'Flexible slot', 'Life Block': 'Life Block', 'Nouveau bloc': 'New block', 'Modifier le bloc': 'Edit block',
  'Nouveau créneau': 'New time slot', 'Modifier le créneau': 'Edit time slot',
  'Aucun Life Block': 'No Life Block', 'Aucun bloc de vie pour le moment': 'No life blocks yet',
  'Aucun template actif': 'No active template', 'Aucun planning pour le moment': 'No planning yet',
  'Semaine normale': 'Normal week', 'Template': 'Template', 'Tâches': 'Tasks', 'Tâches prioritaires': 'Priority tasks',
  'Nouvelle tâche': 'New task', 'Nouvelle tâche...': 'New task...', 'Titre de la tâche': 'Task title',
  'Sans bloc': 'No block', 'Fait': 'Done', 'À faire': 'To do', 'Terminer': 'Complete',
  'Détail de la tâche': 'Task details', 'État': 'Status', 'Bloc lié': 'Related block',
  'Titre': 'Title', 'Supprimer cette tâche ?': 'Delete this task?', 'Archiver ce bloc ?': 'Archive this block?',
  "sera masqué mais l'historique sera conservé.": 'will be hidden but its history will be kept.',
  'Actions': 'Actions', 'Compris': 'Got it', 'Fermer l’aide': 'Close help', 'Libre': 'Free',
  'Flex': 'Flex', 'Monter': 'Move up', 'Descendre': 'Move down',
  'Commencer la journée': 'Start the day', 'Plus tard': 'Later', 'Retour': 'Back', 'Suivant →': 'Next →',
  'Passer →': 'Skip →', 'Bonne nuit →': 'Good night →', 'Bonne nuit 🌙': 'Good night 🌙',
  'Focus': 'Focus', 'Pause': 'Pause', 'Reprendre': 'Resume', 'Abandonner': 'Abandon',
  'Aucune tâche en cours': 'No task in progress', 'Journée parfaite': 'Perfect day', 'Bonne journée': 'Good day',
  'Journée correcte': 'Okay day', 'Journée mitigée': 'Mixed day', 'Journée difficile': 'Difficult day',
  'Ça arrive': 'It happens', 'Journée à compléter': 'Day to complete', 'Bilan de la journée': 'Day review',
  'Tâches non faites': 'Incomplete tasks', 'Toutes les tâches sont cochées. Bravo !': 'All tasks are checked. Great!',
  'Journée complète !': 'Complete day!', 'Note du jour': 'Daily note', 'Journée validée.': 'Day complete.',
  'Ta note': 'Your note', 'Ignorer les tâches': 'Skip tasks', 'Tâches en attente': 'Pending tasks',
  'Cette semaine': 'This week', 'Demain': 'Tomorrow', 'Performance': 'Performance', 'Streaks': 'Streaks',
  'En ce moment': 'Now', 'Prochain bloc': 'Next block', 'Intention :': 'Intention:', 'objectif': 'goal',
  'Archivés': 'Archived', 'Ajouter une tâche': 'Add a task', 'Ajouter la tâche': 'Add task',
  'Ajouter un bloc de vie': 'Add a life block', 'Aide :': 'Help:',
  'Pas top': 'Not great', 'Bof': 'Meh', 'En forme': 'Good', 'Bonjour.': 'Good morning.', 'Ta journée': 'Your day',
  'Comment tu te sens ?': 'How are you feeling?', "Aucun bloc planifié aujourd'hui": 'No blocks planned today', 'bloc(s) prévu(s)': 'planned block(s)',
  'Pas de tâches en cours': 'No tasks in progress', "Voici ce qui attend aujourd'hui": "Here's what's waiting today", 'Aucune priorité pour le moment.': 'No priorities right now.',
  'Un mot pour cette journée ?': 'One word for today?', 'Focus, Récupération, Sprint...': 'Focus, Recovery, Sprint...', 'Objectif : journée à 80+': 'Goal: an 80+ day',
  'Tes priorités': 'Your priorities', 'Intention': 'Intention', "C'est parti.": "Let's go.", 'Humeur': 'Mood',
  'Priorités': 'Priorities', 'Complète tes blocs, tâches et rituels pour remplir ton score.': 'Complete your blocks, tasks and rituals to fill your score.',
  'Cliquer pour voir les tâches': 'Tap to see tasks', 'autre': 'other', 'planifiées': 'planned', 'actif': 'active',
  'Aujourd’hui': 'Today', 'Format HH:MM (ex: 08:00)': 'Format HH:MM (e.g. 08:00)',
  'Ex: Deep Work, Sport...': 'E.g. Deep Work, Sport...', 'Ex: 5h, 1h30, 90min...': 'E.g. 5h, 1h30, 90min...',
  'Ex: Deep Work, Chest day...': 'E.g. Deep Work, Chest day...', 'Ajouter des notes...': 'Add notes...',
  'Une action irréversible.': 'This action cannot be undone.', 'Cette action est irréversible.': 'This action cannot be undone.',
  'Rituel du matin': 'Morning ritual', 'Bilan du soir': 'Evening wrap',
  'Termine ta journée proprement et prépare la suivante.': 'Finish your day cleanly and prepare for the next one.',
  'Consulte ton score et le détail de ta journée.': 'Review your score and the details of your day.',
  'Décide quoi faire des tâches non terminées : demain, cette semaine ou supprimer.': 'Decide what to do with unfinished tasks: tomorrow, this week, or delete them.',
  'Ajoute une courte note avant de valider ta journée.': 'Add a short note before completing your day.',
  'Personnalise l\'apparence et les rituels automatiques.': 'Customize the appearance and automatic rituals.',
  'Le thème Sombre / Clair change toute l’app instantanément.': 'The Dark / Light theme changes the entire app instantly.',
  'Le Morning Ritual s’ouvre automatiquement dans les 3 h suivant l’heure définie.': 'Morning Ritual opens automatically within 3h of the time you set.',
  'L’Evening Wrap s’ouvre après l’heure que tu définis.': 'Evening Wrap opens after the time you set.',
  'Heure du Morning Ritual': 'Morning Ritual time', 'Heure de l\'Evening Wrap': 'Evening Wrap time',
  '08:00': '08:00', 'Made by PayExe · Built with Expo': 'Made by PayExe · Built with Expo',
  'Le score /100 se compose des blocs (40 %), des tâches (30 %), du focus (20 %) et des rituels (10 %).': 'The /100 score is made of blocks (40%), tasks (30%), focus (20%) and rituals (10%).',
  'Une catégorie sans rien à mesurer ce jour-là ne compte pas : son poids est réparti sur les autres.': 'A category with nothing to measure that day is left out: its weight goes to the others.',
  'Un bloc compte quand tu le valides dans le Planning : Fait, En partie ou Pas fait. Un bloc passé sans réponse compte comme manqué.': 'A block counts when you rate it in Planning: Done, Partly or Not done. A past block left unrated counts as missed.',
  'En partie': 'Partly', 'Pas fait': 'Not done', 'À valider': 'To rate',
  'Comment ça s’est passé ?': 'How did it go?', 'Tu pourras le valider le jour venu.': 'You can rate it when the day comes.',
  'Rien de prévu cette semaine': 'Nothing planned this week',
  'Le temps vécu se remplit quand tu valides tes blocs dans le Planning.': 'Lived time fills in as you rate your blocks in Planning.',
  'Données': 'Data', 'Données Flowday': 'Flowday data', 'Exporter mes données': 'Export my data',
  'Export impossible. Réessaie.': 'Export failed. Try again.',
  'Tes données restent sur ton téléphone. L’export en fait une copie que tu peux garder où tu veux.': 'Your data stays on your phone. Exporting makes a copy you can keep anywhere.',
  'Bienvenue sur Flowday': 'Welcome to Flowday', 'Commencer': 'Get started',
  'Planifie ta semaine, avance bloc par bloc et mesure chaque journée.': 'Plan your week, move block by block and measure every day.',
  'Les grands domaines de ta vie : travail, sport, repos…': 'The big areas of your life: work, sport, rest…',
  'Semaine type': 'Typical week', 'Un planning qui se répète, à ajuster quand tu veux.': 'A schedule that repeats, to adjust whenever you want.',
  'Score du jour': 'Daily score', 'Blocs, tâches, focus et rituels résumés en un chiffre sur 100.': 'Blocks, tasks, focus and rituals summed up in one number out of 100.',
  'Tes blocs de vie': 'Your life blocks', 'Garde ceux qui te parlent. Tu pourras les modifier ou en créer d’autres.': 'Keep the ones that fit you. You can edit them or create more later.',
  'Garde au moins un bloc pour commencer.': 'Keep at least one block to get started.',
  'Tes rituels': 'Your rituals', 'Deux minutes le matin pour lancer la journée, et le soir pour la clôturer.': 'Two minutes in the morning to start the day, and in the evening to wrap it up.',
  'Reste dans le rythme': 'Stay in rhythm', 'Flowday te rappelle tes rituels à l’heure choisie. Rien d’autre, pas de spam.': 'Flowday reminds you of your rituals at the time you pick. Nothing else, no spam.',
  'Tu peux changer ça à tout moment dans les Réglages.': 'You can change this anytime in Settings.', 'Activer les rappels': 'Turn on reminders',
  'Revoir la présentation': 'Replay the introduction',
  'Score': 'Score', 'Tâche supprimée': 'Task deleted', 'Objectif Focus quotidien': 'Daily Focus goal',
  'Diminuer l’objectif Focus': 'Decrease Focus goal', 'Augmenter l’objectif Focus': 'Increase Focus goal',
  'Sessions de 25 min pour un score Focus complet. À 0, le Focus ne compte plus dans le score.': '25-minute sessions for a full Focus score. At 0, Focus no longer counts toward the score.',
  '« En ce moment / Prochain bloc » reflète ton planning actuel.': '“Now / Next block” reflects your current schedule.',
  'Les Streaks comptent tes journées à 60+ points consécutives.': 'Streaks count your consecutive days at 60+ points.',
  'Les tâches prioritaires sont tes 3 tâches en cours les plus importantes.': 'Priority tasks are your 3 most important unfinished tasks.',
  'Le total indique le temps planifié sur toute la semaine.': 'The total shows the planned time for the whole week.',
  'La timeline de ta journée, heure par heure, avec tes tâches et tes blocs.': 'Your day timeline, hour by hour, with tasks and blocks.',
  'Organise ta journée avec une timeline, des tâches et des blocs de vie.': 'Organize your day with a timeline, tasks and life blocks.',
  'Crée d’abord un template dans Semaine et des blocs de vie dans Blocs.': 'First create a template in Week and life blocks in Blocks.',
  'Une fois configuré, ajoute tes tâches et associe-les au bon bloc.': 'Once configured, add your tasks and assign them to the right block.',
  'Ajoute une tâche en haut, puis choisis éventuellement son bloc de vie.': 'Add a task at the top, then optionally choose its life block.',
  'Appuie sur une tâche pour la modifier ou lancer une session Focus.': 'Tap a task to edit it or start a Focus session.',
  'Appuie sur un bloc pour voir ses tâches et valider ce qui est fait.': 'Tap a block to see its tasks and validate what is done.',
  'Appuie sur un bloc pour voir son détail et ses tâches.': 'Tap a block to see its details and tasks.',
  'Ajoute une tâche en haut, puis associe-la à un bloc si besoin.': 'Add a task at the top, then assign it to a block if needed.',
  'Tu dois décider de chaque tâche non faite.': 'You must decide what to do with each incomplete task.',
  'Qu\'est-ce qui s\'est passé aujourd\'hui ?': 'What happened today?', '1-3 phrases max...': '1-3 sentences max...',
  'Supprimer ce bloc ?': 'Delete this block?',
  "L'heure de fin doit être après l'heure de début": 'The end time must be after the start time',
  'Minimum 15 minutes': 'Minimum 15 minutes', 'Erreur': 'Error',
  'Chevauchement avec': 'Overlaps with', 'Chevauchement avec {timeRange}': 'Overlaps with {timeRange}',
  'Démarrer Focus pour': 'Start Focus for',
  'Ajouter un bloc le': 'Add a block on', 'Définis ton template hebdomadaire': 'Define your weekly template',
  'Construis une semaine type qui servira de base à ton planning quotidien.': 'Build a typical week to use as the basis for your daily schedule.',
  'Crée d’abord tes blocs de vie dans l’onglet Blocs.': 'First create your life blocks in the Blocks tab.',
  'Utilise + pour ajouter un créneau à un jour.': 'Use + to add a time slot to a day.',
  'Appuie sur un créneau pour modifier ses horaires ou le supprimer.': 'Tap a time slot to edit its hours or delete it.',
  'Ton planning type, répété chaque semaine.': 'Your typical schedule, repeated every week.',
  'Ajoute des blocs pour chaque jour avec le bouton +.': 'Add blocks for each day with the + button.',
  'Les créneaux apparaissent ensuite dans Planning le jour correspondant.': 'Time slots then appear in Planning on the corresponding day.',
  'Evening Wrap': 'Evening Wrap', 'Morning Ritual': 'Morning Ritual',
  'Ton tableau de bord du jour : score, prochain bloc, séries et tâches prioritaires.': 'Your daily dashboard: score, next block, streaks and priority tasks.',
  'Morning Ritual · 5 étapes': 'Morning Ritual · 5 steps',
  'dimanche': 'Sunday', 'lundi': 'Monday', 'mardi': 'Tuesday', 'mercredi': 'Wednesday', 'jeudi': 'Thursday', 'vendredi': 'Friday', 'samedi': 'Saturday',
  'janvier': 'January', 'février': 'February', 'mars': 'March', 'avril': 'April', 'mai': 'May', 'juin': 'June', 'juillet': 'July', 'août': 'August', 'septembre': 'September', 'octobre': 'October', 'novembre': 'November', 'décembre': 'December',
  'h': 'h', 'min': 'min', '/ semaine': '/ week', '...': '...',
  '/100': '/100',
  'Prépare ta journée en quelques étapes avant de commencer.': 'Prepare your day in a few steps before you begin.',
  'Indique ton humeur pour adapter ton point de départ.': 'Share your mood to adapt your starting point.',
  'Consulte tes blocs et tes priorités du jour.': 'Review your blocks and priorities for the day.',
  'Ajoute une intention pour garder un cap simple aujourd’hui.': 'Add an intention to keep a simple direction today.',
  'Travaille sur une seule tâche pendant une session de 25 minutes, puis prends une pause.': 'Work on one task for a 25-minute session, then take a break.',
  'Le minuteur démarre sur une tâche, depuis Aujourd’hui ou Planning.':
    'The timer starts on a task, from Today or Planning.',
  'Mets la session en pause ou reprends-la à tout moment.': 'Pause or resume the session at any time.',
  'Abandonner arrête la session sans la comptabiliser comme terminée.': 'Abandoning stops the session without counting it as completed.',
  'Blocs de vie': 'Life blocks',
  'Tes grands domaines de vie (travail, sport, santé…) et leur objectif hebdomadaire.': 'Your main areas of life (work, sport, health…) and their weekly goal.',
  'La barre montre ton temps planifié cette semaine par rapport à l’objectif.': 'The bar shows your planned time this week against your goal.',
  'Appuie sur un bloc pour le modifier ou l’archiver.': 'Tap a block to edit or archive it.',
  'Utilise les flèches ↑ ↓ pour réordonner les blocs.': 'Use the ↑ ↓ arrows to reorder blocks.',
  'Fermer': 'Close', 'Aide': 'Help', 'Auto': 'Auto', 'Apparence': 'Appearance', 'Passer': 'Skip', 'Suivant': 'Next',
  'Priorité': 'Priority', 'Basse': 'Low', 'Moyenne': 'Medium', 'Haute': 'High', 'Terminée': 'Completed',
  'Démarrer une session Focus': 'Start a Focus session', 'Supprimer la tâche': 'Delete task',
  'Aucune tâche dans ce bloc.': 'No tasks in this block.', 'Aucune tâche pour aujourd’hui.': 'No tasks for today.',
  'Autre emoji': 'Other emoji', 'Créer un bloc de vie': 'Create a life block', 'Préparer ma semaine': 'Set up my week',
  'Ajouter un créneau': 'Add a time slot', 'Terminer la journée': 'Finish the day',
  'Utilise + pour ajouter une tâche et l’associer à un bloc.': 'Use + to add a task and assign it to a block.',
  'Ajoute ensuite des créneaux à chaque jour.': 'Then add time slots to each day.',
  'Ajoute des créneaux à chaque jour avec « Ajouter un créneau ».': 'Add time slots to each day with “Add a time slot”.',
  'Le bouton ••• permet de réordonner ou d’archiver un bloc.': 'The ••• button lets you reorder or archive a block.',
  'Le thème Auto suit l’apparence de ton iPhone.': 'The Auto theme follows your iPhone’s appearance.',
  'Lundi': 'Monday', 'Mardi': 'Tuesday', 'Mercredi': 'Wednesday', 'Jeudi': 'Thursday',
  'Vendredi': 'Friday', 'Samedi': 'Saturday', 'Dimanche': 'Sunday',
  'Jours': 'Days', 'Jours de semaine': 'Weekdays', 'Week-end': 'Weekend', 'Tous les jours': 'Every day',
  'Choisis au moins un jour': 'Pick at least one day',
  'Journée libre': 'Free day', 'Aucun créneau planifié ce jour-là.': 'No slot planned that day.',
  'Copier ce jour vers…': 'Copy this day to…', 'Copier ce jour': 'Copy this day', 'Copier': 'Copy',
  'Vider la journée': 'Clear the day', 'Vider cette journée ?': 'Clear this day?', 'Vider': 'Clear',
  'Tous les créneaux de ce jour seront supprimés.': 'Every slot on this day will be deleted.',
  'Les créneaux déjà présents sur les jours choisis seront remplacés.': 'Slots already on the chosen days will be replaced.',
  'Choisis un jour en haut, puis ajoute ses créneaux.': 'Pick a day at the top, then add its slots.',
  'Un créneau peut être créé sur plusieurs jours à la fois.': 'A slot can be created on several days at once.',
  'Le menu ••• copie la journée vers d’autres jours ou la vide.': 'The ••• menu copies the day to other days or clears it.',
};

Object.assign(fr, Object.fromEntries(Object.keys(shared).map((key) => [key, key])));
Object.assign(en, shared);

export function translate(key: string, language: Language, params: Record<string, string | number> = {}): string {
  const value = (language === 'fr' ? fr : en)[key] ?? key;
  return typeof value === 'function' ? value(params) : value.replace(/\{(\w+)\}/g, (_, name) => String(params[name] ?? `{${name}}`));
}

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);
  const t = (key: string, params?: Record<string, string | number>) => translate(key, language, params);
  const plural = (count: number, one: string, many: string, params: Record<string, string | number> = {}) =>
    t(count === 1 ? one : many, { ...params, count });
  return { language, t, plural };
}
