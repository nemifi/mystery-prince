# Wave 1 Recruitment & Session Kit

Status: READY FOR USE AFTER PAGES SMOKE TEST

This document is operational copy for Wave 1. It deliberately avoids revealing the recurring-PRINCE hypothesis before the blind response.

## Recruitment profile

Prioritize participants plausibly interested in at least one of:

- female-oriented character games / visual novels;
- anime-style attractive male character IP;
- mystery / deduction games or fiction;
- mobile narrative games.

Do not recruit only heavy mystery experts. Include a mix of puzzle familiarity.

Do not tell recruits that the test is about “same characters in different roles.”

## Neutral recruitment message

> スマホ／PCで遊べる短いミステリーゲームの試作版テストに協力してくれる方を探しています。2本合わせて30分前後＋短いアンケートを予定しています。完成版のUI評価ではなく、物語・キャラクター・推理体験について率直な感想を伺います。ミステリーゲーム経験は問いません。

If compensation or scheduling details are used, add them separately. Do not add hypothesis language.

## Start-of-session script

> これから短いミステリーを2本、画面に表示される順番で遊んでください。作品同士の設定を引き継ぐ前提はありません。正解を急ぐ必要はないので、普段ゲームを遊ぶように進めてください。操作で完全に詰まった場合だけ教えてください。

Do not say:

- “同じキャラが出ます”
- “別役でも同じ人物に見えるか見ています”
- “推しを作ってください”
- “キャラへの感情が推理に影響するか見ています”

## Facilitated-session flow

1. Confirm participant ID and open only their assigned URL.
2. Confirm the page starts with one available case only.
3. Read the neutral start script.
4. Observe silently during both cases.
5. When the built-in blind form appears, ask the participant to answer it without discussion first.
6. When the **BLIND RESPONSE SAVED** pause screen appears, conduct the open interview below.
7. Only after interview notes are captured, allow “次の質問へ”.
8. Participant completes revealed debrief.
9. Export JSON.
10. Confirm exported filename includes the correct participant ID and AB/BA order.

## Open interview at reveal pause

Ask in this order unless the participant already covered the point naturally:

1. 「2本遊んで、全体としてどうでしたか？」
2. 「3人について、何か気づいたことや印象に残ったことはありますか？」
3. 「2本目で印象が変わった人はいましたか？」
4. 「誰かを信じたい、疑いたくない、と感じた瞬間はありましたか？」
5. 「逆に、キャラは置いておいて推理だけした瞬間はありましたか？」
6. 「もう1本あるなら、誰が出るものを見たいですか？」
7. 「遊びとして分かりづらかったところはどこでしたか？」
8. 「ミステリーとして納得できなかったところはありましたか？」

Do not explain the hypothesis until these answers are complete.

## Facilitator observation fields

Capture free notes for:

- spontaneous phrase implying recurrence, e.g. 「今回のREI」;
- whether participant independently connects the two versions of each named character;
- confusion caused by biography/ROLE reset;
- attraction increase/decrease from ROLE change;
- visible hesitation before suspecting a liked character;
- evidence discounted because it hurts a preferred character;
- whether participant talks about the actual mystery after solving;
- obvious usability/prototype confounds;
- actual start/end time for each case if independently timed.

## After the reveal

After the participant presses “次の質問へ,” the prototype itself explains the recurring-character concept and asks explicit H1/H2 ratings.

At that point optional follow-ups are allowed:

- 「説明を聞いて、さっきの2本の見え方は変わりましたか？」
- 「この形式を何本も続けるなら、何が楽しみ／不安ですか？」
- 「同じ人物だと感じるために、絶対に残っていてほしいものは何ですか？」
- 「逆に、役ごとにもっと変えてほしいものは何ですか？」

## Data integrity rules

- One participant ID per participant.
- Never reuse P001–P020 for a different person within Wave 1.
- If the same device is reused, open the next participant's own URL; storage is PID-scoped.
- Use the participant's `reset_url` only before that participant begins, not during a completed session.
- Do not modify the build mid-wave except for a blocking defect.
- Do not commit participant names, contacts, or raw research exports to Git.

## End-of-wave review

Do not summarize by “average score looked good” alone. Read:

1. blind observations;
2. open interview notes;
3. per-PRINCE identity scores;
4. recast-excitement score;
5. character × mystery synergy;
6. AB/BA differences;
7. mystery-quality differences;
8. actual play times and wrong-attempt patterns.

Then apply `32-concept-test-analysis-and-gates.md`.
