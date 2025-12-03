Purpose of the System

This system was created to store, organize, and never lose any information related to our project plan.
Its goal is to maintain a clear structure where every idea, task, action, and mistake has a defined place, making everything easy to track and review at any time.

The system works in the following way:


---

1. The user creates the overall plan

The project starts with a general plan.
From that plan, we generate the master checklist:

master_checklist.md


If you want to understand how this file should be managed, read:

master_checklist_instructions.md


The master checklist is the complete map of the project.


---

2. Section-based checklists are created

To access more specific information about each area of the plan, we use the section checklists located in:

/sections/section_(n°)_checklist.md


To understand how section checklists work, read:

section_instructions.md


Each of these checklists contains only the tasks belonging to its specific section.


---

3. Choosing a task to work on

When we want to work on a task:

1. We locate the task in its section checklist.


2. We think through everything needed to complete it.


3. We copy that task into:



decision_log.md


This file contains what is going to be executed now, step by step.

For more details, see:

decision_instructions.md



---

4. After completing the task

When the task is finished:

It is moved from decision_log.md to action_log.md


This file stores all completed tasks.

For details, see:

action_log_instructions.md



---

5. Keeping the checklists updated

After a task is completed, at some point we must update:

the corresponding section checklist, and/or

the master checklist


This ensures we never forget what has been done and keeps the project structure clean and accurate.


---

6. Recording mistakes to avoid repeating them

If any mistakes occur during the process, they must be recorded in:

error_log.md


This helps ensure we do not repeat the same mistakes.

For more information, see:

error_log_instructions.md



---

System Flow Summary

1. General plan → create master_checklist.md


2. Section checklists are generated from it (/sections)


3. Select a task → send it to decision_log.md


4. Complete the task → move it to action_log.md


5. Update checklists when appropriate


6. Log mistakes in error_log.md