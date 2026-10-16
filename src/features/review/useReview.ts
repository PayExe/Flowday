import { useMemo } from 'react';
import { useLifeBlocksStore } from '../lifeBlocks/store';
import { useTemplateStore } from '../templates/store';
import { useBlockLogStore } from '../blockLogs/store';
import { useFocusStore } from '../focus/store';
import { focusCredits } from '../blockLogs/lived';
import { dateKey } from '../../utils/dates';
import { currentMinutes } from '../../utils/time';
import { DomainReview, PeriodRange, reviewByBlock } from './review';

export function useReview(range: PeriodRange): Record<string, DomainReview> {
  const blocks = useLifeBlocksStore((state) => state.blocks);
  const templates = useTemplateStore((state) => state.templates);
  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const logs = useBlockLogStore((state) => state.logs);
  const sessions = useFocusStore((state) => state.sessions);

  const today = dateKey();
  const nowMinutes = currentMinutes();
  const focus = useMemo(() => focusCredits(sessions), [sessions]);

  return useMemo(() => {
    const activeIds = new Set(blocks.filter((block) => !block.isArchived).map((block) => block.id));
    const slots = (getActiveTemplate()?.blocks ?? []).filter((slot) => activeIds.has(slot.lifeBlockId));
    const review = reviewByBlock({ slots, logs, focus, range, today, nowMinutes });
    return Object.fromEntries(Object.entries(review).filter(([lifeBlockId]) => activeIds.has(lifeBlockId)));
  }, [blocks, templates, getActiveTemplate, logs, focus, range, today, nowMinutes]);
}
