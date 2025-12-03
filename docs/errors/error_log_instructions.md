ERROR_LOG — INSTRUCTIONS (FINAL ENGLISH — AUTO-ADD MODE)
Purpose:
The error_log records every error (big or small) so mistakes are never repeated and the system becomes more stable over time.


---

1) What MUST be added (ALL ERROR TYPES)

The following must be added automatically, without asking:

❗ Technical errors (Supabase, Make, Appsmith, SQL, JSON, arrays, webhooks)

⚠️ Small mistakes (typos, wrong field names, wrong query name, wrong module)

🧩 Configuration errors (API keys, IP whitelist, permissions, roles)

🔀 Flow errors (incorrect order of modules, broken mapping, missing fields)

🤖 Any error caused by Cline misunderstanding or misinterpreting something

🕒 Anything that caused delay, rework, confusion, or repeated fixes


👉 Rule:
If it was an error anywhere in the system → it must be logged automatically.

No permission.
No confirmation.
No questions.


---

2) Required format for every entry

Every error must follow this exact structure:

## {Short Error Title}
Description: what happened (1 line)
Cause: why it happened (1 line)
Fix: how it was fixed (1 line)
Prevention: rule to avoid this error in the future (1 line)

Example:

## Invalid PG array format
Description: Insert failed because JSON array was used.
Cause: Payload used ["AI","L2"] instead of PostgreSQL array.
Fix: Converted to ARRAY['AI','L2'].
Prevention: Always convert narrative_tags to PG arrays before inserting in Make.

Short. Clear. Actionable.


---

3) File maintenance rules

Cline must follow these rules automatically:

New errors must be added at the top (newest → oldest)

Never delete old errors

If the same error happens again, update the existing entry (do not duplicate)

Keep entries very short (4–6 lines)

No long paragraphs



---

4) Mandatory Cline behavior

Before doing any task, Cline must:

1. Read the error_log


2. Apply all relevant Prevention rules automatically


3. If an upcoming action matches a known error →
auto-correct the action to avoid repeating it


4. If a NEW error occurs:
log it automatically, in the correct format, at the top of the file
(no asking the user)



Cline must always follow these instructions.


---

5) What NOT to include

To keep the log clean:

❌ No ideas → go to notes/

❌ No tasks → go to todos.md

❌ No explanations → go to action_log.md

❌ No brainstorming

❌ No long stories


Only errors, but all errors, and always needs to be organized. The same mistake doesn't have to be repeated several times.



Mandatory Local Backup Before Any Change

Before making any modification to the project, a local backup must always be created to ensure that all work can be restored even if something breaks during development or deployment.

Rules:

A local backup is mandatory before any change.
This means the backup must exist on your machine, not only in remote branches.

The backup must be created before editing or replacing any file.

The backup must include all modified and untracked files.

The backup should remain stored locally until the entire change is confirmed to be stable.

Always use a clear and descriptive name to identify the backup.

Recommended local backup methods:
A) Local stash backup (most common)

Creates a local backup snapshot stored directly inside your local Git repo:

git stash push -u -m "backup: local snapshot before change <description>"


✔ Stays only on your machine
✔ Fast, safe, reversible anytime

B) Local backup branch

Creates a local branch that remains on your device (not pushed unless you want to):

git checkout -b local-backup-<date>
git add .
git commit -m "local backup before major change"


Then return to your original branch:

git checkout main


✔ 100% local
✔ A permanent copy you can inspect or restore

C) Full local copy (optional strongest version)

If you want an ultra-safe physical copy:

cp -r C:/pawthways-web C:/pawthways-web-backup-<date>


✔ Not Git-dependent
✔ Even if Git breaks, your project is safe
✔ Good for major refactors or risky tasks