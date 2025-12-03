Purpose:
Each section_(number)_checklist.md file contains the actionable checklist for one specific section of the project. These files are derived directly from master_checklist.md, but unlike the master, these checklists are meant to be actively used, updated, and interacted with during execution.

Instructions for Cline:

1. A section checklist must include only the tasks that belong to its corresponding section in master_checklist.md.


2. The wording, hierarchy, and order must match the content in the master checklist unless the user explicitly requests changes.


3. Only tasks belonging to that specific section should appear here—no cross-section items.


4. Tasks in these files may change status over time (e.g., being moved into decision_log.md or action_log.md), but the master checklist must not be modified automatically.


5. When the user selects a task from this file to work on:

That task is moved to decision_log.md following the decision instructions.



6. When the user confirms a task from this section is complete:

That task entry is moved to action_log.md.



7. Section checklists must remain clean and easy to read—no inline progress markers unless the user explicitly asks for them.


8. If new tasks are added to this section by the user, they must also be added to master_checklist.md to maintain consistency.


9. Do not remove tasks from this file unless the user explicitly indicates they should be removed (e.g., obsolete).


10. Formatting must stay simple and consistent.



Recommended structure example:

# Section 1 – Name of Section

## Tasks
- Task A
- Task B
- Task C

## Subtasks (if applicable)
- Task A.1
- Task A.2

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