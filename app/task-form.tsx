import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useCreateTaskMutation, useGetBoardQuery, useUpdateTaskMutation } from '../src/api/api';
import type { Board, Task } from '../src/api/types';
import { ListEditor, newItem } from '../src/components/ListEditor';
import { Button, ErrorText, FormScroll, Loading, Segmented, TextField } from '../src/components/ui';
import { validateList, type ListItem } from '../src/features/listValidation';
import { useI18n } from '../src/i18n/I18nProvider';

/** Create a task (boardId [+ columnId]) or edit one (boardId + taskId). */
export default function TaskFormScreen() {
  const {
    boardId,
    taskId,
    columnId: initialColumn,
  } = useLocalSearchParams<{
    boardId: string;
    taskId?: string;
    columnId?: string;
  }>();
  const { data: board } = useGetBoardQuery(boardId);
  if (!board) return <Loading />;
  const task = taskId ? board.columns.flatMap((c) => c.tasks).find((x) => x.id === taskId) : undefined;
  return (
    <TaskForm
      key={task?.id ?? 'new'}
      boardId={boardId}
      board={board}
      task={task}
      initialColumn={initialColumn}
    />
  );
}

function TaskForm({
  boardId,
  board,
  task,
  initialColumn,
}: {
  boardId: string;
  board: Board;
  task?: Task;
  initialColumn?: string;
}) {
  const router = useRouter();
  const { t } = useI18n();
  const [createTask, createState] = useCreateTaskMutation();
  const [updateTask, updateState] = useUpdateTaskMutation();
  const [title, setTitle] = useState(task?.title ?? '');
  const [titleError, setTitleError] = useState<string>();
  const [description, setDescription] = useState(task?.description ?? '');
  const [columnId, setColumnId] = useState(task?.columnId || initialColumn || board.columns[0]?.id || '');
  const [subtasks, setSubtasks] = useState<ListItem[]>(
    task ? task.subtasks.map((s) => ({ key: s.id, id: s.id, value: s.title })) : [newItem()],
  );
  const [formError, setFormError] = useState<string>();

  const save = async () => {
    const titleOk = title.trim().length > 0;
    setTitleError(titleOk ? undefined : t('validation.required'));
    const checked = validateList(subtasks, { required: t('validation.required') });
    setSubtasks(checked.items);
    if (!titleOk || !checked.valid) return;

    const input = {
      title: title.trim(),
      description: description.trim(),
      columnId,
      subtasks: subtasks.map((s) => ({ ...(s.id && { id: s.id }), title: s.value.trim() })),
    };
    try {
      if (task) await updateTask({ id: task.id, boardId, ...input }).unwrap();
      else await createTask({ boardId, ...input }).unwrap();
      router.back();
    } catch {
      setFormError(t('error.generic'));
    }
  };

  return (
    <FormScroll>
      <Stack.Screen options={{ title: task ? t('form.editTask') : t('form.newTask') }} />
      <TextField
        label={t('form.title')}
        placeholder={t('form.titlePlaceholder')}
        value={title}
        maxLength={100}
        onChangeText={(v) => {
          setTitle(v);
          setTitleError(undefined);
        }}
        error={titleError}
      />
      <TextField
        label={t('form.description')}
        placeholder={t('form.descriptionPlaceholder')}
        value={description}
        maxLength={2000}
        multiline
        numberOfLines={4}
        style={{ minHeight: 100, paddingTop: 12, textAlignVertical: 'top' }}
        onChangeText={setDescription}
      />
      <ListEditor
        label={t('form.subtasks')}
        items={subtasks}
        placeholder={t('form.subtaskPlaceholder')}
        addLabel={t('form.addSubtask')}
        max={20}
        maxLength={100}
        onChange={setSubtasks}
      />
      <Segmented
        label={t('task.status')}
        options={board.columns.map((c) => ({ value: c.id, label: c.name }))}
        value={columnId}
        onChange={setColumnId}
      />
      {formError && <ErrorText>{formError}</ErrorText>}
      <Button
        title={task ? t('form.save') : t('form.create')}
        loading={createState.isLoading || updateState.isLoading}
        onPress={() => void save()}
      />
    </FormScroll>
  );
}
