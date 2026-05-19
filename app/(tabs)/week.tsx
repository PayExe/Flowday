import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTemplateStore } from '../../src/features/templates/store';
import { useLifeBlocksStore } from '../../src/features/lifeBlocks/store';
import { TemplateBlock } from '../../src/types/template';
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
        <View style={styles.headerTop}>
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
            <View key={dayIndex} style={{ marginBottom: 24 }}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayTitle}>{dayLabel}</Text>
                <Pressable
                  style={({ pressed }) => ({
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    backgroundColor: pressed ? '#2C2C2E' : '#1C1C1E',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1,
                    borderColor: '#38383A',
                  })}
                  onPress={() => handleCreate(dayIndex)}
                >
                  <Ionicons name="add" size={16} color="#0A84FF" />
                </Pressable>
              </View>

              {dayBlocks.length === 0 ? null : (
                <View
                  style={{
                    backgroundColor: '#1C1C1E',
                    borderRadius: 13,
                    marginHorizontal: 16,
                    overflow: 'hidden',
                  }}
                >
                  {dayBlocks.map((block, index) => {
                    const lifeBlock = lifeBlocks.find(
                      (lb) => lb.id === block.lifeBlockId
                    );
                    return (
                      <View key={block.id}>
                        <TemplateBlockCard
                          block={block}
                          lifeBlock={lifeBlock}
                          onPress={() => handleEdit(block)}
                        />
                        {index < dayBlocks.length - 1 && (
                          <View style={{ height: 0.5, backgroundColor: '#54545899', marginLeft: 57 }} />
                        )}
                      </View>
                    );
                  })}
                </View>
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
    backgroundColor: '#000000',
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
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.37,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#EBEBF599',
    marginTop: 2,
  },
  totalTime: {
    fontSize: 13,
    color: '#EBEBF54D',
    marginTop: 8,
  },
  scroll: {
    flex: 1,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.38,
  },
});
