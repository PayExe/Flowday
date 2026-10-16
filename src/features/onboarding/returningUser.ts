interface SavedData {
  tasks: readonly unknown[];
  ritualLogs: readonly unknown[];
  lifeBlocks: readonly { id: string }[];
}

export function isReturningUser({ tasks, ritualLogs, lifeBlocks }: SavedData): boolean {
  return (
    tasks.length > 0 ||
    ritualLogs.length > 0 ||
    lifeBlocks.some((block) => !block.id.startsWith('default-'))
  );
}
