# Git Notebook

- [Git Notebook](#git-notebook)
  - [Concepts](#concepts)
    - [master](#master)
    - [origin/$branch](#originbranch)
    - [index](#index)
    - [detached HEAD](#detached-head)
    - [commit](#commit)
      - [merge commit](#merge-commit)
    - [fast-forward](#fast-forward)
    - [local repository](#local-repository)
    - [patch file](#patch-file)
    - [working directory/tree](#working-directorytree)
  - [Aliases](#aliases)
    - [Show the whole tree](#show-the-whole-tree)
    - [Show just the tree your branch](#show-just-the-tree-your-branch)
    - [List all files in a commit](#list-all-files-in-a-commit)
    - [List tracked files in the current branch](#list-tracked-files-in-the-current-branch)
  - [Useful Commands](#useful-commands)
    - [Switching back and forth between two branches](#switching-back-and-forth-between-two-branches)
    - [Store your credentials for a certain period of time](#store-your-credentials-for-a-certain-period-of-time)
    - [Remove file from existing commit, while keeping the changes](#remove-file-from-existing-commit-while-keeping-the-changes)
    - [Stage all the tracked files across the entire repo](#stage-all-the-tracked-files-across-the-entire-repo)
    - [Add only tracked files to index](#add-only-tracked-files-to-index)
    - [Remove untracked files](#remove-untracked-files)
    - [Search commits by string](#search-commits-by-string)
    - [Search commits by file contents](#search-commits-by-file-contents)
    - [Push something locally named X to remote name Y](#push-something-locally-named-x-to-remote-name-y)
    - [Create a separate commit that includes changes of a file](#create-a-separate-commit-that-includes-changes-of-a-file)
    - [View a deleted and not commited yet file](#view-a-deleted-and-not-commited-yet-file)
    - [Rebase with autostash](#rebase-with-autostash)
    - [Undo merge while keeping unstaged files](#undo-merge-while-keeping-unstaged-files)
    - [Follow file history(including renames)](#follow-file-historyincluding-renames)
  - [Branches](#branches)
    - [See where all my the branches are being tracked from](#see-where-all-my-the-branches-are-being-tracked-from)
    - [Fetch remote branch](#fetch-remote-branch)
    - [Change remote branch name](#change-remote-branch-name)
    - [Compare the checked out branch to another branch](#compare-the-checked-out-branch-to-another-branch)
    - [Get current branch name](#get-current-branch-name)
    - [Clone a single branch](#clone-a-single-branch)
    - [Use git add -p on untracked files](#use-git-add--p-on-untracked-files)
  - [Commands](#commands)
    - [git diff](#git-diff)
      - [git diff .. vs git diff ...](#git-diff--vs-git-diff)
    - [git stash](#git-stash)
      - [Add untracked files in current directory](#add-untracked-files-in-current-directory)
    - [git reset](#git-reset)
      - [Options](#options)
    - [git revert](#git-revert)
    - [git checkout](#git-checkout)
    - [git pull](#git-pull)
    - [git cherry-pick](#git-cherry-pick)
    - [git bisect](#git-bisect)
      - [undo step](#undo-step)
      - [fint he first commit in which a function name appears](#fint-he-first-commit-in-which-a-function-name-appears)
      - [resuming work](#resuming-work)
    - [git grep](#git-grep)
      - [Options](#options-1)
    - [git rebase](#git-rebase)
    - [git fetch](#git-fetch)
    - [git push](#git-push)
      - [Options](#options-2)

## Concepts

### master

* a local branch

### origin/$branch

* an entity **representing** the **state** of the **$branch _branch_** in the **remote _origin_**

* **origin**: a remote repo

### index

* a file that keeps track of files over 3 areas
    * working directory
    * staging
    * local repo

### detached HEAD

* refers to a specific commit, as opposed to referring to a branch

### commit

* **store** the **state** of the filesystem at a **certain time** as well as a *pointer* to the **previous commit**

* has a **checksum**: the ID Git uses to refer to it

#### merge commit

* **automatically** created by Git

* does **not** wrap related changes, its purpose is to connect 2 branches; as a result, it has 2 parents

### fast-forward

* when you **merge** a **topic branch** that is **ahead** of your **current** checked-out branch

* in order for the fast-forward to happen, the **checked-out branch** must **not** have **other commits** **since** the **topic** branch **branched off**

### local repository

* a copy of the remote, the only difference is that you do not share it with anyone(it also **tracks** several **remotes**)

### patch file

* a file that **contains changes** that can be **applied** to any **branch**, in any order

### working directory/tree

* in **sync** with the **local filesystem**

* **reflects** the **immediate changes** made to content to **files and directories**

* use `git status` to show the changes to the working directory

---

## Aliases

### Show the whole tree

<details>
<summary><code>git lga</code></summary>
<br>


```bash
git config --global alias.lga "log --graph --abbrev-commit --pretty=format:'%C(red)%h%Creset -%C(yellow)%d%Creset %s %C(green)(%cr) %C(bold blue)<%an>%Creset' --all"
```
</details>

### Show just the tree your branch

<details>
<summary><code>git lg</code></summary>
<br>


```bash
git config --global alias.lg "log --graph --abbrev-commit --pretty=format:'%C(red)%h%Creset -%C(yellow)%d%Creset %s %C(green)(%cr) %C(bold blue)<%an>%Creset'"
```
</details>

### List all files in a commit

<details>
<summary><code>git cfiles $branch</code></summary>
<br>


```bash
git config --global alias.cfiles "diff-tree --no-commit-id --name-only -r"
```
</details>

### List tracked files in the current branch

<details>
<summary><code>git tracked $branch</code></summary>
<br>


```typescript
git config --global alias.tracked 'ls-tree --nam
e-only -r'
```
</details>

---

## Useful Commands

### Switching back and forth between two branches

```bash
git checkout -
```

### Store your credentials for a certain period of time

```bash
# Set the cache to timeout after an hour
$ git config --global credential.helper 'cache --timeout=3600'
```

### Remove file from existing commit, while keeping the changes

```bash
# Assuming you want to keep the last commit message
git rm --cached <file_what_you_want_to_remove>
git commit --amend --no-edit
```

### Stage all the tracked files across the entire repo

```bash
# tracked = deleted | updated 
git commit -am 'commit message'
```

### Add only tracked files to index

```bash
git add -u
```

### Remove untracked files

```bash
# Remove from directories as well
git clean -f

# Just show what files would be deleted
git clean -n
```

### Search commits by string

```bash
git log --grep='your-string-here'
```

### Search commits by file contents

```bash
git log -S $your-string
```

### Push something locally named X to remote name Y

```bash
git push origin X:Y
```

### Create a separate commit that includes changes of a file

```bash
# Assuming that you have commited some changes,
# but you want to create a separate commit 
# that will include changes of a specific file

git reset HEAD^ -- path/to/file
git commit --amend --no-edit
git add .
git commit -m 'added changes for `path/to/file`'
```

### View a deleted and not commited yet file

```
git show HEAD^:path/to/file
```

### Rebase with `autostash`

<details>
<summary>Example</summary>
<br>


```bash
# Branching off of master
git checkout -b feat/awesome-feat

# Add some changes and commit
git commit -am 'feat(awesome-feat): add foo'

# Go back on master and create another commit there
git checkout -
git commit -am 'chore: update bar dependency'

# Go back on the feature branch and make some changes, but do NOT commit
git checkout -

# Try to rebase
git rebase master

# You should see this error
error: cannot rebase: You have unstaged changes.
error: Please commit or stash them.

# The solution
git rebase master --autostash
```
</details>

### Undo merge while keeping unstaged files

<details>
<summary>Example</summary>
<br>

* `ORIG_HEAD` - point to a commit that existed right before the merge

* `--merge` - resets everything that is between `<commit>`(_ORIG_HEAD_) and `HEAD`, but keeps the difference between `index` and `working tree`: changes that have not been added yet

```bash
git merge --no-ff feat/my-awesome-feat

# Make some changes to a file that were not altered by the merge

# Will keep the changes that were made to the aforementioned file
git reset --merge ORIG_HEAD

# As opposed to this, which will reset that file as well, forgetting about all those changes
git reset --hard ORIG_HEAD

```
</details>

### Follow file history(including renames)

```bash

# Assuming you have a file `bar.ts` which has 2 commits on it: `commitA` and `commitB`

# Change file's name into `bat.ts` & commit with `commitC`


# Will log only the information concerning the last commit
git lo --stat -- bat.ts

# Will show all the commits, including those the file had
# before renaming. It also show the `rename action`
# baz.ts => bat.ts
git lo --stat -M --follow -- bat.ts

```

---

## Branches

* when merging **feature** and **master** branch, you also **merge** all the **commits** **from the feature branch** with the master branch

### See where all my the branches are being tracked from

```bash
git branch -vv
```

### Fetch remote branch

```bash
git checkout --track <remote_branch>
```

### Change remote branch name

```bash
git branch -m <old> <new>
git push origin --delete <old> 
git push origin <new>
```

### Compare the checked out branch to another branch

```bash
git diff ..<another_branch>
```

### Get current branch name

```bash
git branch | grep \* | cut -d ' ' -f2
```

### Clone a single branch

```bash
git clone -b <branch_name> --single-branch <git://sub.domain.com/repo.git>
```

### Use `git add -p` on untracked files

```bash

# Will simply add the empty file to index
git add -N

git add -p
```

---

## Commands

### git diff

* `git diff --name-only`: get the **modified**(updated, deleted) files in the current **working tree**(before adding to index)

* `git diff --name-only --staged`: show the staged files

* `git diff --name--only HEAD^`: show the changes between **HEAD** and the previous commit **HEAD^**; with other words, this will list the **files** that are included in the **last commit**

#### `git diff ..` vs `git diff ...`

* `git diff master..topic`: will print the changes from `G` to `C`(with effects on `F` and `G`); with other words, it will print the changes that occurred in `A`, `B` and `C`

* `git diff master...topic`: similar to the above results, except that it will also **include** the **common ancestor**, `E`

<details>
<summary>Example</summary>

```
     A---B---C topic
    /
D---E---F---G master
```
</details>

### git stash

* put files in a separate stack(will eventually be garbage collected)

#### Add untracked files in current directory

```bash
git stash && git add ./ && git stash pop
```

### git reset

* will **override** `HEAD`

* `git reset COMMIT -- files`: an exception of `git reset COMMIT -- files`, which does not make sense: why would override `HEAD` with only some files?  
will **not** move `HEAD`;  
does **not affect the working tree**, it only **updates** the **staged snapshot** to match the version specified in the `COMMIT`

* `git reset $commit-hash`: discard commits or throw away uncommited changes

* `git reset $file-name`: unstange file

#### Options

* `--soft`(keeps all the changes in the staging area): staged snapshot & working dir not altered

* `--mixed`(default): resets index, working dir not altered

* `--hard`(not even unstaged, everything is gone!): both staged snapshot & working dir - altered

_Note: you can undo/redo everything by using `git reflog`_

### git revert

* takes a **commit** and **creates** a **new commit** which **inverses** the specified commit

* undo commit in public branch and create a fresh commit

### git checkout

* bring from anywhere(**commit in the repo**, **individual files from a commit** or **staging area**) into the current **working tree**

* `git checkout $commit-hash -- files`: will bring individual files from `$commit-hash` into the current working tree;  
the `HEAD` will **not** be overwritten!
the **working tree** will be **affected**

* `git checkout $commit-hash`: **move** HEAD to a **specific** commit;  
useful when inspecting old snapshots; this will bting the commit `$commit-hash` into the current working tree  
it will move the `HEAD` ref pointer to the specified commit

* `git checkout $file-name`: identical to `git checkout HEAD -- $file-name`;  
discard `$file-name`'s changes in the working directory;  
will bring the file `$file-name` from `HEAD` into the current working tree; that's why the changes that occurred in the file `file-name` will be discarded  
the **working tree** will be **updated**

* `git checkout .`: discard changes in the working directory;  
identical to `git checkout HEAD -- ./`, which basically means *'bring the most recent commit(`HEAD`) into the working tree'*, that's why the changes will be discarded


### git pull

_assuming the current branch is `master`_

* it **copies** origin master into origin/master && **merges** origin/master into master(_master_ = local branch)

### git cherry-pick

* **use case**: bug hotfixes: before release, **create** a commit with the **fix** and then **cherry pick it into master**

### git bisect

* `git bisect start <bad-commit> <good-commit>`

#### undo step

1) ```bash 
    git bisect log > bisect.log
    ```

2) delete lines

3) ```bash 
    git bisect replay bisect.log 
    ```

#### fint he first commit in which a function name appears

1) ```bash 
    git bisect start --term-old=dne --term-new=exists 
    ```

2) ```bash 
    git bisect dne <commit> 
    ```

3) ```bash  
    git grep -q <fn-name> && git bisect exists || git bisect dne 
    ```
#### resuming work

* instead of scribbling the answers somewhere, you can repeat them later, using the `git bisect replay` command

<details>
<summary>Example</summary>
<br>


```bash
git bisect start <bad-commit> <good-commit>

# Applying some answers
# ...
git bisect good
# ...
git bisect bad

# Time to save what we've done so far
git bisect log > bisect.log

# Once we're done with our new work, we can resume bisecting right were we left off
git bisect replay bisect.log
```
</details>

### git grep

* list lines that match a certain pattern

#### Options

* `-o` - only match: `git grep -o bisect`

* `-c`: the number of matching lines

* `-n`: return the row numbers(with some context)


### git rebase

* instead of combining 2 branches with a merge commit, rebasing **replays** the commits of the **feature** branch as a **series of new commits** on **top** of the **base** branch

* the `HEAD` will **point to** the most **recently replayed commit**

* after rebase, we can **fast-forward** the **base** branch's HEAD by
    * `git checkout <base_branch>`
    * `git merge <topic_branch>`

* if conflicts are encountered during a `rebase` - don't need an *extra* `merge commit`, you can simply resolve it in the commit that is currently being applied

### git fetch

* get **changes from** the **remote** into your **local repository**

* changes will **only** be integrated only in the **remotes** of the **local repository** and **not** in local branches

### git push

#### Options

* **--force-with-lease**
    * will check if the **local version** of the **remote branch**(`origin/...`) and the **actual remote branch**, before `pushing`
    * ensure that you **do not** accidentally **wipe changes** someone else might have pushed in the meanwhile
    * you can pass the check by using `git fetch` instead of `git pull`
