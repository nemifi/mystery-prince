export const authoredTerminal = {
  id: 'authored-terminal', contract: 'authored-stage/1',
  render(view) {
    const speaker = view.roles.find(role => role.id === view.cue.roleId);
    return [view.title, speaker ? `${speaker.name} — ${speaker.label}` : '', view.cue.title || '', view.cue.text || view.premise, view.cue.quote || '', ...view.evidence.map(item => `• ${item.label}: ${item.text}`), view.feedback].filter(Boolean).join('\n\n');
  }
};
export const inquiryTerminal = {
  id: 'inquiry-terminal', contract: 'inquiry-stage/1',
  render(view) { return [view.title, ...view.turns.map(turn => `${turn.speaker}: ${turn.text}`), view.feedback].filter(Boolean).join('\n\n'); }
};
