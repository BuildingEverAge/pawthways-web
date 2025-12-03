Purpose:
The decision_log.md file must record the concrete, actionable steps required to complete a task that has been requested. These tasks will usually come from one of the sections of the project’s checklist.

Instructions for Cline:

1. When a new task is requested, you must generate a clear, ordered list of specific steps in decision_log.md to complete it.


2. The steps must be:

Actionable

Sequential

Short and direct

Oriented toward immediate execution



3. Each new entry must be dated using the format YYYY-MM-DD.


4. Do not repeat previous decisions; only document what is relevant to the new task.


5. If the task depends on another, state it explicitly.


6. If the task affects other project files, mention them to maintain consistency across logs.


7. Do not include theoretical explanations or unnecessary context. This file should only contain what to do and how to do it.


8. Once the user indicates that the task has been completed, the corresponding entry must be moved from decision_log.md into action_log.md, keeping the same structure and date.



Recommended entry structure:

## YYYY-MM-DD — Task Name

Brief description:  
(One sentence explaining the goal.)

Steps to execute:  
1. …
2. …
3. …


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