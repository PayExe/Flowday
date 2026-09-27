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
          tintColor: '#0A84FF',
        },
        (buttonIndex) => {
          if (buttonIndex === 0) return;
          const action = enabledActions[buttonIndex - 1];
          if (action) {
            onPress(action.title);
          }
        }
      );
    } else {
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
