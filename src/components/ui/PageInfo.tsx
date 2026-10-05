import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { SymbolNames } from './Symbol';
import { useTranslation } from '../../i18n';
import { Button, IconButton } from './Glass';
import { Card, IconTile } from './List';
import { Sheet } from './Sheet';

interface PageInfoProps {
  title: string;
  description: string;
  points: string[];
}

export function PageInfo({ title, description, points }: PageInfoProps) {
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <IconButton
        symbol={SymbolNames.question}
        onPress={() => setVisible(true)}
        accessibilityLabel={`${t('Aide :')} ${title}`}
      />

      <Sheet visible={visible} title={t('Aide')} onClose={() => setVisible(false)}>
        <View style={styles.intro}>
          <Text style={typography.title1}>{title}</Text>
          <Text style={[typography.body, styles.description, { color: colors.text.secondary }]}>
            {description}
          </Text>
        </View>

        <Card padded style={styles.points}>
          {points.map((point, i) => (
            <View key={i} style={styles.pointRow}>
              <IconTile color={colors.accent} symbol={SymbolNames.checkmark} size={28} />
              <Text style={[typography.callout, styles.pointText]}>{point}</Text>
            </View>
          ))}
        </Card>

        <Button title={t('Compris')} onPress={() => setVisible(false)} style={styles.button} />
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  intro: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  description: {
    marginTop: 8,
    lineHeight: 23,
  },
  points: {
    marginTop: 24,
    gap: 16,
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointText: {
    flex: 1,
    lineHeight: 21,
  },
  button: {
    marginTop: 24,
    marginHorizontal: 16,
  },
});
