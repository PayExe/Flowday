import { useRef } from 'react';
import { View, Text, Pressable, Alert, Animated } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Task } from '../../types/task';
import { hapticLight, hapticWarning } from '../../utils/haptics';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { ContextMenu } from '../ui/ContextMenu';
import { LifeBlock } from '../../types/lifeBlock';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress?: () => void;
  lifeBlock?: LifeBlock;
}

function priorityColor(priority: string, colors: any): string {
  switch (priority) {
    case 'high': return colors.system.red;
    case 'medium': return colors.system.yellow;
    case 'low': return colors.system.gray;
    default: return colors.system.gray;
  }
}

export function TaskCard({ task, onToggle, onDelete, onPress, lifeBlock }: TaskCardProps) {
  const { colors, typography } = useTheme();
  const done = task.completed;
  const pColor = priorityColor(task.priority, colors);
  const swipeableRef = useRef<Swipeable>(null);
  const checkboxScale = useRef(new Animated.Value(1)).current;

  const handleCheckboxPress = (event: any) => {
    event.stopPropagation();
    hapticLight();
    onToggle(task.id);
    Animated.sequence([
      Animated.spring(checkboxScale, { toValue: 1.3, useNativeDriver: true, speed: 20 }),
      Animated.spring(checkboxScale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'left') {
      hapticLight();
      onToggle(task.id);
      swipeableRef.current?.close();
    } else if (direction === 'right') {
      hapticWarning();
        Alert.alert('Supprimer cette tâche ?', 'Cette action est irréversible.', [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => swipeableRef.current?.close(),
        },
        {
          text: 'Supprimer',
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
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'transparent',
        gap: 12,
      }}
    >
      <Pressable
        onPress={handleCheckboxPress}
        hitSlop={8}
      >
        <Animated.View style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: done ? 0 : 2,
          borderColor: done ? 'transparent' : pColor,
          backgroundColor: done ? pColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
          transform: [{ scale: checkboxScale }],
        }}>
          {done && (
            <Symbol name={SymbolNames.checkmark} size={13} color={colors.text.inverse} />
          )}
        </Animated.View>
      </Pressable>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: typography.sizes.lg,
            color: done ? colors.text.quaternary : colors.text.primary,
            letterSpacing: -0.41,
            textDecorationLine: done ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 5 }}>
          {lifeBlock && <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: lifeBlock.color }} />}
          <Text style={{ fontSize: typography.sizes.xs, color: colors.text.secondary }}>
            {lifeBlock?.name || 'Sans bloc'}
          </Text>
        </View>
      </View>

      {task.priority === 'high' && !done && (
        <Symbol name={SymbolNames.flag} size={14} color={colors.system.red} style={{ marginTop: 3 }} />
      )}
    </Pressable>
  );

  const swipeActions = (
    <Swipeable
      ref={swipeableRef}
      friction={2}
      overshootFriction={8}
      renderLeftActions={(progress) => (
        <View style={{
          width: 80,
          backgroundColor: colors.system.green,
          borderRadius: 13,
          marginLeft: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Symbol name={SymbolNames.checkmark} size={22} color={colors.text.inverse} />
        </View>
      )}
      onSwipeableOpen={handleSwipeOpen}
      renderRightActions={(progress) => (
        <View style={{
          width: 80,
          backgroundColor: colors.system.red,
          borderRadius: 13,
          marginRight: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Symbol name={SymbolNames.trash} size={22} color={colors.text.inverse} />
        </View>
      )}
    >
      {cardContent}
    </Swipeable>
  );

  return (
    <ContextMenu
      actions={[
        {
          title: done ? 'Annuler' : 'Terminer',
          systemIcon: done ? 'xmark.circle' : 'checkmark.circle',
        },
      ]}
      onPress={(name) => {
        if (name === 'Terminer' || name === 'Annuler') {
          hapticLight();
          onToggle(task.id);
        }
      }}
    >
      {swipeActions}
    </ContextMenu>
  );
}
