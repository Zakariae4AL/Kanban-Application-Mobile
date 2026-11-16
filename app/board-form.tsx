import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useCreateBoardMutation, useGetBoardQuery, useUpdateBoardMutation } from '../src/api/api';
import type { Board } from '../src/api/types';
import { ListEditor, newItem } from '../src/components/ListEditor';
import { Button, ErrorText, FormScroll, Loading, TextField } from '../src/components/ui';
import { validateList, type ListItem } from '../src/features/listValidation';
import { useI18n } from '../src/i18n/I18nProvider';

/** Create a board, or edit one when a boardId is given. */
export default function BoardFormScreen() {
  const { boardId } = useLocalSearchParams<{ boardId?: string }>();
  const { data: board, isLoading } = useGetBoardQuery(boardId ?? '', { skip: !boardId });
  if (boardId && (isLoading || !board)) return <Loading />;
  return <BoardForm key={board?.id ?? 'new'} board={board} />;
}

function BoardForm({ board }: { board?: Board }) {
  const router = useRouter();
  const { t } = useI18n();
  const [createBoard, createState] = useCreateBoardMutation();
  const [updateBoard, updateState] = useUpdateBoardMutation();
  const [name, setName] = useState(board?.name ?? '');
  const [nameError, setNameError] = useState<string>();
  const [columns, setColumns] = useState<ListItem[]>(
    board
      ? board.columns.map((c) => ({ key: c.id, id: c.id, value: c.name }))
      : [newItem('Todo'), newItem('Doing'), newItem('Done')],
  );
  const [formError, setFormError] = useState<string>();

  const save = async () => {
    const nameOk = name.trim().length > 0;
    setNameError(nameOk ? undefined : t('validation.required'));
    const checked = validateList(columns, {
      required: t('validation.required'),
      duplicate: t('validation.duplicate'),
    });
    setColumns(checked.items);
    if (!nameOk || !checked.valid) return;

    const input = {
      name: name.trim(),
      columns: columns.map((c) => ({ ...(c.id && { id: c.id }), name: c.value.trim() })),
    };
    try {
      if (board) {
        await updateBoard({ id: board.id, ...input }).unwrap();
        router.back();
      } else {
        const created = await createBoard(input).unwrap();
        router.replace({ pathname: '/boards/[boardId]', params: { boardId: created.id } });
      }
    } catch {
      setFormError(t('error.generic'));
    }
  };

  return (
    <FormScroll>
      <Stack.Screen options={{ title: board ? t('form.editBoard') : t('form.newBoard') }} />
      <TextField
        label={t('form.boardName')}
        placeholder={t('form.boardNamePlaceholder')}
        value={name}
        maxLength={50}
        onChangeText={(v) => {
          setName(v);
          setNameError(undefined);
        }}
        error={nameError}
      />
      <ListEditor
        label={t('form.columns')}
        items={columns}
        addLabel={t('form.addColumn')}
        max={10}
        maxLength={30}
        onChange={setColumns}
      />
      {formError && <ErrorText>{formError}</ErrorText>}
      <Button
        title={board ? t('form.save') : t('form.create')}
        loading={createState.isLoading || updateState.isLoading}
        onPress={() => void save()}
      />
    </FormScroll>
  );
}
