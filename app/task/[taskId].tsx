import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  useDeleteTaskMutation,
  useGetBoardQuery,
  useMoveTaskMutation,
  useToggleSubtaskMutation,
} from '../../src/api/api';
import {
  Button,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Label,
  Loading,
  Muted,
  Segmented,
} from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function TaskScreen() {
  const { taskId, boardId } = useLocalSearchParams<{ taskId: string; boardId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const { data: board, isLoading } = useGetBoardQuery(boardId);
  const [toggleSubtask] = useToggleSubtaskMutation();
  const [moveTask] = useMoveTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();
  const [confirm, setConfirm] = useState(false);

  if (isLoading) return <Loading />;
  const column = board?.columns.find((c) => c.tasks.some((task) => task.id === taskId));
  const task = column?.tasks.find((x) => x.id === taskId);
  if (!board || !column || !task)
    return <EmptyState text={t('task.notFound')} action={t('common.close')} onAction={() => router.back()} />;

  const done = task.subtasks.filter((s) => s.isCompleted).length;
  const index = column.tasks.indexOf(task);
  const move = (columnId: string, position: number) =>
    void moveTask({ id: task.id, boardId, columnId, position });

  return (
    <ScrollView style={{ backgroundColor: colors.page }} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: '' }} />
      <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
        {task.title}
      </Text>
      <Muted style={styles.description}>{task.description || t('task.noDescription')}</Muted>

      {task.subtasks.length > 0 && (
        <View style={styles.section}>
          <Label>{t('task.subtasks', { done, total: task.subtasks.length })}</Label>
          {task.subtasks.map((subtask) => (
            <Checkbox
              key={subtask.id}
              label={subtask.title}
              checked={subtask.isCompleted}
              onChange={(isCompleted) => void toggleSubtask({ id: subtask.id, boardId, isCompleted })}
            />
          ))}
        </View>
      )}

      <Segmented
        label={t('task.status')}
        options={board.columns.map((c) => ({ value: c.id, label: c.name }))}
        value={column.id}
        onChange={(columnId) => move(columnId, Number.MAX_SAFE_INTEGER)}
      />

      <View style={styles.section}>
        <Label>{t('task.position')}</Label>
        <View style={styles.row}>
          <Button
            title={`↑ ${t('task.moveUp')}`}
            variant="secondary"
            disabled={index === 0}
            onPress={() => move(column.id, index - 1)}
            style={styles.half}
          />
          <Button
            title={`↓ ${t('task.moveDown')}`}
            variant="secondary"
            disabled={index === column.tasks.length - 1}
            onPress={() => move(column.id, index + 1)}
            style={styles.half}
          />
        </View>
      </View>

      <View style={styles.row}>
        <Button
          title={t('task.edit')}
          onPress={() => router.push({ pathname: '/task-form', params: { boardId, taskId: task.id } })}
          style={styles.half}
        />
        <Button
          title={t('task.delete')}
          variant="danger"
          onPress={() => setConfirm(true)}
          style={styles.half}
        />
      </View>

      <ConfirmDialog
        visible={confirm}
        busy={deleting}
        message={t('confirm.deleteTask', { name: task.title })}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await deleteTask({ id: task.id, boardId })
            .unwrap()
            .catch(() => undefined);
          setConfirm(false);
          router.back();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 22, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700' },
  description: { lineHeight: 22 },
  section: { gap: 8 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
});
