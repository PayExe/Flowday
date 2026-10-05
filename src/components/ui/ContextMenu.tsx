import React, { useCallback } from 'react';
import { ActionSheetIOS, Alert, Platform, Pressable, ViewStyle } from 'react-native';
import { useTranslation } from '../../i18n';

export interface ContextMenuAction {
  id?: string;
  title: string;
  systemIcon?: string;
  destructive?: boolean;
  disabled?: boolean;
}

export interface ContextMenuProps {
  children: React.ReactNode;
  actions: ContextMenuAction[];
  onPress: (actionName: string) => void;
  style?: ViewStyle;
}

export function showActionMenu(
  actions: ContextMenuAction[],
  onPress: (actionName: string) => void,
  labels: { cancel: string; title: string }
) {
  const enabledActions = actions.filter((a) => !a.disabled);

  if (Platform.OS === 'ios') {
    const destructiveIndices = enabledActions
      .map((a, i) => (a.destructive ? i + 1 : -1))
      .filter((i) => i !== -1);

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: [labels.cancel, ...enabledActions.map((a) => a.title)],
        cancelButtonIndex: 0,
        destructiveButtonIndex: destructiveIndices.length > 0 ? destructiveIndices : undefined,
      },
      (buttonIndex) => {
        const action = enabledActions[buttonIndex - 1];
        if (action) onPress(action.id ?? action.title);
      }
    );
    return;
  }

  Alert.alert(
    labels.title,
    undefined,
    [
      { text: labels.cancel, style: 'cancel' },
      ...enabledActions.map((action) => ({
        text: action.title,
        style: action.destructive ? ('destructive' as const) : ('default' as const),
        onPress: () => onPress(action.id ?? action.title),
      })),
    ],
    { cancelable: true }
  );
}

export function useActionMenu() {
  const { t } = useTranslation();
  return useCallback(
    (actions: ContextMenuAction[], onPress: (actionName: string) => void) =>
      showActionMenu(actions, onPress, { cancel: t('Annuler'), title: t('Actions') }),
    [t]
  );
}

export function ContextMenu({
  children,
  actions,
  onPress,
  style,
}: ContextMenuProps) {
  const openMenu = useActionMenu();

  return (
    <Pressable onLongPress={() => openMenu(actions, onPress)} style={style}>
      {children}
    </Pressable>
  );
}
