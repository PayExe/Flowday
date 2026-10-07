interface SavedData {
  tasks: readonly unknown[];
  ritualLogs: readonly unknown[];
  lifeBlocks: readonly { id: string }[];
}

/**
 * People who used Flowday before onboarding existed already set it up: any
 * task, ritual or self-made block means this is not a first launch. Starter
 * blocks alone don't count, since they are created at every first launch.
 */
export function isReturningUser({ tasks, ritualLogs, lifeBlocks }: SavedData): boolean {
  return (
    tasks.length > 0 ||
    ritualLogs.length > 0 ||
    lifeBlocks.some((block) => !block.id.startsWith('default-'))
  );
}
