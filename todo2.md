# FLOWDAY — Direction Artistique V2

> Guide pour Kimi K2.6 · iOS & Android · React Native
> Thème : **Obsidian & Cyan** — Developer Dark

---

## Identité

**Inspirations :** VS Code Dark+ · Warp Terminal · GitHub Dark · Linear (avec une âme dev)

Ce n'est pas un thème Apple classique. C'est un thème **outil de développeur** : sombre, structuré, avec des accents cyan électriques qui rappellent le terminal et les IDE modernes. Chaque élément doit donner l'impression d'être dans un environnement de code propre et puissant.

---

## Palette — immuable

```
Fond principal      #0D1117    ← GitHub dark bg, pas #000
Fond surface        #161B22    ← cartes, sections
Fond inputs/focus   #21262D    ← hover, inputs actifs
Fond hover          #1C2128    ← état pressed léger
Séparateurs         #30363D    ← hairline technique

Texte primaire      #E6EDF3    ← blanc cassé bleuté
Texte secondaire    #8B949E    ← gris bleuté dev
Texte tertiaire     #484F58    ← quasi invisible

Accent cyan         #22D3EE    ← CTA primaire, FAB, focus
Accent cyan subtle  #22D3EE15  ← fond de badge cyan
Accent violet       #A371F7    ← timer actif, feature highlight
Accent vert         #3FB950    ← tâche complète, succès
Accent rouge        #F85149    ← destructive, priorité haute
Accent jaune        #D29922    ← priorité moyenne, warning
```

**Règles :**
- L'accent cyan est roi. Jamais plus d'un accent par écran, sauf si c'est un état (succès/erreur).
- Pas de dégradés. Pas d'ombres colorées.
- Les bordures sont toujours `#30363D`, jamais plus foncées.

---

## Typographie

SF Pro — font système iOS/Android. Pas de font externe.

```
Titre écran        32px  700  tracking -0.5    ex: "Aujourd'hui"
Section label      11px  600  tracking +1.5    uppercase  ex: "EN COURS"
Corps tâche        15px  400  tracking 0       ex: titre d'une tâche
Métadonnée         13px  400  tracking 0       ex: "14:00 · 25 min"
Caption            11px  400  tracking 0       ex: date relative
```

**Règle :** aucune taille entre ces valeurs.

---

## Layout & Spacing

Grille de 4. Multiples de 4 uniquement.

```
xs   4    séparation interne
sm   8    padding icon
md   12   gap entre éléments d'un item
base 16   padding horizontal écran (sacred)
lg   20   padding vertical section
xl   24   gap entre sections
2xl  32   espace vide intentionnel
```

**Padding horizontal de l'écran : toujours 16.**

---

## Rayons (Radius)

```
sm   6    badges, petits éléments
md   10   inputs, boutons secondaires
lg   14   cartes, modales
xl   20   dialogs, sheets
full 9999 chips, avatars, checkbox
```

**Règle :** jamais de border-radius < 6 sur un élément interactif.

---

## Composants — patterns & style

### Règle générale

Tous les composants utilisent le theme centralisé (`src/theme/index.ts`).
Pas de couleurs en dur. Pas de StyleSheet avec des valeurs magiques.

---

### Separator

```tsx
<Divider />
// ou
<View style={{ height: 1, backgroundColor: Colors.border }} />
```

Couleur : `#30363D`. Utilisé entre sections et entre items de liste.
Pour les listes d'items : le séparateur est indenté (marginLeft aligné sous le texte).

---

### Button

```tsx
// CTA principal — cyan sur fond sombre
<Button style={{ backgroundColor: Colors.accentCyan, borderRadius: Radius.md, height: 48 }}>
  <Text style={{ color: Colors.bgPrimary, fontSize: 15, fontWeight: '600' }}>Ajouter</Text>
</Button>

// Action secondaire — fond surface
<Button style={{ backgroundColor: Colors.bgSurface, borderRadius: Radius.md, height: 40 }}>
  <Text style={{ color: Colors.textSecondary, fontSize: 15 }}>Annuler</Text>
</Button>

// Destructive — fond rouge très subtil
<Button style={{ backgroundColor: Colors.accentRed + '15', borderRadius: Radius.md }}>
  <Text style={{ color: Colors.accentRed, fontSize: 15 }}>Supprimer</Text>
</Button>
```

**Jamais de `border` sur un bouton. Jamais de `shadow`.**

---

### Checkbox

```tsx
<TouchableOpacity
  style={{
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: task.completed ? Colors.accentCyan : Colors.textTertiary,
    backgroundColor: task.completed ? Colors.accentCyan : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  {task.completed && <Ionicons name="checkmark" size={14} color={Colors.bgPrimary} />}
</TouchableOpacity>
```

