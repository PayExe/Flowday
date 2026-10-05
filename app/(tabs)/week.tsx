import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { TemplateBlock } from '../../src/types/template';
import { TemplateBlockCard } from '../../src/components/templates/TemplateBlockCard';
import { EditTemplateBlockModal } from '../../src/components/templates/EditTemplateBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { useTheme } from '../../src/theme';
import { hapticLight } from '../../src/utils/haptics';
import { formatDuration, timeToMinutes } from '../../src/utils/time';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { Button } from '../../src/components/ui/Glass';
import { IconTile, List, Row, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { SymbolNames } from '../../src/components/ui/Symbol';
import { useTranslation } from '../../src/i18n';

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** Monday-based index of today, matching `TemplateBlock.dayOfWeek`. */
function todayIndex(): number {
  const day = new Date().getDay();
  return day === 0 ? 6 : day - 1;
}

export default function WeekScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TemplateBlock | null>(null);
  const [editingDay, setEditingDay] = useState(0);

  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const addBlockToTemplate = useTemplateStore((state) => state.addBlockToTemplate);
  const updateTemplateBlock = useTemplateStore((state) => state.updateTemplateBlock);
  const removeTemplateBlock = useTemplateStore((state) => state.removeTemplateBlock);
  const getBlocksForDay = useTemplateStore((state) => state.getBlocksForDay);

  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);
  const lifeBlocks = getActiveBlocks();

  const activeTemplate = templates.find((t) => t.id === activeTemplateId);

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    if (activeTemplate) {
      didInit.current = true;
      return;
    }
    if (templates.length === 0 && lifeBlocks.length > 0) {
      didInit.current = true;
      addTemplate('Semaine normale');
    }
  }, [activeTemplate, templates.length, lifeBlocks.length, addTemplate]);

  const template = activeTemplate;

  const handleCreate = useCallback((dayOfWeek: number) => {
    hapticLight();
    setEditingBlock(null);
    setEditingDay(dayOfWeek);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((block: TemplateBlock) => {
    setEditingBlock(block);
    setEditingDay(block.dayOfWeek);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(
    (data: Omit<TemplateBlock, 'id'>) => {
      hapticLight();
      if (!template) return;
      if (editingBlock) {
        updateTemplateBlock(template.id, editingBlock.id, data);
      } else {
        addBlockToTemplate(template.id, data);
      }
    },
    [template, editingBlock, updateTemplateBlock, addBlockToTemplate]
  );

  const handleDelete = useCallback(() => {
    if (!template || !editingBlock) return;
    removeTemplateBlock(template.id, editingBlock.id);
    setModalVisible(false);
  }, [template, editingBlock, removeTemplateBlock]);

  const totalPlannedMinutes = useMemo(() => {
    if (!template) return 0;
    return template.blocks.reduce((sum, b) => {
      return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    }, 0);
  }, [template]);

  if (lifeBlocks.length === 0) {
    return (
      <Screen
        title={t('Semaine')}
        subtitle={t('Définis ton template hebdomadaire')}
        actions={
          <PageInfo
            title={t('Semaine')}
            description={t('Construis une semaine type qui servira de base à ton planning quotidien.')}
            points={[
              t('Crée d’abord tes blocs de vie dans l’onglet Blocs.'),
              t('Ajoute ensuite des créneaux à chaque jour.'),
              t('Appuie sur un créneau pour modifier ses horaires ou le supprimer.'),
            ]}
          />
        }
      >
        <EmptyState
          icon={SymbolNames.blocks}
          title={t('Aucun Life Block')}
          subtitle={t('Aucun bloc de vie pour le moment')}
          action={<Button title={t('Créer un bloc de vie')} onPress={() => router.push('/blocks')} />}
        />
      </Screen>
    );
  }

  const today = todayIndex();

  return (
    <>
      <Screen
        title={t('Semaine')}
        subtitle={
          totalPlannedMinutes > 0
            ? t('plannedWeekDuration', { duration: formatDuration(totalPlannedMinutes) })
            : t('Ton planning type, répété chaque semaine.')
        }
        actions={
          <PageInfo
            title={t('Semaine')}
            description={t('Ton planning type, répété chaque semaine.')}
            points={[
              t('Ajoute des créneaux à chaque jour avec « Ajouter un créneau ».'),
              t('Les créneaux apparaissent ensuite dans Planning le jour correspondant.'),
              t('Le total indique le temps planifié sur toute la semaine.'),
            ]}
          />
        }
      >
        {DAY_LABELS.map((day, dayIndex) => {
          const dayLabel = t(day);
          const dayBlocks = template
            ? getBlocksForDay(dayIndex).sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              )
            : [];
          const dayMinutes = dayBlocks.reduce(
            (sum, b) => sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)),
            0
          );

          return (
            <View key={dayIndex}>
              <SectionHeader
                title={dayLabel}
                trailing={
                  <View style={styles.dayMeta}>
                    {dayIndex === today && (
                      <View style={[styles.todayBadge, { backgroundColor: colors.accent }]}>
                        <Text style={[typography.caption, styles.todayText, { color: colors.text.inverse }]}>
                          {t('Aujourd’hui')}
                        </Text>
                      </View>
                    )}
                    {dayMinutes > 0 && (
                      <Text style={typography.subheadline}>{formatDuration(dayMinutes)}</Text>
                    )}
                  </View>
                }
              />

              <List separatorInset={64}>
                {dayBlocks.map((block) => (
                  <TemplateBlockCard
                    key={block.id}
                    block={block}
                    lifeBlock={lifeBlocks.find((lb) => lb.id === block.lifeBlockId)}
                    onPress={() => handleEdit(block)}
                  />
                ))}
                <Row
                  leading={<IconTile color={colors.accent} symbol={SymbolNames.add} />}
                  title={t('Ajouter un créneau')}
                  tint={colors.accent}
                  onPress={() => handleCreate(dayIndex)}
                  accessibilityLabel={`${t('Ajouter un bloc le')} ${dayLabel}`}
                />
              </List>
            </View>
          );
        })}
      </Screen>

      {template && (
        <EditTemplateBlockModal
          visible={modalVisible}
          block={editingBlock}
          lifeBlocks={lifeBlocks}
          existingBlocks={template.blocks}
          dayOfWeek={editingDay}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          onDelete={editingBlock ? handleDelete : undefined}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  dayMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  todayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  todayText: {
    fontWeight: '600',
  },
});
