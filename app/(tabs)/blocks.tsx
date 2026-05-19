import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { useTaskStore } from '../../src/features/tasks/store';
import { useTemplateStore } from '../../src/features/templates/store';
import { LifeBlock, LifeBlockColor } from '../../src/types/lifeBlock';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { LifeBlockCard } from '../../src/components/lifeBlocks/LifeBlockCard';
import { EditBlockModal } from '../../src/components/lifeBlocks/EditBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';

// ─── Helpers ─────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function getBlockTimeSpent(
  block: LifeBlock,
  templateBlocks: ReturnType<typeof useTemplateStore.getState>['getTodayBlocks']
): number {
  // Pour l'instant, on calcule le temps planifié dans le template d'aujourd'hui
  // comme proxy du "temps passé" (vraie tracking viendra plus tard)
  const todayBlocks = templateBlocks();
  const blockInstances = todayBlocks.filter((b) => b.lifeBlockId === block.id);
  return blockInstances.reduce((sum, b) => {
    return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
  }, 0);
}

// ─── Screen ──────────────────────────────────────────────────

export default function BlocksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<LifeBlock | null>(null);
  const [showArchived, setShowArchived] = useState(false);

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

  const renderArchivedBlock = useCallback(
    ({ item }: { item: LifeBlock }) => (
      <TouchableOpacity
        style={styles.archivedItem}
        onPress={() => handleEdit(item)}
      >
        <View style={[styles.archivedDot, { backgroundColor: item.color }]} />
        <Text style={styles.archivedEmoji}>{item.emoji}</Text>
        <Text style={styles.archivedName}>{item.name}</Text>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.restoreBtn}
          onPress={() => unarchiveBlock(item.id)}
        >
          <Ionicons name="refresh-outline" size={16} color={Colors.accentGreen} />
          <Text style={styles.restoreText}>Restaurer</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    ),
    [handleEdit, unarchiveBlock]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Life Blocks</Text>
            <Text style={styles.headerSubtitle}>
              {activeBlocks.length} bloc{activeBlocks.length !== 1 ? 's' : ''} actif
              {activeBlocks.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleCreate}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color={Colors.bgPrimary} />
          </TouchableOpacity>
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
            <View style={styles.archivedSection}>
              <TouchableOpacity
                style={styles.archivedHeader}
                onPress={() => setShowArchived(!showArchived)}
              >
                <Text style={styles.archivedTitle}>
                  Archivés ({archivedBlocks.length})
                </Text>
                <Ionicons
                  name={showArchived ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>

              {showArchived && (
                <FlatList
                  data={archivedBlocks}
                  keyExtractor={(item) => item.id}
                  renderItem={renderArchivedBlock}
                  scrollEnabled={false}
                />
              )}
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
    backgroundColor: Colors.bgPrimary,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Typography.sizes.xxxl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  archivedSection: {
    marginTop: Spacing.xl,
    marginHorizontal: Spacing.lg,
  },
  archivedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  archivedTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  archivedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    opacity: 0.7,
  },
  archivedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  archivedEmoji: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  archivedName: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  spacer: {
    flex: 1,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  restoreText: {
    fontSize: Typography.sizes.sm,
    color: Colors.accentGreen,
    fontWeight: Typography.weights.medium,
  },
});