**Carré arrondi (radius 6), pas cercle.** Style GitHub issue / task list.

---

### Progress

```tsx
<View style={{ height: 4, backgroundColor: Colors.bgInput, borderRadius: 2, overflow: 'hidden' }}>
  <View style={{ width: `${percent}%`, height: '100%', backgroundColor: project.color || Colors.accentCyan }} />
</View>
```

Barre fine (4px), fond `#21262D`, indicateur = couleur du projet ou cyan par défaut.

---

### Card (tâche, projet)

```tsx
<View style={{
  backgroundColor: Colors.bgSurface,
  borderRadius: Radius.lg,
  padding: Spacing.lg,
  marginBottom: Spacing.md,
  borderWidth: 1,
  borderColor: Colors.border,
}}>
  {/* contenu */}
</View>
```

**Toujours une bordure `#30363D` de 1px.** C'est ce qui donne le rendu "panel IDE".

---

### Input

```tsx
<TextInput
  style={{
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
  }}
  placeholderTextColor={Colors.textTertiary}
/>
```

Fond `#21262D`, pas de border. Placeholder en `#484F58`.

---

### FAB (bouton flottant)

```tsx
<Pressable
  style={{
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: Colors.accentCyan,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Ionicons name="add" size={28} color={Colors.bgPrimary} />
</Pressable>
```

**Cyan. Carré arrondi (radius 16), pas cercle.** Style bouton d'action IDE.

---

### Badge / Chip

```tsx
// Badge priorité
<View style={{
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
  backgroundColor: color + '18',
  gap: 4,
}}>
  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
  <Text style={{ color, fontSize: 12, fontWeight: '600' }}>{label}</Text>
</View>
```

Fond = couleur à 10% d'opacité. Texte = couleur pleine.

---

### Empty state

```tsx
<View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingBottom: 80 }}>
  <Ionicons name="code-slash-outline" size={48} color={Colors.textTertiary} />
  <Text style={{ color: Colors.textPrimary, fontSize: 17, fontWeight: '600' }}>Tout est clean.</Text>
  <Text style={{ color: Colors.textSecondary, fontSize: 15, textAlign: 'center', paddingHorizontal: 32 }}>
    Ajoute une tâche pour commencer ta session.
  </Text>
</View>
```

Icône outline en `#484F58`, pas d'emoji.

---

## Patterns récurrents

### Section header

```tsx
<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, marginBottom: 8, marginTop: 24 }}>
  <Text style={{ fontSize: 11, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1.5 }}>
    En cours
  </Text>
  <Text style={{ fontSize: 13, color: Colors.textSecondary }}>3</Text>
</View>
```

### Item de liste (tâche)

```tsx
<Pressable
  style={({ pressed }) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: pressed ? Colors.bgHover : 'transparent',
  })}
>
  {/* checkbox + texte */}
</Pressable>
<View style={{ height: 1, backgroundColor: Colors.border, marginLeft: 50 }} />
```

**Le séparateur est indenté.** `marginLeft` aligné sous le titre (pas sous la checkbox).

---

## Navigation (Tab Bar)

```tsx
<Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors.accentCyan,
    tabBarInactiveTintColor: Colors.textSecondary,
    tabBarStyle: {
      backgroundColor: Colors.bgPrimary,
      borderTopWidth: 1,
      borderTopColor: Colors.border,
      height: 84,
      paddingBottom: 28,
      paddingTop: 12,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '500',
    },
  }}
>
```

Fond = `#0D1117`. Active = cyan `#22D3EE`. Inactive = `#8B949E`.
Icônes : **outline uniquement**, jamais filled.

---

## Icônes

**@expo/vector-icons (Ionicons) uniquement.**

```
size: 20    ← taille standard dans les listes
size: 24    ← headers et FAB
size: 16    ← inline dans du texte

Couleur inactive : #8B949E
Couleur active   : #E6EDF3
Couleur accent   : #22D3EE
```

---

## Ce qu'on ne fait PAS

```
✗  Gradient de couleur
✗  Ombre colorée (shadow en couleur)
✗  Border-radius < 6 sur un composant interactif
✗  Fond blanc ou clair sur un écran
✗  Texte coloré autre que les accents définis
✗  Deux accents de couleur sur le même écran (sauf états succès/erreur)
✗  Animation > 300ms
✗  Icône filled (fill) dans la navigation — outline only
✗  Couleurs en dur — toujours via theme
✗  margin/padding qui ne sont pas multiples de 4
✗  Cercle pour une checkbox — toujours carré arrondi
```

---

## Animations

```tsx
// Opacity / layout
Animated.timing(value, { duration: 180, useNativeDriver: true }).start();

// Press feedback
<Pressable style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })} />
```

**Sobre et rapide.** Pas de bounce, pas de spring excessif.
