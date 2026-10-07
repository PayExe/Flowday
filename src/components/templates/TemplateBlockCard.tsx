import { TemplateBlock } from '../../types/template';
import { LifeBlock } from '../../types/lifeBlock';
import { useTheme } from '../../theme';
import { useTranslation } from '../../i18n';
import { formatDuration, timeToMinutes } from '../../utils/time';
import { IconTile, Row } from '../ui/List';

interface TemplateBlockCardProps {
  block: TemplateBlock;
  lifeBlock: LifeBlock | undefined;
  onPress: () => void;
}

export function TemplateBlockCard({ block, lifeBlock, onPress }: TemplateBlockCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const duration = formatDuration(timeToMinutes(block.endTime) - timeToMinutes(block.startTime));

  return (
    <Row
      onPress={onPress}
      leading={<IconTile color={lifeBlock?.color || colors.system.gray} emoji={lifeBlock?.emoji || '⬜'} />}
      title={block.title || lifeBlock?.name || t('Bloc')}
      subtitle={`${block.startTime} – ${block.endTime} · ${duration}${block.isFlexible ? ` · ${t('Flex')}` : ''}`}
      chevron
    />
  );
}
