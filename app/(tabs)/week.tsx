import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Alert, Pressable, Text, View, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { TemplateBlock } from '../../src/types/template';
import { TemplateBlockCard } from '../../src/components/templates/TemplateBlockCard';
import { EditTemplateBlockModal } from '../../src/components/templates/EditTemplateBlockModal';
import { DayPicker } from '../../src/components/templates/DayPicker';
import { WeekDayStrip } from '../../src/components/templates/WeekDayStrip';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { useTheme } from '../../src/theme';
import { hapticLight } from '../../src/utils/haptics';
import { formatDuration, timeToMinutes } from '../../src/utils/time';
import { WEEK_DAY_KEYS, WHOLE_WEEK, shiftWeekDay, weekDayIndex } from '../../src/utils/dates';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { Button } from '../../src/components/ui/Glass';
import { Card, IconTile, List, Row, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { Sheet } from '../../src/components/ui/Sheet';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
import { useActionMenu } from '../../src/components/ui/ContextMenu';
import { useTranslation } from '../../src/i18n';

function blockMinutes(block: TemplateBlock): number {
  return timeToMinutes(block.endTime) - timeToMinutes(block.startTime);
}

export default function WeekScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const openMenu = useActionMenu();

  const [selectedDay, setSelectedDay] = useState(weekDayIndex);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TemplateBlock | null>(null);
  const [copyVisible, setCopyVisible] = useState(false);
  const [copyTargets, setCopyTargets] = useState<number[]>([]);

  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const addTemplate = useTemplateStore((state) => state.addTemplate);
  const addBlockToTemplate = useTemplateStore((state) => state.addBlockToTemplate);
  const updateTemplateBlock = useTemplateStore((state) => state.updateTemplateBlock);
  const removeTemplateBlock = useTemplateStore((state) => state.removeTemplateBlock);
  const copyDayBlocks = useTemplateStore((state) => state.copyDayBlocks);
  const clearDay = useTemplateStore((state) => state.clearDay);

  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);
  const lifeBlocks = getActiveBlocks();

  const template = templates.find((candidate) => candidate.id === activeTemplateId);

  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    if (template) {
      didInit.current = true;
      return;
    }
    if (templates.length === 0 && lifeBlocks.length > 0) {
      didInit.current = true;
      addTemplate('Semaine normale');
    }
  }, [template, templates.length, lifeBlocks.length, addTemplate]);

  const blocksByDay = useMemo(() => {
    const days: TemplateBlock[][] = WHOLE_WEEK.map(() => []);
    for (const block of template?.blocks ?? []) {
      days[block.dayOfWeek]?.push(block);
    }
    for (const day of days) {
      day.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return days;
  }, [template]);

  const colorsByDay = useMemo(
    () =>
      blocksByDay.map((day) =>
        day.map((block) => lifeBlocks.find((lb) => lb.id === block.lifeBlockId)?.color ?? colors.system.gray)
      ),
    [blocksByDay, lifeBlocks, colors.system.gray]
  );

  const totalBlocks = template?.blocks.length ?? 0;
  const totalMinutes = useMemo(
    () => (template?.blocks ?? []).reduce((sum, b) => sum + blockMinutes(b), 0),
    [template]
  );

  const goToDay = useCallback((offset: number) => {
    hapticLight();
    setSelectedDay((day) => shiftWeekDay(day, offset));
  }, []);

  const swipe = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        .activeOffsetX([-24, 24])
        .failOffsetY([-20, 20])
        .onEnd((event) => {
          if (Math.abs(event.translationX) < 48) return;
          goToDay(event.translationX < 0 ? 1 : -1);
        }),
    [goToDay]
  );

  const handleCreate = useCallback(() => {
    hapticLight();
    setEditingBlock(null);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((block: TemplateBlock) => {
    setEditingBlock(block);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(
    (data: Omit<TemplateBlock, 'id' | 'dayOfWeek'>, days: number[]) => {
      hapticLight();
      if (!template) return;
      if (editingBlock) {
        updateTemplateBlock(template.id, editingBlock.id, {
          ...data,
          dayOfWeek: (days[0] ?? editingBlock.dayOfWeek) as TemplateBlock['dayOfWeek'],
        });
        if (days[0] !== undefined) setSelectedDay(days[0]);
        return;
      }
      for (const day of days) {
        addBlockToTemplate(template.id, { ...data, dayOfWeek: day as TemplateBlock['dayOfWeek'] });
      }
    },
    [template, editingBlock, updateTemplateBlock, addBlockToTemplate]
  );

  const handleDelete = useCallback(() => {
    if (!template || !editingBlock) return;
    removeTemplateBlock(template.id, editingBlock.id);
    setModalVisible(false);
  }, [template, editingBlock, removeTemplateBlock]);

  const handleClearDay = useCallback(() => {
    if (!template) return;
    Alert.alert(
      t('Vider cette journée ?'),
      t('Tous les créneaux de ce jour seront supprimés.'),
      [
        { text: t('Annuler'), style: 'cancel' },
        {
          text: t('Vider'),
          style: 'destructive',
          onPress: () => clearDay(template.id, selectedDay),
        },
      ]
    );
  }, [template, selectedDay, clearDay, t]);

  const handleCopy = useCallback(() => {
    if (!template || copyTargets.length === 0) return;
    hapticLight();
    copyDayBlocks(template.id, selectedDay, copyTargets);
    setCopyVisible(false);
  }, [template, selectedDay, copyTargets, copyDayBlocks]);

  const openDayMenu = useCallback(() => {
    openMenu(
      [
        { id: 'copy', title: t('Copier ce jour vers…'), systemIcon: 'doc.on.doc' },
        { id: 'clear', title: t('Vider la journée'), systemIcon: 'trash', destructive: true },
      ],
      (action) => {
        if (action === 'copy') {
          setCopyTargets([]);
          setCopyVisible(true);
        }
        if (action === 'clear') handleClearDay();
      }
    );
  }, [openMenu, t, handleClearDay]);

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

  const today = weekDayIndex();
  const dayBlocks = blocksByDay[selectedDay] ?? [];
  const dayMinutes = dayBlocks.reduce((sum, b) => sum + blockMinutes(b), 0);
  const dayLabel = t(WEEK_DAY_KEYS[selectedDay]);

  return (
    <>
      <Screen
        title={t('Semaine')}
        subtitle={
          totalBlocks > 0
            ? t('weekSummary', { count: totalBlocks, duration: formatDuration(totalMinutes) })
            : t('Ton planning type, répété chaque semaine.')
        }
        actions={
          <PageInfo
            title={t('Semaine')}
            description={t('Ton planning type, répété chaque semaine.')}
            points={[
              t('Choisis un jour en haut, puis ajoute ses créneaux.'),
              t('Un créneau peut être créé sur plusieurs jours à la fois.'),
              t('Les créneaux apparaissent ensuite dans Planning le jour correspondant.'),
              t('Le menu ••• copie la journée vers d’autres jours ou la vide.'),
            ]}
          />
        }
      >
        <WeekDayStrip
          colorsByDay={colorsByDay}
          selected={selectedDay}
          today={today}
          onSelect={setSelectedDay}
        />

        <GestureDetector gesture={swipe}>
          <View>
            <SectionHeader
              title={dayLabel}
              trailing={
                <View style={styles.dayMeta}>
                  {selectedDay === today && (
                    <View style={[styles.todayBadge, { backgroundColor: colors.accent }]}>
                      <Text style={[typography.caption, styles.todayText, { color: colors.text.inverse }]}>
                        {t('Aujourd’hui')}
                      </Text>
                    </View>
                  )}
                  {dayMinutes > 0 && (
                    <Text style={typography.subheadline}>{formatDuration(dayMinutes)}</Text>
                  )}
                  {dayBlocks.length > 0 && (
                    <Pressable
                      onPress={openDayMenu}
                      hitSlop={10}
                      accessibilityRole="button"
                      accessibilityLabel={t('Actions')}
                      style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
                    >
                      <Symbol name={SymbolNames.moreCircle} size={22} color={colors.accent} />
                    </Pressable>
                  )}
                </View>
              }
            />

            {dayBlocks.length > 0 ? (
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
                  onPress={handleCreate}
                  accessibilityLabel={`${t('Ajouter un bloc le')} ${dayLabel}`}
                />
              </List>
            ) : (
              <Card style={styles.freeDay}>
                <Symbol name={SymbolNames.sparkles} size={26} color={colors.text.tertiary} />
                <Text style={[typography.headline, styles.freeDayTitle]}>{t('Journée libre')}</Text>
                <Text style={[typography.footnote, styles.freeDayText]}>
                  {t('Aucun créneau planifié ce jour-là.')}
                </Text>
                <Button
                  title={t('Ajouter un créneau')}
                  symbol={SymbolNames.add}
                  onPress={handleCreate}
                  style={styles.freeDayAction}
                />
              </Card>
            )}
          </View>
        </GestureDetector>
      </Screen>

      {template && (
        <EditTemplateBlockModal
          visible={modalVisible}
          block={editingBlock}
          lifeBlocks={lifeBlocks}
          existingBlocks={template.blocks}
          dayOfWeek={selectedDay}
          onClose={() => setModalVisible(false)}
          onSave={handleSave}
          onDelete={editingBlock ? handleDelete : undefined}
        />
      )}

      <Sheet
        visible={copyVisible}
        title={t('Copier ce jour')}
        onClose={() => setCopyVisible(false)}
        onConfirm={handleCopy}
        confirmLabel={t('Copier')}
        confirmDisabled={copyTargets.length === 0}
      >
        <Text style={[typography.subheadline, styles.copyIntro]}>
          {t('copyDayIntro', { day: dayLabel, count: dayBlocks.length })}
        </Text>
        <DayPicker
          selected={copyTargets}
          onChange={setCopyTargets}
          locked={[selectedDay]}
        />
        <Text style={[typography.footnote, styles.copyWarning]}>
          {t('Les créneaux déjà présents sur les jours choisis seront remplacés.')}
        </Text>
      </Sheet>
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
  freeDay: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  freeDayTitle: {
    marginTop: 10,
  },
  freeDayText: {
    marginTop: 4,
    textAlign: 'center',
  },
  freeDayAction: {
    marginTop: 18,
  },
  copyIntro: {
    paddingHorizontal: 32,
    paddingBottom: 16,
  },
  copyWarning: {
    paddingHorizontal: 32,
    paddingTop: 12,
  },
});
