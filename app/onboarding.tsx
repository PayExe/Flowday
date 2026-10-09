import { useMemo, useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useLifeBlocksStore } from '../src/features/lifeBlocks/store';
import { useTemplateStore } from '../src/features/templates/store';
import { useRitualStore } from '../src/features/rituals/store';
import { useNotificationStore } from '../src/features/notifications/store';
import { requestPermission } from '../src/features/notifications/service';
import { useOnboardingStore } from '../src/features/onboarding/store';
import { useTheme } from '../src/theme';
import { hapticLight, hapticSuccess } from '../src/utils/haptics';
import { useTranslation } from '../src/i18n';
import { Button } from '../src/components/ui/Glass';
import { Checkbox } from '../src/components/ui/Checkbox';
import { IconTile, List, Row, SectionFooter } from '../src/components/ui/List';
import { Symbol } from '../src/components/ui/Symbol';
import { TimeField } from '../src/components/ui/TimeField';
import { RitualScaffold, StepHeading } from '../src/components/rituals/RitualScaffold';

type Step = 'welcome' | 'blocks' | 'rituals' | 'notifications';
const STEPS: Step[] = ['welcome', 'blocks', 'rituals', 'notifications'];

const FEATURES = [
  {
    symbol: 'square.grid.2x2.fill',
    color: '#0A84FF',
    title: 'Blocs de vie',
    subtitle: 'Les grands domaines de ta vie : travail, sport, repos…',
  },
  {
    symbol: 'calendar',
    color: '#BF5AF2',
    title: 'Semaine type',
    subtitle: 'Un planning qui se répète, à ajuster quand tu veux.',
  },
  {
    symbol: 'chart.pie.fill',
    color: '#30D158',
    title: 'Score du jour',
    subtitle: 'Blocs, tâches, focus et rituels résumés en un chiffre sur 100.',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, typography } = useTheme();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);

  const blocks = useLifeBlocksStore((state) => state.blocks);
  const archiveBlock = useLifeBlocksStore((state) => state.archiveBlock);
  const removeBlocksForLifeBlocks = useTemplateStore((state) => state.removeBlocksForLifeBlocks);
  const morningConfig = useRitualStore((state) => state.morningConfig);
  const eveningConfig = useRitualStore((state) => state.eveningConfig);
  const updateMorningConfig = useRitualStore((state) => state.updateMorningConfig);
  const updateEveningConfig = useRitualStore((state) => state.updateEveningConfig);
  const setPermission = useNotificationStore((state) => state.setPermission);
  const markPermissionRequested = useNotificationStore((state) => state.markPermissionRequested);
  const complete = useOnboardingStore((state) => state.complete);

  const activeBlocks = useMemo(
    () => blocks.filter((block) => !block.isArchived).sort((a, b) => a.order - b.order),
    [blocks]
  );
  const [declined, setDeclined] = useState<Set<string>>(() => new Set());
  const keptCount = activeBlocks.filter((block) => !declined.has(block.id)).length;

  const current = STEPS[step - 1];

  const toggleBlock = (id: string) => {
    hapticLight();
    setDeclined((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const finish = () => {
    const removed = keptCount === 0
      ? []
      : activeBlocks.filter((block) => declined.has(block.id)).map((block) => block.id);
    removed.forEach(archiveBlock);
    if (removed.length > 0) removeBlocksForLifeBlocks(removed);
    complete();
    hapticSuccess();
    router.replace('/');
  };

  const enableReminders = async () => {
    const granted = await requestPermission();
    markPermissionRequested();
    setPermission(granted);
    finish();
  };

  const next = () => {
    hapticLight();
    if (current === 'notifications') {
      void enableReminders();
      return;
    }
    setStep(step + 1);
  };

  const renderWelcome = () => (
    <>
      <Animated.View entering={FadeIn.duration(400)} style={styles.hero}>
        <IconTile color={colors.accent} symbol="sun.horizon.fill" size={92} solid />
      </Animated.View>
      <StepHeading
        title={t('Bienvenue sur Flowday')}
        subtitle={t('Planifie ta semaine, avance bloc par bloc et mesure chaque journée.')}
      />
      <List separatorInset={64}>
        {FEATURES.map((feature, index) => (
          <Animated.View key={feature.title} entering={FadeInDown.delay(150 + index * 90).duration(350)}>
            <Row
              leading={<IconTile color={feature.color} symbol={feature.symbol} size={36} solid />}
              title={t(feature.title)}
              subtitle={t(feature.subtitle)}
            />
          </Animated.View>
        ))}
      </List>
    </>
  );

  const renderBlocks = () => (
    <>
      <StepHeading
        title={t('Tes blocs de vie')}
        subtitle={t('Garde ceux qui te parlent. Tu pourras les modifier ou en créer d’autres.')}
      />
      <List separatorInset={64}>
        {activeBlocks.map((block) => {
          const kept = !declined.has(block.id);
          return (
            <Row
              key={block.id}
              leading={<IconTile color={block.color} emoji={block.emoji} size={36} />}
              title={block.name}
              onPress={() => toggleBlock(block.id)}
              accessibilityLabel={block.name}
              trailing={
                <Checkbox checked={kept} onToggle={() => toggleBlock(block.id)} accessibilityLabel={block.name} />
              }
            />
          );
        })}
      </List>
      <SectionFooter>
        {keptCount === 0 ? t('Garde au moins un bloc pour commencer.') : t('blocksKeptCount', { count: keptCount })}
      </SectionFooter>
    </>
  );

  const renderRituals = () => (
    <>
      <StepHeading
        title={t('Tes rituels')}
        subtitle={t('Deux minutes le matin pour lancer la journée, et le soir pour la clôturer.')}
      />
      <List separatorInset={64}>
        <Row
          leading={<IconTile color={colors.system.orange} symbol="sun.max.fill" size={36} solid />}
          title={t('Morning Ritual')}
          trailing={
            <Switch
              value={morningConfig.enabled}
              onValueChange={(enabled) => updateMorningConfig({ enabled })}
              trackColor={{ true: colors.system.green }}
              accessibilityLabel={`${t('Activer')} ${t('Morning Ritual')}`}
            />
          }
        />
        {morningConfig.enabled && (
          <Row
            leading={<IconTile color={colors.system.gray} symbol="clock" size={36} solid />}
            title={t('Heure')}
            trailing={
              <TimeField
                value={morningConfig.time}
                onChange={(time) => updateMorningConfig({ time })}
                accessibilityLabel={t('Heure du Morning Ritual')}
              />
            }
          />
        )}
      </List>
      <View style={styles.gap} />
      <List separatorInset={64}>
        <Row
          leading={<IconTile color={colors.system.indigo} symbol="moon.fill" size={36} solid />}
          title={t('Evening Wrap')}
          trailing={
            <Switch
              value={eveningConfig.enabled}
              onValueChange={(enabled) => updateEveningConfig({ enabled })}
              trackColor={{ true: colors.system.green }}
              accessibilityLabel={`${t('Activer')} ${t('Evening Wrap')}`}
            />
          }
        />
        {eveningConfig.enabled && (
          <Row
            leading={<IconTile color={colors.system.gray} symbol="clock" size={36} solid />}
            title={t('Heure')}
            trailing={
              <TimeField
                value={eveningConfig.time}
                onChange={(time) => updateEveningConfig({ time })}
                accessibilityLabel={t("Heure de l'Evening Wrap")}
              />
            }
          />
        )}
      </List>
    </>
  );

  const renderNotifications = () => (
    <>
      <View style={styles.hero}>
        <Symbol
          name="bell.badge.fill"
          size={84}
          color={colors.system.red}
          animationSpec={{ effect: { type: 'bounce', wholeSymbol: true } }}
        />
      </View>
      <StepHeading
        title={t('Reste dans le rythme')}
        subtitle={t('Flowday te rappelle tes rituels à l’heure choisie. Rien d’autre, pas de spam.')}
      />
      <Text style={[typography.footnote, styles.note, { color: colors.text.tertiary }]}>
        {t('Tu peux changer ça à tout moment dans les Réglages.')}
      </Text>
    </>
  );

  return (
    <RitualScaffold
      step={step}
      stepCount={STEPS.length}
      leading={
        current === 'welcome' ? undefined : (
          <Button title={t('Passer')} variant="plain" style={styles.skip} onPress={finish} />
        )
      }
      onBack={step > 1 ? () => setStep(step - 1) : undefined}
      primaryTitle={
        current === 'welcome'
          ? t('Commencer')
          : current === 'notifications'
            ? t('Activer les rappels')
            : t('Suivant')
      }
      onPrimary={next}
      primaryDisabled={current === 'blocks' && keptCount === 0}
      secondary={
        current === 'notifications' ? (
          <Button title={t('Plus tard')} variant="plain" onPress={finish} />
        ) : undefined
      }
    >
      <Animated.View key={current} entering={FadeIn.duration(250)}>
        {current === 'welcome' && renderWelcome()}
        {current === 'blocks' && renderBlocks()}
        {current === 'rituals' && renderRituals()}
        {current === 'notifications' && renderNotifications()}
      </Animated.View>
    </RitualScaffold>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    marginBottom: 24,
  },
  skip: {
    marginLeft: -14,
  },
  gap: {
    height: 20,
  },
  note: {
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
