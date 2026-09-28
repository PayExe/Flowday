import { useState } from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Symbol, SymbolNames } from './Symbol';

interface PageInfoProps {
  title: string;
  description: string;
  points: string[];
}

export function PageInfo({ title, description, points }: PageInfoProps) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Aide : ${title}`}
        style={({ pressed }) => ({
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: pressed ? colors.bg.hover : colors.bg.secondary,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: colors.separator.default,
        })}
      >
        <Symbol name={SymbolNames.info} size={16} color={colors.text.secondary} />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable
            style={[styles.card, { backgroundColor: colors.bg.elevated }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.header}>
              <View style={[styles.iconCircle, { backgroundColor: colors.system.blue }]}>
                <Symbol name={SymbolNames.info} size={18} color={colors.text.inverse} />
              </View>
              <Text style={[styles.title, { color: colors.text.primary }]}>{title}</Text>
            </View>

            <Text style={[styles.description, { color: colors.text.secondary }]}>{description}</Text>

            <View style={styles.points}>
              {points.map((point, i) => (
                <View key={i} style={styles.pointRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.system.blue }]} />
                  <Text style={[styles.pointText, { color: colors.text.primary }]}>{point}</Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() => setVisible(false)}
              style={[styles.closeBtn, { backgroundColor: colors.system.blue }]}
            >
              <Text style={[styles.closeText, { color: colors.text.inverse }]}>Compris</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 21,
  },
  points: {
    marginTop: 16,
    gap: 12,
  },
  pointRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
  },
  closeBtn: {
    marginTop: 20,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
