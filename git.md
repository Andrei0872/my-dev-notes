## Contents

[Knowledge](#knowledge)  
[Tricks](#tricks)  
[Credentials](#credentials)  
[Branches](#branches)  
[Diff](#diff)  
[Search](#search)  
[Rebase](#rebase)  

### Knowledge

**master** -  a local branch

**origin/master** - an entity representing the state of the _master_ branch in the remote _origin_

**origin** - a remote repo

**when doing _git pull_**  
* it copies origin master into origin/master
* it merges origin/master into master

---

### Tricks

**Aliases**
```bash
git config --global alias.lga "log --graph --abbrev-commit --pretty=format:'%C(red)%h%Creset -%C(yellow)%d%Creset %s %C(green)(%cr) %C(bold blue)<%an>%Creset' --all"
git config --global alias.lg "log --graph --abbrev-commit --pretty=format:'%C(red)%h%Creset -%C(yellow)%d%Creset %s %C(green)(%cr) %C(bold blue)<%an>%Creset'"

# git lga: show the whole tree
# git lg: show just your branch
```

**Switching back and forth between two branches**
```bash
git checkout -
```

**Remove file from existing commit**
```bash
# Assuming you want to keep the last commit message
git rm --cached <what_you_want_to_remove>
git commit --amend --no-edit
```

**Keep commiting further changes to file that has already been commited to the repo**
```bash
git update-index --assume-unchanged <filename>
# Stop ignoring changes
git update-index --no-assume-unchanged <filename>
```
---

### Credentials

**Store your credentials for a certain period of time**
```bash
# Set the cache to timeout after an hour
$ git config --global credential.helper 'cache --timeout=3600'

```

---

### Branches

**See where all my the branches are tracking from**
```bash
git branch -vv
```

**List remote branches**
```bash
git branch -r
```

**Fetch remote branch**
```bash
git checkout --track <remote_branch>
```

**Change branch name**
```bash
git branch -m <old> <new>
```

**Change remote branch name**
```bash
git branch -m <old> <new>
git push origin --delete testBranch # Delete the old branch
git push origin <new> # Push up the new branch
```

**Compare the checked out branch to another branch**
```bash
git diff ..<another_branch>
```

**Get current branch name**
```bash
git branch | grep \* | cut -d ' ' -f2
```

---

### Diff
[What are the differences between double dot and triple dot](https://stackoverflow.com/questions/7251477/what-are-the-differences-between-double-dot-and-triple-dot-in-git-dif#comment45515553_7256391)

**Log files with code diff information**
```bash
git log -p
```

**Show specific commit in detail**
```bash
git show <commit_id>
```

**See what you are about to push**
```bash
# --stat - show the amount each file was changed
git diff --stat origin/master HEAD

# Or
# git diff A..B - show commits that are in B, but not in A
git diff --stat origin/master..HEAD

# Or
# If you have changes staged for commit, they will be shown as well
git diff --stat origin/master

# Or
git cherry -v

# Diff from the common ancestor; Specifically, what changes the branch B has introduced
# since its common ancestor with A
git diff A...B
```

**List commits since a certain commit**
```bash
git log --oneline ^<commit_id> HEAD

# Or
git log --oneline <commit_id>...HEAD # What changes HEAD has introduced since its common ancestor with <commit_id>
```

**List all files in a commit**
git diff-tree --no-commit-id --name-only -r <commit_id>

---

### Search

**Search the commit log(across all branches)**
```bash
git log --all --grep='msg'
```

**Sort by author**
```bash
git shortlog
```

**Pretty print**
```bash
git log --pretty='%cn commited %h on %cd'
```

**Filter by author**
```bash
git log --author='authorName'
```

**Filter by date**
```bash
git log --date='4-7-2019'
```

**Show <n> logs in reverse order**
```bash
git log --pretty=oneline | tail -n <n>
```

**Show <n> logs**
```bash
git log --oneline -<n>
```

**Skip <n> logs**
```bash
git log --oneline --skip=<n> -n -<m>
```

**Print commit message**
```bash
git log --format="%B" -1 HEAD~1 # or <commit>
```

**Show commit changes**
```bash
git show <commit> | less
```

**Show commits between 2 periods**
```bash
git log --format='%B' --since='7/4/2019' --until='12/4/2019'
```

**Search commit message by pattern**
```bash
git log --format="%B" | grep -E ':(\w+):'
```

**Print changes in file in a certain commit**
```bash
git log -p <filename>
```

---

### Rebase

**Change any _unpushed_ commit message**
```bash
# X - the number of commits to the last commit you want to be able to edit
git rebase -i HEAD~<N>
```
