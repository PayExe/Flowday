import { useMemo } from 'react';
import { useLifeBlocksStore } from '../lifeBlocks/store';
import { useTemplateStore } from '../templates/store';
import { useBlockLogStore } from '../blockLogs/store';
import { useFocusStore } from '../focus/store';
import { useOnboardingStore } from '../onboarding/store';
import { focusCredits } from '../blockLogs/lived';
import { dateKey } from '../../utils/dates';
import { currentMinutes } from '../../utils/time';
import { DomainReview, PeriodRange, reviewByBlock, trackingStart } from './review';

interface Review {
  domains: Record<string, DomainReview>;
  measured: boolean;
}

export function useReview(range: PeriodRange): Review {
  const blocks = useLifeBlocksStore((state) => state.blocks);
  const templates = useTemplateStore((state) => state.templates);
  const getActiveTemplate = useTemplateStore((state) => state.getActiveTemplate);
  const logs = useBlockLogStore((state) => state.logs);
  const sessions = useFocusStore((state) => state.sessions);
  const trackingSince = useOnboardingStore((state) => state.completedAt);

  const today = dateKey();
  const nowMinutes = currentMinutes();
  const focus = useMemo(() => focusCredits(sessions), [sessions]);

  return useMemo(() => {
    const activeIds = new Set(blocks.filter((block) => !block.isArchived).map((block) => block.id));
    const slots = (getActiveTemplate()?.blocks ?? []).filter((slot) => activeIds.has(slot.lifeBlockId));
    const review = reviewByBlock({ slots, logs, focus, range, today, nowMinutes, trackingSince });
    const start = trackingStart(logs, focus, trackingSince);
    return {
      domains: Object.fromEntries(Object.entries(review).filter(([lifeBlockId]) => activeIds.has(lifeBlockId))),
      measured: start !== null && start.day <= range.to,
    };
  }, [blocks, templates, getActiveTemplate, logs, focus, range, today, nowMinutes, trackingSince]);
}
