import { Task } from '../../types/task';
import { useToastStore } from '../toast/store';
import { useTaskStore } from './store';

/**
 * Deleting is immediate; this offers the way back instead of an
 * "are you sure?" dialog in front of every delete.
 */
export function offerTaskUndo(task: Task, t: (key: string) => string) {
  useToastStore.getState().show({
    message: t('Tâche supprimée'),
    symbol: 'trash',
    action: { label: t('undo'), onPress: () => useTaskStore.getState().restoreTask(task) },
  });
}
