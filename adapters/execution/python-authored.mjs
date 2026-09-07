import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateContent, validateState, validateCommand, validateAction } from '../../domains/mystery/contracts.mjs';

const program = fileURLToPath(new URL('../../implementations/engines/authored-reference.py', import.meta.url));
async function invoke(request) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', [program], { stdio: ['pipe','pipe','pipe'] });
    let output = '', errors = '';
    const timeout = setTimeout(() => { child.kill(); reject(new Error('Reference engine timed out')); }, 10000);
    child.on('error', error => { clearTimeout(timeout); reject(error); });
    child.stdout.on('data', data => { output += data; });
    child.stderr.on('data', data => { errors += data; });
    child.on('close', code => {
      clearTimeout(timeout);
      if (code !== 0) return reject(new Error(`Reference engine failed: ${errors}`));
      try { resolve(JSON.parse(output)); } catch (error) { reject(error); }
    });
    child.stdin.end(JSON.stringify(request));
  });
}
export const pythonAuthoredEngine = {
  id: 'python-authored-engine', contract: 'authored-mystery/1', requires: [],
  validateContent, validateState, validateCommand, validateAction,
  initialize: content => invoke({ operation: 'transition', content }),
  dispatch(content, state, command) { validateAction(content, state, command); return invoke({ operation: 'transition', content, state, command }); },
  observe: (content, state) => invoke({ operation: 'observe', content, state })
};
