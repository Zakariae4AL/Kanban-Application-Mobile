import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { useDeleteBoardMutation, useGetBoardQuery } from '../../src/api/api';
import type { Column, Task } from '../../src/api/types';
import {
  ActionSheet,
  Button,
  ConfirmDialog,
  EmptyState,
  IconButton,
  Loading,
  Muted,
} from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { columnColor, useTheme } from '../../src/theme/ThemeProvider';

/** One board: column tabs on top, swipe left/right between columns. */
export default function BoardScreen() {
  const { boardId } = useLocalSearchParams<{ boardId: string }>();
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const pager = useRef<FlatList<Column>>(null);
  const [page, setPage] = useState(0);
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const { data: board, isLoading, isError, isFetching, refetch } = useGetBoardQuery(boardId);
  const [deleteBoard, { isLoading: deleting }] = useDeleteBoardMutation();

  if (isLoading) return <Loading />;
  if (isError || !board)
    return <EmptyState text={t('error.load')} action={t('common.retry')} onAction={refetch} />;

  const goTo = (index: number) => {
    setPage(index);
    pager.current?.scrollToIndex({ index, animated: true });
  };
  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) =>
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  const current = board.columns[Math.min(page, board.columns.length - 1)];

  return (
    <View style={[styles.flex, { backgroundColor: colors.page }]}>
      <Stack.Screen
        options={{
          title: board.name,
          headerRight: () => <IconButton label={t('board.menu')} icon="⋮" onPress={() => setMenu(true)} />,
        }}
      />

      {board.columns.length === 0 ? (
        <EmptyState
          text={t('board.emptyColumns')}
          action={t('board.addColumn')}
          onAction={() => router.push({ pathname: '/board-form', params: { boardId: board.id } })}
        />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
            style={styles.tabBar}
          >
            {board.columns.map((column, index) => {
              const selected = index === page;
              return (
                <Pressable
                  key={column.id}
                  role="tab"
                  aria-selected={selected}
                  onPress={() => goTo(index)}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: selected ? colors.surface : 'transparent',
                      borderColor: selected ? colors.line : 'transparent',
                    },
                  ]}
                >
                  <View style={[styles.dot, { backgroundColor: columnColor(index) }]} />
                  <Text style={[styles.tabText, { color: selected ? colors.text : colors.muted }]}>
                    {t('board.columnTab', { name: column.name, count: column.tasks.length })}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <FlatList
            ref={pager}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={board.columns}
            keyExtractor={(c) => c.id}
            onMomentumScrollEnd={onScrollEnd}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            renderItem={({ item }) => (
              <ColumnPage
                column={item}
                width={width}
                refreshing={isFetching}
                onRefresh={() => void refetch()}
                onOpen={(task) =>
                  router.push({ pathname: '/task/[taskId]', params: { taskId: task.id, boardId: board.id } })
                }
              />
            )}
          />

          <View style={styles.fabWrap} pointerEvents="box-none">
            <Button
              title={`+ ${t('board.addTask')}`}
              onPress={() =>
                router.push({
                  pathname: '/task-form',
                  params: { boardId: board.id, columnId: current?.id ?? '' },
                })
              }
              style={styles.fab}
            />
          </View>
        </>
      )}

      <ActionSheet
        visible={menu}
        title={board.name}
        onClose={() => setMenu(false)}
        actions={[
          {
            label: t('board.edit'),
            onPress: () => router.push({ pathname: '/board-form', params: { boardId: board.id } }),
          },
          { label: t('board.delete'), danger: true, onPress: () => setConfirm(true) },
        ]}
      />
      <ConfirmDialog
        visible={confirm}
        busy={deleting}
        message={t('confirm.deleteBoard', { name: board.name })}
        onCancel={() => setConfirm(false)}
        onConfirm={async () => {
          await deleteBoard(board.id)
            .unwrap()
            .catch(() => undefined);
          setConfirm(false);
          router.replace('/boards');
        }}
      />
    </View>
  );
}

function ColumnPage({
  column,
  width,
  refreshing,
  onRefresh,
  onOpen,
}: {
  column: Column;
  width: number;
  refreshing: boolean;
  onRefresh: () => void;
  onOpen: (task: Task) => void;
}) {
  const { t } = useI18n();
  const { colors } = useTheme();
  return (
    <FlatList
      style={{ width }}
      data={column.tasks}
      keyExtractor={(task) => task.id}
      contentContainerStyle={styles.column}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accentText} />
      }
      ListEmptyComponent={<Muted style={styles.emptyColumn}>{t('board.emptyColumn')}</Muted>}
      renderItem={({ item }) => {
        const done = item.subtasks.filter((s) => s.isCompleted).length;
        return (
          <Pressable
            accessibilityRole="button"
            onPress={() => onOpen(item)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.surface, opacity: pressed ? 0.75 : 1 },
            ]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            {item.subtasks.length > 0 && (
              <Text style={[styles.cardMeta, { color: colors.muted }]}>
                {t('task.subtasksDone', { done, total: item.subtasks.length })}
              </Text>
            )}
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  tabBar: { flexGrow: 0 },
  tabs: { paddingHorizontal: 12, paddingVertical: 10, gap: 6 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  tabText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  column: { padding: 16, paddingBottom: 110, gap: 12 },
  emptyColumn: { textAlign: 'center', marginTop: 48 },
  card: {
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#364E7E',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardMeta: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  fabWrap: { position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center' },
  fab: {
    paddingHorizontal: 28,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
