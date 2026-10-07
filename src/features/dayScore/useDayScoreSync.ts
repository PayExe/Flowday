import { useEffect, useMemo, useState } from 'react';
import { useTaskStore } from '../tasks/store';
import { useTemplateStore } from '../templates/store';
import { useLifeBlocksStore } from '../lifeBlocks/store';
import { useBlockLogStore } from '../blockLogs/store';
import { blockFidelity } from '../blockLogs/lived';
import { dateKey, weekDayIndex } from '../../utils/dates';
import { timeToMinutes } from '../../utils/time';
import { useDayScoreStore } from './store';

function currentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Keeps today's task and block parts of the score in step with the data.
 * Mounted once at the root so it runs whichever screen the change came from.
 * Blocks are judged on what was lived (their logs), not on tasks.
 */
export function useDayScoreSync(today: string = dateKey()) {
  const tasks = useTaskStore((state) => state.tasks);
  const getTasksForDate = useTaskStore((state) => state.getTasksForDate);
  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const getBlocksForDay = useTemplateStore((state) => state.getBlocksForDay);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);
  const logs = useBlockLogStore((state) => state.logs);
  const updateTasksPercent = useDayScoreStore((state) => state.updateTasksPercent);
  const updateBlockValidation = useDayScoreStore((state) => state.updateBlockValidation);

  // Slots that end while the app is open must start counting without user action.
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
    const todayTasks = getTasksForDate(today);
    const completed = todayTasks.filter((task) => task.completed).length;
    updateTasksPercent(today, completed, todayTasks.length);
  }, [today, tasks, getTasksForDate, updateTasksPercent]);

  useEffect(() => {
    const slots = getBlocksForDay(weekDayIndex())
      .filter((block) => activeBlockIds.has(block.lifeBlockId))
      .map((block) => ({ templateBlockId: block.id, endMinutes: timeToMinutes(block.endTime) }));
    const todayLogs = logs.filter((log) => log.date === today);
    const { validated, tracked } = blockFidelity(slots, todayLogs, nowMinutes);
    updateBlockValidation(today, validated, tracked);
  }, [today, nowMinutes, logs, templates, activeTemplateId, activeBlockIds, getBlocksForDay, updateBlockValidation]);
}
