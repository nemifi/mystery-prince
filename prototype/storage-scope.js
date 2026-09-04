(() => {
  const params = new URLSearchParams(location.search);
  const raw = (params.get('pid') || 'LOCAL').toUpperCase();
  const participantId = raw.replace(/[^A-Z0-9_-]/g, '').slice(0, 32) || 'LOCAL';
  const scopedKeys = new Set(['mp_concept_log', 'mp_concept_order', 'mp_concept_debrief']);
  const original = {
    getItem: Storage.prototype.getItem,
    setItem: Storage.prototype.setItem,
    removeItem: Storage.prototype.removeItem
  };
  const scoped = key => scopedKeys.has(String(key)) ? `${key}:${participantId}` : key;

  Storage.prototype.getItem = function(key){ return original.getItem.call(this, scoped(key)); };
  Storage.prototype.setItem = function(key, value){ return original.setItem.call(this, scoped(key), value); };
  Storage.prototype.removeItem = function(key){ return original.removeItem.call(this, scoped(key)); };

  window.MP_TEST_CONTEXT = Object.freeze({ participantId });

  if(params.get('reset') === '1'){
    for(const key of scopedKeys) original.removeItem.call(localStorage, `${key}:${participantId}`);
    params.delete('reset');
    const q = params.toString();
    history.replaceState(null, '', `${location.pathname}${q ? `?${q}` : ''}${location.hash}`);
  }
})();
