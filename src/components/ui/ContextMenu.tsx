import React, { useCallback } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, ViewStyle } from 'react-native';

export interface ContextMenuAction {
  title: string;
  systemIcon?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ContextMenuProps {
  children: React.ReactNode;
  actions: ContextMenuAction[];
  onPress: (actionName: string) => void;
  previewBackgroundColor?: string;
  style?: ViewStyle;
}

/**
 * ContextMenu — Menu natif iOS via ActionSheetIOS (100% Expo Go compatible)
 *
 * Sur iOS : utilise ActionSheetIOS (inclus dans React Native core)
 * Sur Android : fallback Alert avec une liste d'actions
 *
 * Usage :
 *   <ContextMenu
 *     actions={[
 *       { title: 'Modifier', systemIcon: 'pencil' },
 *       { title: 'Supprimer', systemIcon: 'trash', destructive: true },
 *     ]}
 *     onPress={(name) => console.log(name)}
 *   >
 *     <MyCard />
 *   </ContextMenu>
 */
export function ContextMenu({
  children,
  actions,
  onPress,
  style,
}: ContextMenuProps) {
  const handleLongPress = useCallback(() => {
    const enabledActions = actions.filter((a) => !a.disabled);

    if (Platform.OS === 'ios') {
      const options = enabledActions.map((a) => a.title);
      const destructiveIndices = enabledActions
        .map((a, i) => (a.destructive ? i : -1))
        .filter((i) => i !== -1);

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Annuler', ...options],
          cancelButtonIndex: 0,
          destructiveButtonIndex: destructiveIndices.length > 0 ? destructiveIndices.map((i) => i + 1) : undefined,
          tintColor: '#0A84FF', // ActionSheetIOS tintColor est iOS natif, OK en dur
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return; // Annuler
          const action = enabledActions[buttonIndex - 1];
          if (action) {
            onPress(action.title);
          }
        }
      );
    } else {
      // Android fallback — Alert avec boutons
      Alert.alert(
        'Actions',
        undefined,
        [
          { text: 'Annuler', style: 'cancel' },
          ...enabledActions.map((action) => ({
            text: action.title,
            style: action.destructive ? ('destructive' as const) : ('default' as const),
            onPress: () => onPress(action.title),
          })),
        ],
        { cancelable: true }
      );
    }
  }, [actions, onPress]);

  return (
    <Pressable onLongPress={handleLongPress} style={style}>
      {children}
    </Pressable>
  );
}
