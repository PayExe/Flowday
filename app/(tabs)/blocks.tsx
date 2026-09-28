import { useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { LifeBlock, LifeBlockColor } from '../../src/types/lifeBlock';
import { TemplateBlock } from '../../src/types/template';
import { LifeBlockCard } from '../../src/components/lifeBlocks/LifeBlockCard';
import { EditBlockModal } from '../../src/components/lifeBlocks/EditBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { useTheme } from '../../src/theme';
import { hapticLight, hapticWarning } from '../../src/utils/haptics';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';
import { PageInfo } from '../../src/components/ui/PageInfo';


function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

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
  const insets = useSafeAreaInsets();
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
  const templates = useTemplateStore((state) => state.templates);

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
      if (editingBlock) {
        hapticLight();
        updateBlock(editingBlock.id, data);
      } else {
        hapticLight();
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

  const renderActiveBlock = useCallback(
    ({ item, index }: { item: LifeBlock; index: number }) => {
      const timeSpent = getWeeklyMinutes(item.id, getBlocksForDay);
      const progress =
        item.weeklyGoalMinutes > 0
          ? (timeSpent / item.weeklyGoalMinutes) * 100
          : 0;

      return (
        <LifeBlockCard
          block={item}
          progressPercent={progress}
          timeSpentMinutes={timeSpent}
          onEdit={() => handleEdit(item)}
          onMoveUp={() => reorderBlock(item.id, 'up')}
          onMoveDown={() => reorderBlock(item.id, 'down')}
          onArchive={() => archiveBlock(item.id)}
          canMoveUp={index > 0}
          canMoveDown={index < activeBlocks.length - 1}
        />
      );
    },
    [activeBlocks.length, templates, getBlocksForDay, handleEdit, archiveBlock, reorderBlock]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Blocs</Text>
            <Text style={[typography.subheadline, { color: colors.text.secondary }]}>
              {activeBlocks.length} bloc{activeBlocks.length !== 1 ? 's' : ''} actif
              {activeBlocks.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <PageInfo
              title="Blocs de vie"
              description="Tes grands domaines de vie (travail, sport, santé…) et leur objectif hebdomadaire."
              points={[
                'La barre montre ton temps planifié cette semaine par rapport à l’objectif.',
                'Appuie sur un bloc pour le modifier ou l’archiver.',
                'Utilise les flèches ↑ ↓ pour réordonner les blocs.',
              ]}
            />
            <Pressable
              style={({ pressed }) => ({
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: pressed ? colors.bg.hover : colors.bg.secondary,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: colors.separator.default,
              })}
              onPress={handleCreate}
            >
              <Symbol name={SymbolNames.add} size={20} color={colors.system.blue} />
            </Pressable>
          </View>
        </View>
      </View>

      <FlatList
        data={activeBlocks}
        keyExtractor={(item) => item.id}
        renderItem={renderActiveBlock}
        contentContainerStyle={[styles.listContent, { paddingBottom: 96 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Aucun Life Block"
            subtitle="Crée ton premier bloc de vie avec le bouton +"
          />
        }
        ListFooterComponent={
          archivedBlocks.length > 0 ? (
            <View style={{ marginTop: 24 }}>
              <Text style={[typography.sectionHeader, { paddingHorizontal: 32, paddingTop: 28, paddingBottom: 8 }]}>
                Archivés
              </Text>
              <View
                style={{
                  backgroundColor: colors.bg.secondary,
                  borderRadius: 13,
                  marginHorizontal: 16,
                  overflow: 'hidden',
                }}
              >
                {archivedBlocks.map((block, index) => (
                  <View key={block.id}>
                    <Pressable
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 11,
                        backgroundColor: pressed ? colors.bg.hover : 'transparent',
                        minHeight: 44,
                        opacity: 0.5,
                      })}
                      onPress={() => handleEdit(block)}
                    >
                      <View
                        style={{
                          width: 29,
                          height: 29,
                          borderRadius: 7,
                          backgroundColor: block.color,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        <Text style={{ fontSize: 16 }}>{block.emoji}</Text>
                      </View>
                      <Text style={{ flex: 1, fontSize: typography.sizes.lg, color: colors.text.primary, letterSpacing: -0.41 }}>
                        {block.name}
                      </Text>
                      <Pressable
                        onPress={() => unarchiveBlock(block.id)}
                        hitSlop={8}
                      >
                        <Text style={{ fontSize: typography.sizes.base, color: colors.system.blue }}>Restaurer</Text>
                      </Pressable>
                    </Pressable>
                    {index < archivedBlocks.length - 1 && (
                      <View style={{ height: 0.5, backgroundColor: colors.separator.hairline, marginLeft: 57 }} />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
      />

      <EditBlockModal
        visible={modalVisible}
        block={editingBlock}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onArchive={editingBlock && !editingBlock.isArchived ? handleArchive : undefined}
        onUnarchive={editingBlock && editingBlock.isArchived ? handleUnarchive : undefined}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  listContent: {
    paddingTop: 8,
    paddingBottom: 32,
  },

});
