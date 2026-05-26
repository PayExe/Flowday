import { View, Text, Pressable } from 'react-native';
import { Task } from '../../types/task';
import { hapticLight, hapticWarning } from '../../utils/haptics';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from '../ui/Symbol';
import { ContextMenu } from '../ui/ContextMenu';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function priorityColor(priority: string, colors: any): string {
  switch (priority) {
    case 'high': return colors.system.red;
    case 'medium': return colors.system.yellow;
    case 'low': return colors.system.gray;
    default: return colors.system.gray;
  }
}

export function TaskCard({ task, onToggle, onDelete }: TaskCardProps) {
  const { colors, typography } = useTheme();
  const done = task.completed;
  const pColor = priorityColor(task.priority, colors);

  const cardContent = (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: 'transparent',
        gap: 12,
      }}
    >
      {/* Cercle checkbox — Things 3 */}
      <Pressable
        onPress={() => { hapticLight(); onToggle(task.id); }}
        hitSlop={8}
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          borderWidth: done ? 0 : 2,
          borderColor: done ? 'transparent' : pColor,
          backgroundColor: done ? pColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 1,
        }}
      >
        {done && (
          <Symbol name={SymbolNames.checkmark} size={13} color={colors.text.inverse} />
        )}
      </Pressable>

      {/* Contenu */}
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
      </View>

      {/* Badge priorité (discret) */}
      {task.priority === 'high' && !done && (
        <Symbol name={SymbolNames.flag} size={14} color={colors.system.red} style={{ marginTop: 3 }} />
      )}
    </View>
  );

  return (
    <ContextMenu
      actions={[
        {
          title: done ? 'Annuler' : 'Terminer',
          systemIcon: done ? 'xmark.circle' : 'checkmark.circle',
        },
        {
          title: 'Supprimer',
          systemIcon: 'trash',
          destructive: true,
        },
      ]}
      onPress={(name) => {
        if (name === 'Terminer' || name === 'Annuler') {
          hapticLight();
          onToggle(task.id);
        } else if (name === 'Supprimer') {
          hapticWarning();
          onDelete(task.id);
        }
      }}
    >
      {cardContent}
    </ContextMenu>
  );
}
