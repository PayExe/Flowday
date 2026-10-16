import { useState, useCallback, useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useDayScoreStore } from '../../src/features/dayScore/store';
import {
  averageScore,
  balancePercent,
  buildWeekScore,
  largestGap,
  periodDays,
  periodRange,
  ReviewPeriod,
} from '../../src/features/review/review';
import { useReview } from '../../src/features/review/useReview';
import { dateKey } from '../../src/utils/dates';
import { LifeBlock, LifeBlockColor } from '../../src/types/lifeBlock';
import { LifeBlockCard } from '../../src/components/lifeBlocks/LifeBlockCard';
import { PeriodNavigator } from '../../src/components/review/PeriodNavigator';
import { EditBlockModal } from '../../src/components/lifeBlocks/EditBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { useTheme } from '../../src/theme';
import { hapticLight, hapticWarning } from '../../src/utils/haptics';
import { formatDuration } from '../../src/utils/time';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { Button, IconButton } from '../../src/components/ui/Glass';
import { Card, IconTile, List, ROW_TRANSITION, Row, SectionFooter, SectionHeader } from '../../src/components/ui/List';
import { SegmentedControl } from '../../src/components/ui/SegmentedControl';
import { Screen } from '../../src/components/ui/Screen';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
import { useTranslation } from '../../src/i18n';


