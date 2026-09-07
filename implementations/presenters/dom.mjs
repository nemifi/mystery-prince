export function element(tag, attributes = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attributes)) {
    if (value === undefined || value === null || value === false) continue;
    if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'className') node.className = value;
    else if (key === 'value') node.value = value;
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  for (const child of children.flat(Infinity)) if (child !== null && child !== undefined) node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  return node;
}
export const actionButton = (action, dispatch) => element('button', { className: `action ${['advance','finish','close'].includes(action.type) ? 'primary' : ''}`, type: 'button', 'data-command': action.type, 'data-target': action.payload.optionId || action.payload.roleId || '', onClick: () => dispatch(action) }, action.label);
export function topbar(brand, title, exit) {
  return element('header', { className: 'topbar' }, element('span', { className: 'brand' }, brand), element('span', { className: 'progress' }, title), element('button', { type: 'button', className: 'back-link', 'data-home': true, onClick: exit }, '保存して戻る'));
}
export function castList(roles) {
  return element('div', { className: 'cast-list' }, roles.map(role => element('div', { className: 'cast-card' }, element('strong', {}, role.name), element('span', {}, role.label))));
}
