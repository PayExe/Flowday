import { useEffect, useMemo } from 'react';
import { useTaskStore } from '../tasks/store';
import { useTemplateStore } from '../templates/store';
import { useLifeBlocksStore } from '../lifeBlocks/store';
import { dateKey, weekDayIndex } from '../../utils/dates';
import { countBlockValidation } from './blockValidation';
import { useDayScoreStore } from './store';

/**
 * Keeps today's task and block parts of the score in step with the data.
 * Mounted once at the root: it used to live in the Planning screen, so ticking
 * a task from Home left the block part stale until Planning was opened.
 */
export function useDayScoreSync(today: string = dateKey()) {
  const tasks = useTaskStore((state) => state.tasks);
  const getTasksForDate = useTaskStore((state) => state.getTasksForDate);
  const templates = useTemplateStore((state) => state.templates);
  const activeTemplateId = useTemplateStore((state) => state.activeTemplateId);
  const getBlocksForDay = useTemplateStore((state) => state.getBlocksForDay);
  const lifeBlocks = useLifeBlocksStore((state) => state.blocks);
  const updateTasksPercent = useDayScoreStore((state) => state.updateTasksPercent);
  const updateBlockValidation = useDayScoreStore((state) => state.updateBlockValidation);

  const activeBlockIds = useMemo(
    () => new Set(lifeBlocks.filter((block) => !block.isArchived).map((block) => block.id)),
    [lifeBlocks]
  );

  useEffect(() => {
    const todayTasks = getTasksForDate(today);
    const completed = todayTasks.filter((task) => task.completed).length;
    updateTasksPercent(today, completed, todayTasks.length);

    const plannedLifeBlockIds = getBlocksForDay(weekDayIndex())
      .map((block) => block.lifeBlockId)
      .filter((id) => activeBlockIds.has(id));
    const { validated, tracked } = countBlockValidation(plannedLifeBlockIds, todayTasks);
    updateBlockValidation(today, validated, tracked);
  }, [
    today,
    tasks,
    templates,
    activeTemplateId,
    activeBlockIds,
    getTasksForDate,
    getBlocksForDay,
    updateTasksPercent,
    updateBlockValidation,
  ]);
}
