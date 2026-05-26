# GUIDE OFFLINE — Travailler sans internet

> Complément au GUIDE_COMPLET.md. Tout ce qu'il faut savoir pour bosser
> sur Flowday hors connexion + utiliser Zeal pour la doc.

---

## 1 — Expo en mode offline

### Comment ça marche ?

Quand tu fais `npx expo start`, Expo lance :
1. Un **serveur de dev local** sur ton PC (port 8081)
2. Un **bundler Metro** qui compile ton code JS/TS en un bundle
3. Une connexion entre l'app Expo Go sur ton téléphone et ce serveur

**Le bundle et les dépendances sont déjà sur ton PC** (dans `node_modules/`).
Tant que le code ne change pas de dépendance, **zéro internet requis**.

### Préparer son PC avant de partir

```bash
# 1. Installer TOUTES les dépendances (à faire avec internet)
npm install

# 2. Lancer une première fois pour vérifier que tout compile
npx expo start

# 3. Optionnel : pré-générer le bundle (vérifie qu'il n'y a pas d'erreur)
npx expo export --platform ios
```

Une fois fait, tu peux couper le WiFi.

### Lancer Expo en mode offline

```bash
# Mode offline (ne cherche pas de mises à jour OTA)
npx expo start --offline

# Tu verras un QR code. Scanne-le avec Expo Go.
```

### Connecter le téléphone SANS internet

**Option A — Câble USB (Android seulement)**
```bash
# Branche le tel en USB
# Active le débogage USB sur le tel
npx expo start --localhost
# Sur le tel, dans Expo Go, tape l'URL affichée
```

**Option B — Point d'accès téléphone (iOS et Android)**
```
Téléphone → Réglages → Point d'accès → Activer
PC → Se connecter au WiFi du téléphone
npx expo start --offline
```

Le PC et le téléphone communiquent en local via le hotspot, pas besoin d'internet.
Les données mobiles ne sont pas consommées (le traffic reste local).

**Option C — Même réseau WiFi sans internet (ex: WiFi du train)**
```
PC et téléphone connectés au même WiFi (même sans internet)
npx expo start --offline
```

### Commandes utiles en mode offline

```bash
npx expo start --offline     # Mode hors-ligne
npx expo start --localhost   # Forcer localhost (pas le réseau)
npx expo export --platform ios  # Vérifier que le bundle compile
```

### Ce qui ne marche PAS sans internet

- `npx expo install xxx` — installer un nouveau package
- `npx expo update` — mises à jour OTA
- Les exports EAS Build (compilation cloud)
- `npm install` (sauf si le package est en cache)

### Ce qui marche PARFAITEMENT sans internet

- `npx expo start --offline` — le serveur de dev
- Toute modification de code (hot reload)
- `npx expo export` — génération du bundle local
- Tout le state management Zustand (local)
- AsyncStorage (stockage local)
- Les assets (images, icônes) déjà dans le projet

---

## 2 — ZEAL : La doc hors-ligne ultime

### C'est quoi ?