export default function BlocksScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LifeBlock | null>(null);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const addBlock = useLifeBlocksStore((state) => state.addBlock);
  const updateBlock = useLifeBlocksStore((state) => state.updateBlock);
  const archiveBlock = useLifeBlocksStore((state) => state.archiveBlock);
  const unarchiveBlock = useLifeBlocksStore((state) => state.unarchiveBlock);
  const reorderBlock = useLifeBlocksStore((state) => state.reorderBlock);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);

  const scores = useDayScoreStore((state) => state.scores);

  const [period, setPeriod] = useState<ReviewPeriod>('week');
  const [offset, setOffset] = useState(0);
  const today = dateKey();
  const range = useMemo(() => periodRange(period, offset, today), [period, offset, today]);
  const { domains: review, measured } = useReview(range);
  const balance = balancePercent(review);

  const fidelitySummary = useMemo(() => {
    if (period === 'week') {
      const week = buildWeekScore(scores, range.from);
      return week && { average: week.averageDayScore, previous: week.previousWeekAverage };
    }
    const average = averageScore(scores, range);
    return average === null ? null : { average, previous: averageScore(scores, periodRange('month', offset - 1, today)) };
  }, [period, offset, today, range, scores]);

  const activeBlocks = getActiveBlocks();
  const archivedBlocks = blocks.filter((b) => b.isArchived);
  const totals = Object.values(review).reduce(
    (sum, domain) => ({
      planned: sum.planned + domain.plannedMinutes,
      lived: sum.lived + domain.livedMinutes,
      unrated: sum.unrated + domain.unratedMinutes,
    }),
    { planned: 0, lived: 0, unrated: 0 }
  );
  const gap = largestGap(review);
  const gapBlock = gap && activeBlocks.find((block) => block.id === gap.lifeBlockId);
  const delta = fidelitySummary?.previous != null ? fidelitySummary.average - fidelitySummary.previous : null;

  const handleCreate = useCallback(() => {
    setEditingBlock(null);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((block: LifeBlock) => {
    setEditingBlock(block);
    setModalVisible(true);
  }, []);

  const handleSave = useCallback(
    (data: {
      name: string;
      emoji: string;
      color: LifeBlockColor;
      weeklyGoalMinutes: number;
    }) => {
      hapticLight();
      if (editingBlock) {
        updateBlock(editingBlock.id, data);
      } else {
        addBlock({
          ...data,
          isArchived: false,
        });
      }
      setModalVisible(false);
    },
    [editingBlock, addBlock, updateBlock]
  );

  const handleArchive = useCallback(() => {
    if (editingBlock) {
      hapticWarning();
      archiveBlock(editingBlock.id);
      setModalVisible(false);
    }
  }, [editingBlock, archiveBlock]);

  const handleUnarchive = useCallback(() => {
    if (editingBlock) {
      hapticLight();
      unarchiveBlock(editingBlock.id);
      setModalVisible(false);
    }
  }, [editingBlock, unarchiveBlock]);

  return (
    <>
      <Screen
        title={t('Bilan')}
        actions={
          <>
            <PageInfo
              title={t('Bilan')}
              description={t('Ce que tu avais prévu, face à ce que tu as vécu, pour chaque domaine de ta vie.')}
              points={[
                t('Le prévu vient de ta semaine type, le vécu de tes blocs validés et de tes sessions Focus.'),
                t('Un créneau sans réponse est compté à part, comme non renseigné.'),
                t('Appuie sur un domaine pour le modifier, ou sur ••• pour le réordonner ou l’archiver.'),
              ]}
            />
            <IconButton
              symbol={SymbolNames.add}
              onPress={handleCreate}
              accessibilityLabel={t('Ajouter un bloc de vie')}
              prominent
            />
          </>
        }
      >
        {activeBlocks.length === 0 ? (
          <EmptyState
            icon={SymbolNames.blocks}
            title={t('Aucun Life Block')}
            subtitle={t('Aucun bloc de vie pour le moment')}
            action={<Button title={t('Créer un bloc de vie')} onPress={handleCreate} />}
          />
        ) : (
          <>
            <View style={styles.periodPicker}>
              <SegmentedControl
                options={[
                  { value: 'week', label: t('Semaine') },
                  { value: 'month', label: t('Mois') },
                ]}
                value={period}
                onChange={(next) => {
                  setPeriod(next);
                  setOffset(0);
                }}
              />
            </View>
            <PeriodNavigator period={period} offset={offset} range={range} onChange={setOffset} />

            <Card padded style={styles.summary}>
              {totals.planned > 0 || totals.lived > 0 ? (
                <>
                  <Text style={[typography.title1, styles.tabular]}>{formatDuration(totals.lived)}</Text>
                  <Text style={typography.footnote}>
                    {totals.planned > 0
                      ? t('livedOfPlannedTotal', { planned: formatDuration(totals.planned) })
                      : t('Vécu, sans rien de prévu')}
                  </Text>
                  {totals.unrated > 0 && (
                    <Text style={[typography.caption, styles.summaryLine, { color: colors.text.secondary }]}>
                      {t('unratedDuration', { duration: formatDuration(totals.unrated) })}
                    </Text>
                  )}
                </>
              ) : (
                <Text style={typography.footnote}>
                  {t('Rien de mesuré sur cette période. Valide tes blocs ou lance un Focus : ton vécu apparaîtra ici.')}
                </Text>
              )}
              {(fidelitySummary || balance !== null) && (
                <View style={[styles.divider, { backgroundColor: colors.separator.hairline }]} />
              )}
              {fidelitySummary && (
                <Text style={typography.body}>
                  {t('averageFidelity', { score: fidelitySummary.average })}
                  {delta !== null && (
                    <Text style={[typography.footnote, { color: colors.text.secondary }]}>
                      {`  ${t(period === 'week' ? 'vsPreviousWeek' : 'vsPreviousMonth', {
                        delta: delta > 0 ? `+${delta}` : `${delta}`,
                      })}`}
                    </Text>
                  )}
                </Text>
              )}
              {balance !== null && (
                <Text style={[typography.body, fidelitySummary && styles.summaryLine]}>
                  {t('balanceValue', { score: balance })}
                </Text>
              )}
            </Card>

            {gap && gapBlock && (
              <Card style={styles.insight}>
                <Pressable
                  onPress={() => {
                    hapticLight();
                    router.push('/week');
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => [
                    styles.insightContent,
                    { backgroundColor: pressed ? colors.bg.hover : 'transparent' },
                  ]}
                >
                  <Text style={typography.body}>
                    {t('gapInsight', {
                      name: `${gapBlock.emoji} ${gapBlock.name}`.trim(),
                      lived: formatDuration(gap.livedMinutes),
                      planned: formatDuration(gap.plannedMinutes),
                    })}
                  </Text>
                  <View style={styles.insightAction}>
                    <Text style={[typography.subheadline, { color: colors.accent }]}>
                      {t('Ajuster la semaine type')}
                    </Text>
                    <Symbol name={SymbolNames.chevronRight} size={12} weight="semibold" color={colors.accent} />
                  </View>
                </Pressable>
              </Card>
            )}

            <SectionHeader title={t('Domaines')} />
            <LayoutAnimationConfig skipEntering>
              <View>
                {activeBlocks.map((block, index) => {
                  const domain = review[block.id];
                  const planned = domain?.plannedMinutes ?? 0;
                  const lived = domain?.livedMinutes ?? 0;
                  const goal = Math.round((block.weeklyGoalMinutes * periodDays(range)) / 7);
                  const target = planned > 0 ? planned : goal;
                  const progress = target > 0 ? (lived / target) * 100 : 0;

                  return (
                    <Animated.View
                      key={block.id}
                      entering={FadeIn.duration(220)}
                      exiting={FadeOut.duration(160)}
                      layout={ROW_TRANSITION}
                    >
                      <LifeBlockCard
                        block={block}
                        progressPercent={progress}
                        livedMinutes={lived}
                        plannedMinutes={planned}
                        unratedMinutes={domain?.unratedMinutes ?? 0}
                        measured={measured}
                        onEdit={() => handleEdit(block)}
                        onMoveUp={() => reorderBlock(block.id, 'up')}
                        onMoveDown={() => reorderBlock(block.id, 'down')}
                        onArchive={() => archiveBlock(block.id)}
                        canMoveUp={index > 0}
                        canMoveDown={index < activeBlocks.length - 1}
                      />
                    </Animated.View>
                  );
                })}
              </View>
            </LayoutAnimationConfig>
            <SectionFooter>
              {t('Le temps vécu se remplit quand tu valides tes blocs et avec tes sessions Focus.')}
            </SectionFooter>
          </>
        )}

        {archivedBlocks.length > 0 && (
          <>
            <SectionHeader title={t('Archivés')} />
            <List separatorInset={64} animated>
              {archivedBlocks.map((block) => (
                <Row
                  key={block.id}
                  leading={<IconTile color={colors.system.gray} emoji={block.emoji} />}
                  title={block.name}
                  trailing={
                    <Pressable
                      hitSlop={10}
                      accessibilityRole="button"
                      onPress={() => {
                        hapticLight();
                        unarchiveBlock(block.id);
                      }}
                    >
                      <Text style={[typography.body, { color: colors.accent }]}>{t('Restaurer')}</Text>
                    </Pressable>
                  }
                />
              ))}
            </List>
          </>
        )}
      </Screen>

      <EditBlockModal
        visible={modalVisible}
        block={editingBlock}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onArchive={editingBlock && !editingBlock.isArchived ? handleArchive : undefined}
        onUnarchive={editingBlock && editingBlock.isArchived ? handleUnarchive : undefined}
      />
    </>
  );
}

const styles = StyleSheet.create({
  periodPicker: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  summary: {
    marginTop: 12,
  },
  summaryLine: {
    marginTop: 4,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  insight: {
    marginTop: 12,
  },
  insightContent: {
    padding: 16,
    gap: 8,
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
