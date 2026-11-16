export type ListItem = { key: string; id?: string; value: string; error?: string };

/** Marks empty and duplicated values; returns whether the list is valid. */
export function validateList(
  items: ListItem[],
  messages: { required: string; duplicate?: string },
): { items: ListItem[]; valid: boolean } {
  const seen = new Set<string>();
  let valid = true;
  const checked = items.map((item) => {
    const normalized = item.value.trim().toLocaleLowerCase();
    let error: string | undefined;
    if (!normalized) error = messages.required;
    else if (messages.duplicate && seen.has(normalized)) error = messages.duplicate;
    seen.add(normalized);
    if (error) valid = false;
    return { ...item, error };
  });
  return { items: checked, valid };
}
