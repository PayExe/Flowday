import { useRef } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task } from '../../types/task';
import { hapticLight, hapticWarning } from '../../utils/haptics';
import { resolveBlockColor, useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { ContextMenu } from '../ui/ContextMenu';
import { Checkbox } from '../ui/Checkbox';
import { LifeBlock } from '../../types/lifeBlock';
import { useTranslation } from '../../i18n';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: () => void;
  lifeBlock?: LifeBlock;
}

export function TaskCard({ task, onToggle, onDelete, onPress, lifeBlock }: TaskCardProps) {
  const { colors, typography, isDark } = useTheme();
  const { t } = useTranslation();
  const done = task.completed;
  const swipeableRef = useRef<Swipeable>(null);

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      hapticLight();
      onToggle(task.id);
      swipeableRef.current?.close();
    } else if (direction === 'right') {
      hapticWarning();
      Alert.alert(t('Supprimer cette tâche ?'), t('Cette action est irréversible.'), [
        {
          text: t('Annuler'),
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: t('Supprimer'),
          style: 'destructive',
          onPress: () => {
            onDelete(task.id);
            swipeableRef.current?.close();
          },
        },
      ]);
    }
  };

  const cardContent = (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed && onPress ? colors.bg.hover : colors.bg.secondary },
      ]}
    >
      <Checkbox
        checked={done}
        onToggle={() => onToggle(task.id)}
        color={task.priority === 'high' ? colors.system.red : undefined}
        accessibilityLabel={task.title}
      />

      <View style={styles.text}>
        <Text
          style={[
            typography.body,
            done && { color: colors.text.tertiary, textDecorationLine: 'line-through' },
          ]}
          numberOfLines={2}
        >
          {task.title}
        </Text>
        {lifeBlock && (
          <View style={styles.meta}>
            <View
              style={[styles.dot, { backgroundColor: resolveBlockColor(lifeBlock.color, isDark) }]}
            />
            <Text style={typography.footnote} numberOfLines={1}>
              {lifeBlock.name}
            </Text>
          </View>
        )}
      </View>

      {task.priority === 'high' && !done && (
        <Symbol name={SymbolNames.flag} size={15} color={colors.system.red} />
      )}
    </Pressable>
  );

  return (
    <ContextMenu
      actions={[
        {
          title: done ? t('Annuler') : t('Terminer'),
          systemIcon: done ? 'xmark.circle' : 'checkmark.circle',
        },
      ]}
      onPress={(name) => {
        if (name === t('Terminer') || name === t('Annuler')) {
          hapticLight();
          onToggle(task.id);
        }
      }}
    >
      <Swipeable
        ref={swipeableRef}
        friction={2}
        overshootFriction={8}
        onSwipeableOpen={handleSwipeOpen}
        renderLeftActions={() => (
          <View style={[styles.swipeAction, { backgroundColor: colors.system.green }]}>
            <Symbol name={SymbolNames.checkmark} size={22} weight="semibold" color={colors.text.inverse} />
          </View>
        )}
        renderRightActions={() => (
          <View style={[styles.swipeAction, { backgroundColor: colors.system.red }]}>
            <Symbol name={SymbolNames.trash} size={22} weight="semibold" color={colors.text.inverse} />
          </View>
        )}
      >
        {cardContent}
      </Swipeable>
    </ContextMenu>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  text: {
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  swipeAction: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
