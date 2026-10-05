import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { IconTile, List, Row } from '../ui/List';
import { SymbolNames } from '../ui/Symbol';

/** Invitation to run the Morning Ritual, shown until it is done. */
export function RitualPrompt() {
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <List>
      <Row
        leading={<IconTile color={colors.system.orange} symbol={SymbolNames.sun} solid />}
        title={t('Commencer la journée')}
        subtitle={t('Morning Ritual · 5 étapes')}
        chevron
        onPress={() => router.push('/morning-ritual')}
      />
    </List>
  );
}
