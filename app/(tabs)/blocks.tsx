import { useState, useCallback } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOut, LayoutAnimationConfig } from 'react-native-reanimated';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { LifeBlock, LifeBlockColor } from '../../src/types/lifeBlock';
import { TemplateBlock } from '../../src/types/template';
import { LifeBlockCard } from '../../src/components/lifeBlocks/LifeBlockCard';
import { EditBlockModal } from '../../src/components/lifeBlocks/EditBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { useTheme } from '../../src/theme';
import { hapticLight, hapticWarning } from '../../src/utils/haptics';
import { timeToMinutes } from '../../src/utils/time';
import { PageInfo } from '../../src/components/ui/PageInfo';
import { Button, IconButton } from '../../src/components/ui/Glass';
import { IconTile, List, ROW_TRANSITION, Row, SectionHeader } from '../../src/components/ui/List';
import { Screen } from '../../src/components/ui/Screen';
import { SymbolNames } from '../../src/components/ui/Symbol';
import { useTranslation } from '../../src/i18n';


function getWeeklyMinutes(
  blockId: string,
  getBlocksForDay: (dayOfWeek: number) => TemplateBlock[]
): number {
  let total = 0;
  for (let day = 0; day < 7; day++) {
    for (const b of getBlocksForDay(day)) {
      if (b.lifeBlockId === blockId) {
        total += timeToMinutes(b.endTime) - timeToMinutes(b.startTime);
      }
    }
  }
  return total;
}


export default function BlocksScreen() {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LifeBlock | null>(null);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const addBlock = useLifeBlocksStore((state) => state.addBlock);
  const updateBlock = useLifeBlocksStore((state) => state.updateBlock);
  const archiveBlock = useLifeBlocksStore((state) => state.archiveBlock);
  const unarchiveBlock = useLifeBlocksStore((state) => state.unarchiveBlock);
  const reorderBlock = useLifeBlocksStore((state) => state.reorderBlock);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);

  const getBlocksForDay = useTemplateStore((state) => state.getBlocksForDay);
  useTemplateStore((state) => state.templates);

  const activeBlocks = getActiveBlocks();
  const archivedBlocks = blocks.filter((b) => b.isArchived);

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
        title={t('Blocs')}
        subtitle={t('activeBlocksCount', { count: activeBlocks.length })}
        actions={
          <>
            <PageInfo
              title={t('Blocs de vie')}
              description={t('Tes grands domaines de vie (travail, sport, santé…) et leur objectif hebdomadaire.')}
              points={[
                t('La barre montre ton temps planifié cette semaine par rapport à l’objectif.'),
                t('Appuie sur un bloc pour le modifier ou l’archiver.'),
                t('Le bouton ••• permet de réordonner ou d’archiver un bloc.'),
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
          <LayoutAnimationConfig skipEntering>
            <View style={styles.list}>
              {activeBlocks.map((block, index) => {
                const timeSpent = getWeeklyMinutes(block.id, getBlocksForDay);
                const progress =
                  block.weeklyGoalMinutes > 0
                    ? (timeSpent / block.weeklyGoalMinutes) * 100
                    : 0;

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
                      timeSpentMinutes={timeSpent}
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
  list: {
    marginTop: 8,
  },
});
