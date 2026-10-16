import { Task } from '../../types/task';
import { useToastStore } from '../toast/store';
import { useTaskStore } from './store';

export function offerTaskUndo(task: Task, t: (key: string) => string) {
  useToastStore.getState().show({
    message: t('Tâche supprimée'),
    symbol: 'trash',
    action: { label: t('undo'), onPress: () => useTaskStore.getState().restoreTask(task) },
  });
}
