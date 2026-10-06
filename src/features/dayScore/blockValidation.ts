interface TaskLike {
  lifeBlockId?: string;
  completed: boolean;
}

export function countBlockValidation(
  plannedLifeBlockIds: string[],
  tasks: TaskLike[]
): { validated: number; tracked: number } {
  const planned = Array.from(new Set(plannedLifeBlockIds));
  let validated = 0;
  let tracked = 0;

  for (const blockId of planned) {
    const blockTasks = tasks.filter((task) => task.lifeBlockId === blockId);
    if (blockTasks.length === 0) continue;
    tracked += 1;
    if (blockTasks.some((task) => task.completed)) validated += 1;
  }

  return { validated, tracked };
}
