#!/usr/bin/env python3
"""Independent implementation of authored-mystery/1 over a JSON process boundary.

No repository content, JavaScript implementation, DOM or storage is imported.
Only the published content/state/command contracts are input.
"""
import copy
import json
import sys


def observe(data, state):
    node = data['rules']['nodes'][state['nodeId']]
    cue = {key: value for key, value in data['performance']['cues'][node['cueId']].items()
           if key not in ('responses', 'wrongResponse')}
    action_type = node['action']['type']
    actions = []
    if not state['finished']:
        if action_type == 'accuse':
            actions = [dict(type=action_type, payload={'roleId': role['id']},
                            label=f"{role['name']} — {role['label']}") for role in data['roles']]
        elif action_type in ('choose', 'hypothesize'):
            actions = [dict(type=action_type, payload={'optionId': option['id']}, label=option['label'])
                       for option in cue['options']]
        else:
            label = '事件を終える' if action_type == 'finish' else cue.get('cta', '続ける')
            actions = [dict(type=action_type, payload={}, label=label)]
    return dict(contract='authored-stage/1', title=data['title'], premise=data['premise'],
                cue=cue, roles=data['roles'], backgroundAsset=data['performance']['backgroundAsset'],
                evidence=[{**data['rules']['evidence'][eid], **data['performance']['evidence'][eid]} for eid in state['evidenceIds']],
                actions=actions, progress={'current': len(state['visited']), 'total': len(data['rules']['nodes'])},
                feedback=state['feedback'])


def transition(data, previous, command):
    if previous is None:
        state = dict(schema='authored-state/1', nodeId=data['rules']['start'], evidenceIds=[],
                     acceptedInferences=[], beliefs={}, choices={}, visited=[], feedback='', finished=False)
        destination = state['nodeId']
        events = []
    else:
        state = copy.deepcopy(previous)
        node = data['rules']['nodes'][state['nodeId']]
        action = node['action']
        cue = data['performance']['cues'][node['cueId']]
        kind, payload = command['type'], command['payload']
        if kind != action['type'] or state['finished']:
            raise ValueError('ACTION_UNAVAILABLE')
        events, destination = [], node['next']
        state['feedback'] = ''
        if kind == 'choose':
            state['choices'][state['nodeId']] = payload['optionId']
            state['feedback'] = cue.get('responses', {}).get(payload['optionId'], '')
            events.append(dict(type='choice.selected', payload={'cueId': node['cueId'], 'optionId': payload['optionId']}))
        elif kind == 'hypothesize':
            rule = data['rules']['inferences'][action['inferenceId']]
            correct = payload['optionId'] == rule['acceptedOptionId']
            state['beliefs'][rule['id'] + ':' + payload['optionId']] = 'accepted' if correct else 'refuted'
            if correct and rule['id'] not in state['acceptedInferences']:
                state['acceptedInferences'].append(rule['id'])
            state['feedback'] = cue.get('responses', {}).get(payload['optionId'], '')
            events.append(dict(type='hypothesis.evaluated', payload={'inferenceId': rule['id'], 'optionId': payload['optionId'], 'correct': correct}))
            if not correct:
                destination = None
        elif kind == 'accuse':
            correct = payload['roleId'] == data['rules']['truth']['culpritRoleId']
            events.append(dict(type='accusation.evaluated', payload={'roleId': payload['roleId'], 'correct': correct}))
            state['feedback'] = '' if correct else cue['wrongResponse']
            if not correct:
                destination = None
        elif kind == 'finish':
            state['finished'] = True
    if destination is not None:
        state['nodeId'] = destination
        if destination not in state['visited']:
            state['visited'].append(destination)
        node = data['rules']['nodes'][destination]
        events.append(dict(type='stage.entered', payload={'cueId': node['cueId']}))
        for eid in node['grantEvidence']:
            if eid not in state['evidenceIds']:
                state['evidenceIds'].append(eid)
                events.append(dict(type='evidence.observed', payload={'evidenceId': eid, 'kind': data['rules']['evidence'][eid]['kind']}))
    return dict(state=state, status='completed' if state['finished'] else 'active', events=events)


request = json.load(sys.stdin)
if request['operation'] == 'observe':
    result = observe(request['content'], request['state'])
else:
    result = transition(request['content'], request.get('state'), request.get('command'))
json.dump(result, sys.stdout, ensure_ascii=False)
