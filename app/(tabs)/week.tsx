import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { TemplateBlock } from '../../src/types/template';
import { Colors, Spacing, Radius, Typography } from '../../src/theme';
import { TemplateBlockCard } from '../../src/components/templates/TemplateBlockCard';
import { EditTemplateBlockModal } from '../../src/components/templates/EditTemplateBlockModal';
import { EmptyState } from '../../src/components/shared/EmptyState';

const DAY_LABELS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export default function WeekScreen() {
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

  // Create default template if none exists (but NOT during render)
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

  // Calcul temps total planifié dans la semaine
  const totalPlannedMinutes = useMemo(() => {
    if (!template) return 0;
    return template.blocks.reduce((sum, b) => {
      return sum + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime));
    }, 0);
  }, [template]);

  const formatDuration = (min: number): string => {
    const h = Math.floor(min / 60);
    return `${h}h`;
  };

  if (lifeBlocks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Semaine</Text>
          <Text style={styles.headerSubtitle}>
            Définis ton template hebdomadaire
          </Text>
        </View>
        <EmptyState
          icon="cube-outline"
          title="Aucun Life Block"
          subtitle="Crée d'abord des blocs de vie dans l'onglet Blocs"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.headerTitle}>Semaine</Text>
            <Text style={styles.headerSubtitle}>
              {template?.name || 'Template'}
            </Text>
          </View>
        </View>
        {totalPlannedMinutes > 0 && (
          <Text style={styles.totalTime}>
            {formatDuration(totalPlannedMinutes)} planifiées cette semaine
          </Text>
        )}
      </View>

      {/* Days */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {DAY_LABELS.map((dayLabel, dayIndex) => {
          const dayBlocks = template
            ? getBlocksForDay(dayIndex).sort((a, b) =>
                a.startTime.localeCompare(b.startTime)
              )
            : [];

          return (
            <View key={dayIndex} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dayLabel}</Text>
                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => handleCreate(dayIndex)}
                >
                  <Ionicons name="add" size={18} color={Colors.accentCyan} />
                </TouchableOpacity>
              </View>

              {dayBlocks.length === 0 ? (
                <TouchableOpacity
                  style={styles.emptyDay}
                  onPress={() => handleCreate(dayIndex)}
                >
                  <Text style={styles.emptyDayText}>Ajouter un créneau</Text>
                </TouchableOpacity>
              ) : (
                dayBlocks.map((block) => {
                  const lifeBlock = lifeBlocks.find(
                    (lb) => lb.id === block.lifeBlockId
                  );
                  return (
                    <TemplateBlockCard
                      key={block.id}
                      block={block}
                      lifeBlock={lifeBlock}
                      onPress={() => handleEdit(block)}
                    />
                  );
                })
              )}
            </View>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal */}
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
  totalTime: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  daySection: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dayTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyDay: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
});
