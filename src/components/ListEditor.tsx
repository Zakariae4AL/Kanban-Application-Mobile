import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { ListItem } from '../features/listValidation';
import { useI18n } from '../i18n/I18nProvider';
import { useTheme } from '../theme/ThemeProvider';
import { Button, ErrorText, Label } from './ui';

let nextKey = 0;
export const newItem = (value = ''): ListItem => ({ key: `new-${++nextKey}`, value });

/** Editable list of text inputs (board columns, task subtasks). */
export function ListEditor({
  label,
  items,
  placeholder,
  addLabel,
  max,
  maxLength,
  onChange,
}: {
  label: string;
  items: ListItem[];
  placeholder?: string;
  addLabel: string;
  max: number;
  maxLength: number;
  onChange: (items: ListItem[]) => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();

  return (
    <View>
      <Label>{label}</Label>
      <View style={styles.list}>
        {items.map((item, index) => (
          <View key={item.key}>
            <View style={styles.row}>
              <TextInput
                accessibilityLabel={`${label} ${index + 1}`}
                value={item.value}
                maxLength={maxLength}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                onChangeText={(value) =>
                  onChange(items.map((it, i) => (i === index ? { ...it, value, error: undefined } : it)))
                }
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.surface,
                    borderColor: item.error ? colors.danger : colors.line,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('form.removeItem', { name: item.value || `${label} ${index + 1}` })}
                hitSlop={6}
                onPress={() => onChange(items.filter((_, i) => i !== index))}
                style={styles.remove}
              >
                <Text style={[styles.removeText, { color: item.error ? colors.danger : colors.muted }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
            {item.error && <ErrorText>{item.error}</ErrorText>}
          </View>
        ))}
      </View>
      {items.length < max && (
        <Button
          title={addLabel}
          variant="secondary"
          onPress={() => onChange([...items, newItem()])}
          style={styles.add}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: { flex: 1, minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 15 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  removeText: { fontSize: 18, fontWeight: '700' },
  add: { marginTop: 12 },
});
