import { Stack, useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useGetBoardsQuery } from '../../src/api/api';
import { Button, EmptyState, IconButton, Loading } from '../../src/components/ui';
import { useI18n } from '../../src/i18n/I18nProvider';
import { useTheme } from '../../src/theme/ThemeProvider';

export default function BoardsScreen() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const { data: boards, isLoading, isError, isFetching, refetch } = useGetBoardsQuery();

  const header = (
    <Stack.Screen
      options={{
        headerRight: () => (
          <IconButton label={t('settings.title')} icon="⚙︎" onPress={() => router.push('/settings')} />
        ),
      }}
    />
  );

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <>
        {header}
        <EmptyState text={t('error.load')} action={t('common.retry')} onAction={refetch} />
      </>
    );
  if (!boards?.length) {
    return (
      <>
        {header}
        <EmptyState
          text={t('boards.empty')}
          action={t('boards.new')}
          onAction={() => router.push('/board-form')}
        />
      </>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: colors.page }]}>
      {header}
      <FlatList
        data={boards}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => void refetch()}
            tintColor={colors.accentText}
          />
        }
        ListFooterComponent={
          <Button
            title={`+ ${t('boards.new')}`}
            variant="secondary"
            onPress={() => router.push('/board-form')}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/boards/[boardId]', params: { boardId: item.id } })}
            style={({ pressed }) => [
              styles.item,
              { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.bar, { backgroundColor: colors.accent }]} />
            <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={{ color: colors.muted }}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: { padding: 16, gap: 12 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 64,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  bar: { width: 4, height: 28, borderRadius: 2 },
  name: { flex: 1, fontSize: 16, fontWeight: '700' },
});
