# Background and Motivation
The user attempted to push updates to GitHub but encountered serious issues: Cursor/Claude Code acted unpredictably and multiple files now appear corrupted—or were overwritten.  Our goal is to recover the richer commit history from ~11 days ago (with many more files), reconcile it with the current workspace, and push a repaired history to the remote repository.

# Key Challenges and Analysis
1. **Lost history on remote** – Latest push rewrote history, wiping earlier commits that contained many files.
2. **Need to locate old commit** – The earlier version should still exist in local reflog or remote reflog.
3. **Safely restore without losing current work** – We’ll create a recovery branch at the old commit, compare, then merge/cherry-pick.
4. **Non-destructive** – Avoid force-pushing until the user reviews.

# High-level Task Breakdown
| # | Task | Success Criteria |
|---|------|-----------------|
|1|Capture current repo state | (done) |
|2|Run integrity checks | (done) |
|3|Identify corrupted files | (done) |
|4|Locate last good commit (≈11 days ago) via `git reflog` and create `recovery-<date>` branch | Branch exists pointing at desired commit |
|5|Generate diff summary between `recovery-…` and current `main`; present to user | User reviews and approves merge strategy |
|6|Merge/cherry-pick or set main back to recovered commit, then push (no force unless user approves) | Remote shows full file set & history preserved |
|7|Cleanup: prune unwanted logs, update `.gitignore`, commit | Clean repo |
|8|Post-mortem / lessons | Documented |

# Project Status Board
- [x] Task 1 – capture repo state  
- [x] Task 2 – run integrity checks  
- [x] Task 3 – identify corrupted files  
- [ ] Task 4 – locate last good commit & create recovery branch  
- [ ] Task 5 – diff & review  
- [ ] Task 6 – merge/restore & push  
- [ ] Task 7 – cleanup & `.gitignore`  
- [ ] Task 8 – post-mortem & lessons  

# Current Status / Progress Tracking
Preparing to locate the previous commit in reflog.

# Executor's Feedback or Assistance Requests
Will list recent commits with dates to find candidate from ~11 days ago and ask user to confirm which hash to use.

# Lessons
*(empty – to be filled as we learn)*
