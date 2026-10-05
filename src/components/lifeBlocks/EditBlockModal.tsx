import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { LifeBlock, LifeBlockColors, LifeBlockColor } from '../../types/lifeBlock';
import { resolveBlockColor, useTheme } from '../../theme';
import { hapticLight, hapticSuccess } from '../../utils/haptics';
import { useTranslation } from '../../i18n';
import { Button } from '../ui/Glass';
import { Card, IconTile } from '../ui/List';
import { FieldLabel, Sheet } from '../ui/Sheet';
import { Symbol, SymbolNames } from '../ui/Symbol';

interface EditBlockModalProps {
  visible: boolean;
  block: LifeBlock | null;
  onClose: () => void;
  onSave: (data: {
    name: string;
    emoji: string;
    color: LifeBlockColor;
    weeklyGoalMinutes: number;
  }) => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
}

const EMOJIS = [
  '💻', '🏃', '🍳', '📚', '🧘', '🎸', '✍️',
  '🌱', '🎨', '🎮', '💤', '💰', '🧹', '🎯',
  '🧠', '🏠', '✈️', '🐕', '📸', '🎧', '❤️',
];

function parseGoalInput(input: string): number {
  const trimmed = input.trim().toLowerCase();
  const hMatch = trimmed.match(/(\d+)\s*h\s*(\d*)?/);
  if (hMatch) {
    const hours = parseInt(hMatch[1], 10);
    const minutes = hMatch[2] ? parseInt(hMatch[2], 10) : 0;
    return hours * 60 + minutes;
  }
  const minMatch = trimmed.match(/(\d+)\s*min/);
  if (minMatch) {
    return parseInt(minMatch[1], 10);
  }
  const num = parseInt(trimmed, 10);
  return isNaN(num) ? 0 : num;
}

function formatGoal(minutes: number, t: (key: string) => string): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}${t('h')}${m}`;
  if (h > 0) return `${h}${t('h')}`;
  return `${m}${t('min')}`;
}

export function EditBlockModal({
  visible,
  block,
  onClose,
  onSave,
  onArchive,
  onUnarchive,
}: EditBlockModalProps) {
  const { colors, typography, isDark } = useTheme();
  const { t } = useTranslation();
  const isEditing = block !== null;

  const [name, setName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💻');
  const [selectedColor, setSelectedColor] = useState<LifeBlockColor>(LifeBlockColors[0]);
  const [goalInput, setGoalInput] = useState('');

  useEffect(() => {
    if (block) {
      setName(block.name);
      setSelectedEmoji(block.emoji);
      setSelectedColor(block.color);
      setGoalInput(formatGoal(block.weeklyGoalMinutes, t));
    } else {
      setName('');
      setSelectedEmoji('💻');
      setSelectedColor(LifeBlockColors[0]);
      setGoalInput('');
    }
  }, [block, visible]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    hapticSuccess();
    const weeklyGoalMinutes = parseGoalInput(goalInput) || 0;
    onSave({
      name: name.trim(),
      emoji: selectedEmoji,
      color: selectedColor,
      weeklyGoalMinutes,
    });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      title={isEditing ? t('Modifier le bloc') : t('Nouveau bloc')}
      onClose={onClose}
      onConfirm={handleSave}
      confirmLabel={isEditing ? t('Enregistrer') : t('Créer')}
      confirmDisabled={!canSave}
    >
      <View style={styles.preview}>
        <IconTile color={selectedColor} emoji={selectedEmoji} size={84} />
      </View>

      <Card>
        <TextInput
          style={[typography.body, styles.input]}
          placeholder={t('Ex: Deep Work, Sport...')}
          placeholderTextColor={colors.text.placeholder}
          value={name}
          onChangeText={setName}
          autoFocus={!isEditing}
          accessibilityLabel={t('Nom')}
        />
      </Card>

      <FieldLabel>{t('Emoji')}</FieldLabel>
      <Card padded>
        <View style={styles.grid}>
          {EMOJIS.map((emoji) => (
            <Pressable
              key={emoji}
              accessibilityRole="button"
              accessibilityState={{ selected: selectedEmoji === emoji }}
              style={[
                styles.emoji,
                selectedEmoji === emoji && { backgroundColor: colors.bg.tertiary },
              ]}
              onPress={() => {
                hapticLight();
                setSelectedEmoji(emoji);
              }}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </Pressable>
          ))}
        </View>
        <View style={[styles.customEmoji, { borderTopColor: colors.separator.hairline }]}>
          <Text style={[typography.body, styles.customEmojiLabel]}>{t('Autre emoji')}</Text>
          <TextInput
            style={[typography.title3, styles.customEmojiInput, { backgroundColor: colors.bg.tertiary }]}
            value={selectedEmoji}
            onChangeText={(text) => setSelectedEmoji(text.slice(0, 2))}
            maxLength={2}
            accessibilityLabel={t('Autre emoji')}
          />
        </View>
      </Card>

      <FieldLabel>{t('Couleur')}</FieldLabel>
      <Card padded>
        <View style={styles.grid}>
          {LifeBlockColors.map((color) => {
            const selected = selectedColor === color;
            const swatch = resolveBlockColor(color, isDark);
            return (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={color}
                style={[styles.color, { backgroundColor: swatch }]}
                onPress={() => {
                  hapticLight();
                  setSelectedColor(color);
                }}
              >
                {selected && (
                  <Symbol
                    name={SymbolNames.checkmark}
                    size={18}
                    weight="bold"
                    color={color === '#FFFFFF' && isDark ? '#000000' : colors.text.inverse}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Card>

      <FieldLabel>{t('Objectif hebdomadaire')}</FieldLabel>
      <Card>
        <TextInput
          style={[typography.body, styles.input]}
          placeholder={t('Ex: 5h, 1h30, 90min...')}
          placeholderTextColor={colors.text.placeholder}
          value={goalInput}
          onChangeText={setGoalInput}
          accessibilityLabel={t('Objectif hebdomadaire')}
        />
      </Card>
      {goalInput.trim().length > 0 && (
        <Text style={[typography.footnote, styles.hint]}>
          {`${formatGoal(parseGoalInput(goalInput), t)} ${t('/ semaine')}`}
        </Text>
      )}

      {isEditing && block && !block.isArchived && onArchive && (
        <Button
          title={t('Archiver')}
          symbol={SymbolNames.archiveOutline}
          variant="destructive"
          onPress={onArchive}
          style={styles.action}
        />
      )}

      {isEditing && block && block.isArchived && onUnarchive && (
        <Button
          title={t('Restaurer')}
          symbol={SymbolNames.undo}
          variant="secondary"
          onPress={onUnarchive}
          style={styles.action}
        />
      )}
    </Sheet>
  );
}

const styles = StyleSheet.create({
  preview: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  emoji: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: {
    fontSize: 24,
  },
  customEmoji: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  customEmojiLabel: {
    flex: 1,
  },
  customEmojiInput: {
    width: 56,
    height: 40,
    borderRadius: 10,
    textAlign: 'center',
  },
  color: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    paddingHorizontal: 32,
    paddingTop: 8,
  },
  action: {
    marginTop: 32,
    marginHorizontal: 16,
  },
});
