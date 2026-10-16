import { useEffect, useMemo, useState } from 'react';
import { useTemplateStore } from '../templates/store';
import { useLifeBlocksStore } from '../lifeBlocks/store';
import { useBlockLogStore } from '../blockLogs/store';
import { blockFidelity } from '../blockLogs/lived';
import { dateKey, weekDayIndex } from '../../utils/dates';
import { currentMinutes, timeToMinutes } from '../../utils/time';
import { useDayScoreStore } from './store';

export function useDayScoreSync(today: string = dateKey()) {
  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const getBlocksForDay = useTemplateStore((state) => state.getBlocksForDay);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);
  const logs = useBlockLogStore((state) => state.logs);
  const updateFidelity = useDayScoreStore((state) => state.updateFidelity);

  const [nowMinutes, setNowMinutes] = useState(currentMinutes);
  useEffect(() => {
    const timer = setInterval(() => setNowMinutes(currentMinutes()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const activeBlockIds = useMemo(
    () => new Set(lifeBlocks.filter((block) => !block.isArchived).map((block) => block.id)),
    [lifeBlocks]
  );

  useEffect(() => {
    const slots = getBlocksForDay(weekDayIndex())
      .filter((block) => activeBlockIds.has(block.lifeBlockId))
      .map((block) => ({ templateBlockId: block.id, endMinutes: timeToMinutes(block.endTime) }));
    const todayLogs = logs.filter((log) => log.date === today);
    const { validated, tracked } = blockFidelity(slots, todayLogs, nowMinutes);
    updateFidelity(today, validated, tracked);
  }, [today, nowMinutes, logs, templates, activeTemplateId, activeBlockIds, getBlocksForDay, updateFidelity]);
}
