master_checklist_instructions (text for the file)

Purpose:
The master_checklist.md file acts as the master source of truth for all tasks, goals, and requirements of the project. All section-specific checklists are derived from this file. It must always represent the complete, structured overview of everything that needs to be done.

Instructions for Cline:

1. This file must contain the full hierarchical checklist of the entire project, organized by sections and subsections.


2. Each section should clearly represent a major area of the project.


3. Subsections and tasks must be written in a concise, actionable way.


4. When a new idea, requirement, or task is introduced by the user, it should be added here first unless the user specifies otherwise.


5. Any checklist generated in the “sections” directory must be derived from the structure and content of master_checklist.md, keeping wording and organization consistent.


6. When a task in a section-based checklist is completed and logged into action_log.md, it should not be automatically removed from the master checklist. This file remains a full historical map of project structure, not a record of progress.


7. Edits to this file should happen only when:

The user adds new tasks or sections

The user removes outdated tasks or sections

The project’s structure evolves



8. Do not add progress indicators, timestamps, or status markers. This file is purely structural.


9. Keep formatting simple, consistent, and easy to parse.



Recommended structure example:

# Master Checklist

## Section 1 — Name
- Task A
- Task B
- Task C

### Subsection 1.1 — Name
- Task D
- Task E

## Section 2 — Name
- Task F
- Task G


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