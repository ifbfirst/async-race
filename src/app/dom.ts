type ElOptions = {
  className?: string;
  id?: string;
  text?: string;
  html?: string;
  attrs?: Record<string, string>;
};

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options: ElOptions = {},
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (options.className) node.className = options.className;
  if (options.id) node.id = options.id;
  if (options.text) node.textContent = options.text;
  if (options.html) node.innerHTML = options.html;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      node.setAttribute(key, value);
    });
  }
  return node;
}

export function setDisabled(node: HTMLElement, disabled: boolean): void {
  node.classList.toggle('is-disabled', disabled);
  if (node instanceof HTMLButtonElement || node instanceof HTMLInputElement) {
    node.disabled = disabled;
  }
}
