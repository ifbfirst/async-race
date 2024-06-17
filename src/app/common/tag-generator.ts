export function createTag(
  tagName: string,
  parent?: HTMLElement | null,
  text?: string,
  className?: string,
  id?: string,
): HTMLElement {
  const tag = document.createElement(`${tagName}`);
  if (className) tag.className = `${className}`;
  if (text) tag.textContent = `${text}`;
  if (id) tag.id = id;
  if (parent) parent.append(tag);
  return tag;
}

export function createTagInput(
  parent: HTMLElement,
  type: string,
  id: string,
): HTMLInputElement {
  const tag = document.createElement('input');
  tag.type = type;
  tag.id = id;
  parent.append(tag);
  return tag;
}
