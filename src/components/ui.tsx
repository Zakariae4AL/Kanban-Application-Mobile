import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useI18n } from '../i18n/I18nProvider';
import { useTheme } from '../theme/ThemeProvider';

/* ---------- Text ---------- */

export function Title({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text accessibilityRole="header" style={[styles.title, { color: colors.text }]}>
      {children}
    </Text>
  );
}

export function Label({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.label, { color: colors.muted }]}>{children}</Text>;
}

export function Muted({ children, style }: { children: ReactNode; style?: object }) {
  const { colors } = useTheme();
  return <Text style={[styles.muted, { color: colors.muted }, style]}>{children}</Text>;
}

export function ErrorText({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Text accessibilityRole="alert" style={[styles.error, { color: colors.danger }]}>
      {children}
    </Text>
  );
}

/* ---------- Buttons ---------- */

type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({ title, variant = 'primary', loading, disabled, style, ...props }: ButtonProps) {
  const { colors } = useTheme();
  const background = {
    primary: colors.accent,
    secondary: colors.accentSoft,
    danger: colors.dangerBg,
    ghost: 'transparent',
  }[variant];
  const color = variant === 'primary' || variant === 'danger' ? colors.onAccent : colors.accentText;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      role="button"
      aria-label={title}
      aria-disabled={!!isDisabled}
      aria-busy={!!loading}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: isDisabled ? 0.5 : pressed ? 0.8 : 1 },
        style,
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : (
        <Text style={[styles.buttonText, { color }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function IconButton({ label, icon, onPress }: { label: string; icon: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Text style={[styles.icon, { color: colors.muted }]}>{icon}</Text>
    </Pressable>
  );
}

/* ---------- Inputs ---------- */

type FieldProps = TextInputProps & { label: string; error?: string; hint?: string };

export function TextField({ label, error, hint, style, ...input }: FieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={error ?? hint}
        placeholderTextColor={colors.muted}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: error ? colors.danger : colors.line,
            backgroundColor: colors.surface,
          },
          style,
        ]}
        {...input}
      />
      {error ? <ErrorText>{error}</ErrorText> : hint ? <Muted style={styles.hint}>{hint}</Muted> : null}
    </View>
  );
}

/** A row of mutually exclusive options (status, theme, language…). */
export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.field}>
      <Label>{label}</Label>
      <View role="radiogroup" aria-label={label} style={styles.chips}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              role="radio"
              aria-label={option.label}
              aria-checked={selected}
              onPress={() => onChange(option.value)}
              style={[
                styles.chip,
                {
                  borderColor: selected ? colors.accent : colors.line,
                  backgroundColor: selected ? colors.accent : colors.surface,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: selected ? colors.onAccent : colors.text }]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      role="checkbox"
      aria-label={label}
      aria-checked={checked}
      onPress={() => onChange(!checked)}
      style={[styles.checkRow, { backgroundColor: colors.surfaceAlt }]}
    >
      <View
        style={[
          styles.checkBox,
          {
            borderColor: checked ? colors.accent : colors.muted,
            backgroundColor: checked ? colors.accent : colors.surface,
          },
        ]}
      >
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text
        style={[
          styles.checkLabel,
          {
            color: checked ? colors.muted : colors.text,
            textDecorationLine: checked ? 'line-through' : 'none',
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* ---------- Layout ---------- */

export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface }, style]}>{children}</View>;
}

export function Centered({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.centered, { backgroundColor: colors.page }]}>{children}</View>;
}

export function Loading() {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Centered>
      <ActivityIndicator color={colors.accentText} accessibilityLabel={t('common.loading')} />
    </Centered>
  );
}

export function EmptyState({
  text,
  action,
  onAction,
}: {
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Centered>
      <Muted style={styles.emptyText}>{text}</Muted>
      {action && onAction && <Button title={action} onPress={onAction} style={styles.emptyButton} />}
    </Centered>
  );
}

/* ---------- Dialogs ---------- */

/** Bottom sheet with a list of actions (works the same on iOS, Android and web). */
export function ActionSheet({
  visible,
  title,
  actions,
  onClose,
}: {
  visible: boolean;
  title: string;
  actions: { label: string; onPress: () => void; danger?: boolean }[];
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel={t('common.close')}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
        onPress={onClose}
      >
        <View accessibilityViewIsModal style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <Label>{title}</Label>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={({ pressed }) => [styles.sheetItem, { opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={[styles.sheetText, { color: action.danger ? colors.danger : colors.text }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export function ConfirmDialog({
  visible,
  message,
  onConfirm,
  onCancel,
  busy,
}: {
  visible: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={[styles.backdrop, styles.dialogBackdrop, { backgroundColor: colors.overlay }]}>
        <View accessibilityViewIsModal style={[styles.dialog, { backgroundColor: colors.surface }]}>
          <Text style={[styles.dialogText, { color: colors.text }]}>{message}</Text>
          <Button title={t('confirm.delete')} variant="danger" loading={busy} onPress={onConfirm} />
          <Button title={t('confirm.cancel')} variant="secondary" onPress={onCancel} />
        </View>
      </View>
    </Modal>
  );
}

export function FormScroll({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: colors.page }}
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', marginBottom: 8 },
  muted: { fontSize: 14 },
  error: { fontSize: 13, marginTop: 6 },
  hint: { fontSize: 13, marginTop: 6 },
  button: {
    minHeight: 48,
    borderRadius: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { fontSize: 15, fontWeight: '700' },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 22, fontWeight: '700' },
  field: { gap: 0 },
  input: { minHeight: 48, borderWidth: 1, borderRadius: 8, paddingHorizontal: 14, fontSize: 15 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { minHeight: 44, paddingHorizontal: 16, borderRadius: 22, borderWidth: 1, justifyContent: 'center' },
  chipText: { fontSize: 14, fontWeight: '600' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  checkLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
  card: {
    borderRadius: 10,
    padding: 16,
    shadowColor: '#364E7E',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 },
  emptyText: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
  emptyButton: { alignSelf: 'center' },
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dialogBackdrop: { justifyContent: 'center', padding: 24 },
  sheet: { padding: 20, paddingBottom: 32, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 4 },
  sheetItem: { minHeight: 48, justifyContent: 'center' },
  sheetText: { fontSize: 16, fontWeight: '600' },
  dialog: { borderRadius: 12, padding: 20, gap: 12 },
  dialogText: { fontSize: 15, lineHeight: 22, marginBottom: 8 },
  form: { padding: 20, gap: 20, paddingBottom: 48 },
});
