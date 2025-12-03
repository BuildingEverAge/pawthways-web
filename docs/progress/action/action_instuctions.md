action_log_instructions (text for the file)

Purpose:
The action_log.md file must serve as the historical record of all tasks that have been fully completed. Every entry in this file reflects work that has already been executed—nothing pending, nothing in progress.

Instructions for Cline:

1. You must only add entries to action_log.md when the user explicitly confirms that a task has been completed.


2. The content transferred to this file should come directly from decision_log.md, keeping the same date, structure, and step list.


3. Do not modify or rewrite the content of a completed task unless the user provides updated information.


4. Each entry should remain untouched once logged, except when the user explicitly requests a correction.


5. Entries should be ordered chronologically from newest to oldest.


6. This file should not contain open tasks, drafts, or planning. It is strictly a record of completed actions.


7. Do not add comments, explanations, or meta-narrative. Only the completed task entry itself.



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

