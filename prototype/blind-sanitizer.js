// Disposable Wave-1 blinding layer.
// Keep authoring notes/content intact, but do not teach the star-system hypothesis
// to participants before both cases are complete.

const TEXT_REPLACEMENTS = new Map([
  [
    '短いミステリーを2つ、表示された順にプレイしてください。前の作品の設定を引き継ぐ前提はありません。',
    '短いミステリーを2つ、表示された順にプレイしてください。'
  ],
  [
    '前の事件を遊んでいても、その記憶をアリバイにしてはいけない。今回は今回のROLEと事実だけで選ぶ。',
    'いま目の前にある立場と事実だけで選ぶ。'
  ],
  [
    'いいね。『無傷の封印なんて信用できない』って壊すのは簡単だけど、壊さなくても解けるなら、その方が強い推理だ。……君、前より人の秘密に慣れた顔してる。誰かを疑うの、少し上手くなった？　褒めてるつもり。',
    'いいね。『無傷の封印なんて信用できない』って壊すのは簡単だけど、壊さなくても解けるなら、その方が強い推理だ。……君、人の秘密に慣れた顔してる。誰かを疑うの、少し上手いんだね。褒めてるつもり。'
  ],
  [
    '俺の違反？　貨物車に一人、乗客名簿にいない子がいた。国境を越える前に降ろすつもりだった。見つかれば俺は終わり。だから記録をいじった。でも宝石には触ってない。……どう？　前より立派な悪事じゃなくて残念だった？',
    '俺の違反？　貨物車に一人、乗客名簿にいない子がいた。国境を越える前に降ろすつもりだった。見つかれば俺は終わり。だから記録をいじった。でも宝石には触ってない。……どう？　もっと立派な悪事じゃなくて残念だった？'
  ],
  [
    '怖いねえ。疑われてるのに、もっとちゃんと疑えって言うんだ。そういうところ、REIだよね。……でも俺なら、あんな綺麗な顔で『証明しろ』なんて言われたら、逆に燃えるけど。君は？　守る男を、守らずに見られる？',
    '怖いねえ。疑われてるのに、もっとちゃんと疑えって言うんだ。……でも俺なら、あんな綺麗な顔で『証明しろ』なんて言われたら、逆に燃えるけど。君は？　守る男を、守らずに見られる？'
  ]
]);

function replaceText(value) {
  if (typeof value !== 'string') return value;
  let result = value;
  for (const [from, to] of TEXT_REPLACEMENTS) result = result.split(from).join(to);
  return result;
}

function sanitizeJson(value) {
  if (Array.isArray(value)) return value.map(sanitizeJson);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, sanitizeJson(child)]));
  }
  return replaceText(value);
}

const originalFetch = window.fetch.bind(window);
window.fetch = async (...args) => {
  const response = await originalFetch(...args);
  const url = String(args[0] instanceof Request ? args[0].url : args[0]);
  if (!url.includes('/content/') && !url.includes('./content/')) return response;

  const clone = response.clone();
  try {
    const data = await clone.json();
    const sanitized = sanitizeJson(data);
    return new Response(JSON.stringify(sanitized), {
      status: response.status,
      statusText: response.statusText,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  } catch {
    return response;
  }
};

// app.js renders the catalog dynamically. Neutralize the one pre-test instruction
// there without coupling the authoring source to Wave-1 protocol wording.
const observer = new MutationObserver(() => {
  document.querySelectorAll('.hero-head p').forEach(node => {
    const next = replaceText(node.textContent || '');
    if (next !== node.textContent) node.textContent = next;
  });
});
observer.observe(document.documentElement, { childList: true, subtree: true });
