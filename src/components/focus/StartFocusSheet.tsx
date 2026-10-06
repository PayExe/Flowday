import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../../types/task';
import { LifeBlock } from '../../types/lifeBlock';
import { resolveBlockColor, useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { hapticLight } from '../../utils/haptics';
import { Card, List } from '../ui/List';
import { Sheet } from '../ui/Sheet';
import { Symbol, SymbolNames } from '../ui/Symbol';

interface StartFocusSheetProps {
  visible: boolean;
  tasks: Task[];
  getLifeBlock: (id: string) => LifeBlock | undefined;
  onClose: () => void;
  onSelect: (task: Task) => void;
}

/** A pomodoro always runs against one task, so starting one is picking one. */
export function StartFocusSheet({
  visible,
  tasks,
  getLifeBlock,
  onClose,
  onSelect,
}: StartFocusSheetProps) {
  const { colors, typography, isDark } = useTheme();
  const { t } = useTranslation();

  return (
    <Sheet visible={visible} title={t('Démarrer un focus')} onClose={onClose}>
      {tasks.length === 0 ? (
        <Card padded>
          <Text style={typography.subheadline}>
            {t('Ajoute d’abord une tâche à faire aujourd’hui.')}
          </Text>
        </Card>
      ) : (
        <List separatorInset={52}>
          {tasks.map((task) => {
            const lifeBlock = task.lifeBlockId ? getLifeBlock(task.lifeBlockId) : undefined;

            return (
              <Pressable
                key={task.id}
                accessibilityRole="button"
                accessibilityLabel={`${t('Démarrer Focus pour')} ${task.title}`}
                onPress={() => {
                  hapticLight();
                  onSelect(task);
                }}
                style={({ pressed }) => [
                  styles.task,
                  { backgroundColor: pressed ? colors.bg.hover : 'transparent' },
                ]}
              >
                <Symbol name={SymbolNames.timer} size={20} color={colors.accent} />
                <View style={styles.text}>
                  <Text style={typography.body} numberOfLines={2}>
                    {task.title}
                  </Text>
                  {lifeBlock && (
                    <View style={styles.meta}>
                      <View
                        style={[
                          styles.dot,
                          { backgroundColor: resolveBlockColor(lifeBlock.color, isDark) },
                        ]}
                      />
                      <Text style={typography.footnote} numberOfLines={1}>
                        {lifeBlock.name}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </List>
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
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
});
