import { useState, useCallback } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { LifeBlock, LifeBlockColor } from '../../src/types/lifeBlock';
import { LifeBlockCard } from '../../src/components/lifeBlocks/LifeBlockCard';
import { EditBlockModal } from '../../src/components/lifeBlocks/EditBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';
import { useTheme } from '../../src/theme';
import { Symbol, SymbolNames } from '../../src/components/ui/Symbol';

// ─── Helpers ─────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getBlockTimeSpent(
  block: LifeBlock,
  templateBlocks: ReturnType<typeof useTemplateStore.getState>['getTodayBlocks']
): number {
  const todayBlocks = templateBlocks();
  const blockInstances = todayBlocks.filter((b) => b.lifeBlockId === block.id);
  return blockInstances.reduce((sum, b) => {
    return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
  }, 0);
}

// ─── Screen ──────────────────────────────────────────────────

export default function BlocksScreen() {
  const { colors, typography } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LifeBlock | null>(null);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const addBlock = useLifeBlocksStore((state) => state.addBlock);
  const updateBlock = useLifeBlocksStore((state) => state.updateBlock);
  const archiveBlock = useLifeBlocksStore((state) => state.archiveBlock);
  const unarchiveBlock = useLifeBlocksStore((state) => state.unarchiveBlock);
  const reorderBlock = useLifeBlocksStore((state) => state.reorderBlock);
  const getActiveBlocks = useLifeBlocksStore((state) => state.getActiveBlocks);

  const getTodayBlocks = useTemplateStore((state) => state.getTodayBlocks);

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
      archiveBlock(editingBlock.id);
      setModalVisible(false);
    }
  }, [editingBlock, archiveBlock]);

  const handleUnarchive = useCallback(() => {
    if (editingBlock) {
      unarchiveBlock(editingBlock.id);
      setModalVisible(false);
    }
  }, [editingBlock, unarchiveBlock]);

  const renderActiveBlock = useCallback(
    ({ item, index }: { item: LifeBlock; index: number }) => {
      const timeSpent = getBlockTimeSpent(item, getTodayBlocks);
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
    [activeBlocks.length, getTodayBlocks, handleEdit, archiveBlock, reorderBlock]
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg.primary }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Blocs</Text>
            <Text style={[typography.subheadline, { color: colors.text.secondary }]}>
              {activeBlocks.length} bloc{activeBlocks.length !== 1 ? 's' : ''} actif
              {activeBlocks.length !== 1 ? 's' : ''}
            </Text>
          </View>
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

      {/* Active Blocks List */}
      <FlatList
        data={activeBlocks}
        keyExtractor={(item) => item.id}
        renderItem={renderActiveBlock}
        contentContainerStyle={styles.listContent}
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

      {/* Modal */}
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