**Zeal** (https://zealdocs.org) est un navigateur de documentation offline.
C'est comme Dash sur Mac, mais gratuit et open-source. Il télécharge des
"docsets" (packs de documentation) et te permet de les consulter sans internet.

### Pourquoi c'est parfait pour toi

Avec les bons docsets installés, tu as TOUTE la doc de React Native, React,
TypeScript, Zustand... consultable en un raccourci clavier, sans connexion.

### Installation

```powershell
# Télécharger l'installateur sur https://zealdocs.org
# OU avec winget :
winget install Zeal.Zeal
```

### Docsets à installer (dans Zeal : Tools > Docsets > Available)

| Docset à chercher | Contient | Priorité |
|---|---|---|
| `React_Native` | Doc React Native complète (composants, APIs) | **OBLIGATOIRE** |
| `React` | Doc React (hooks, composants, JSX) | **OBLIGATOIRE** |
| `TypeScript` | Doc TS (types, interfaces, generics) | Recommandé |
| `JavaScript` | Doc MDN JavaScript (bases du langage) | Recommandé |
| `Expo` | Doc Expo (pas toujours dispo, cherche) | Si trouvé |
| `CSS` | Référence CSS (pour comprendre flexbox) | Utile |
| `NodeJS` | Doc Node.js | Accessoire |

### Comment chercher dans Zeal

1. Ouvre Zeal (raccourci Windows : `Alt+Espace` par défaut)
2. Tape le nom du docset puis `:` puis le terme (ex: `React:useEffect`)
3. Ou tape directement et Zeal cherche dans tous les docsets

**Truc de pro** : Configure un raccourci clavier (Zeal > Preferences > Hotkey)
genre `Ctrl+Shift+Space` pour ouvrir Zeal instantanément.

### Limites de Zeal

- Pas de vidéos (évidemment)
- Pas de contenu interactif (Snack Expo, CodeSandbox)
- Certains docsets sont moins à jour que le site web
- Les docs Expo n'ont pas toujours un docset officiel

### Alternative : DevDocs

Si Zeal ne te plaît pas, il y a **DevDocs** (https://devdocs.io) — c'est un
équivalent en version web, mais il faut l'avoir chargé avant de couper internet
(il garde en cache les docs que tu as déjà consultées). Moins fiable en offline
que Zeal.

---

## 3 — Ta trousse de survie offline

Avant de monter dans le train, vérifie que tu as :

| Ressource | Où ? | Format |
|---|---|---|
| `GUIDE_COMPLET.md` | Racine du projet | Markdown (VS Code) |
| `GUIDE_OFFLINE.md` (ce fichier) | Racine du projet | Markdown (VS Code) |
| `AGENTS.md` | Racine du projet | Architecture + règles |
| Doc React Native | Zeal (docset `React_Native`) | Navigateur doc |
| Doc React | Zeal (docset `React`) | Navigateur doc |
| Doc TypeScript | Zeal (docset `TypeScript`) | Navigateur doc |
| Projet Flowday | `node_modules/` installé | Code source |
| `npx expo export` OK | Bundle vérifié avant départ | Pré-vérifié |

---

## 4 — Astuces pour bosser offline efficacement

### Le cycle de travail idéal

```
1. Ouvre GUIDE_COMPLET.md (Section 8 : task list)
2. Choisis UN fichier à corriger
3. Ouvre ce fichier dans VS Code
4. Quand tu vois fontSize, cherche le token dans le tableau de conversion
5. Corrige la ligne
6. Sauvegarde (Ctrl+S) → Expo recharge automatiquement le téléphone
7. Vérifie visuellement que c'est bon
8. Passe à la ligne suivante
```

### Si tu bloques sur un composant

1. Dans Zeal, tape `React_ Native:View` ou `React_Native:Text` pour voir la doc
2. Regarde comment les composants similaires sont écrits (`Button.tsx` est le modèle parfait)
3. Relis la Section 7 du GUIDE_COMPLET.md

### Si Expo Go refuse de se connecter

```bash
# 1. Tuer tout
# Ctrl+C dans le terminal

# 2. Vider le cache Metro
npx expo start --offline --clear

# 3. Si toujours pas : redémarrer Expo Go sur le téléphone
```

### Gérer les erreurs courantes

| Erreur | Cause probable | Solution |
|---|---|---|
| "Cannot read property 'headline' of undefined" | `typography` pas extrait de `useTheme()` | Vérifier `const { colors, typography } = useTheme()` |
| "StyleSheet key undefined" | Référence à une clé inexistante | Comme `planning.tsx:255` — corriger la référence |
| Fond noir/blanc cassé | Couleur en dur dans le code | Chercher `#` ou `'#` dans le fichier |
| Bundle failed | Erreur TypeScript ou import cassé | Lire le message d'erreur exact |

---

## 5 — Exemple concret : ta première session offline

```
08h00 - Train parti, WiFi coupé
08h01 - Ctrl+J dans VS Code → Terminal : npx expo start --offline
08h02 - QR code affiché, téléphone scanné, app visible
08h03 - Ouverture de GUIDE_COMPLET.md, Phase 1, Fichier 1 : week.tsx
08h04 - Ajout de `typography` à la ligne 27
08h05 - Ctrl+S → L'écran Semaine s'affiche (plus de crash)
08h06 - Remplacement du fontSize ligne 238
08h08 - Remplacement du fontSize ligne 252
08h10 - Premier fichier terminé, test visuel OK
08h11 - Passage au fichier suivant : blocks.tsx
```

1 fichier = ~5-10 minutes. En 1h30 de train t'as fait toute la Phase 1, 2 et 3.

---

**Résumé** : Zeal = ta doc. `npx expo start --offline` = ton serveur. Le GUIDE_COMPLET.md = ton GPS. Ton téléphone = ton écran de test. Tu as tout ce qu'il faut.
