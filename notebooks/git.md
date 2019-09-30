# Git Notebook

* [Concepts](#concepts)

* [Aliases](#aliases)
    * [List all files in a commit](#list-all-files-in-a-commit)
    * [List tracked files in the current branch](#list-tracked-files-in-the-current-branch)

* [Useful commands](#useful-commands)
    * [Switching back and forth between two branches](#switching-back-and-forth-between-two-branches)
    * [Store your credentials for a certain period of time](#store-your-credentials-for-a-certain-period-of-time)
    * [Remove file from existing commit while keeping the changes](#remove-file-from-existing-commit-while-keeping-the-changes)
    * [Stage all the tracked files across the entire repo](#stage-all-the-tracked-files-across-the-entire-repo)
    * [Add only tracked files to index](#add-only-tracked-files-to-index)
    * [Remove untracked files](#remove-untracked-files)

* [Branches](#branches)
    * [See where all my the branches are being tracked from](#see-where-all-my-the-branches-are-being-tracked-from)
    * [Fetch remote branch](#fetch-remote-branch)
    * [Change remote branch name](#change-remote-branch-name)
    * [Compare the checked out branch to another branch](#compare-the-checked-out-branch-to-another-branch)
    * [Get current branch name](#get-current-branch-name)
    * [Clone a single branch](#clone-a-single-branch)

* [Commands](#commands)
    * [git diff](#git-diff)
    * [git stash](#git-stash)
        * [Add untracked files in current directory](#add-untracked-files-in-current-directory)
    * [git reset](#git-reset)
    * [git revert](#git-revert)
    * [git checkout](#git-checkout)
    * [git pull](#git-pull)

## Concepts

### master

* a local branch

### origin/$branch

* an entity **representing** the **state** of the **$branch _branch_** in the **remote _origin_**

* **origin**: a remote repo

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

---

## Commands

### git diff

* `git diff --name-only`: get the **modified**(updated, deleted) files in the current **working tree**(before adding to index)

* `git diff --name-only --staged`: show the staged files

* `git diff --name--only HEAD^`: show the changes between **HEAD** and the previous commit **HEAD^**; with other words, this will list the **files** that are included in the **last commit**

### git stash

* put files in a separate stack(will eventually be garbage collected)

#### Add untracked files in current directory

```bash
git stash && git add ./ && git stash pop
```

### git reset

* `git reset $commit-hash`: discard commits or throw away uncommited changes

* `git reset $file-name`: unstange file

#### Options

* `--soft`(keeps all the changes in the staging area): staged snapshot & working dir not altered

* `--mixed`(default): resets index, staged is updated to match the specified commit, working dir not altered;

* `--hard`(not even unstaged, everything is gone!): both staged snapshot & working dir - altered

_Note: you can undo/redo everything by using `git reflog`_

### git revert

* takes a **commit** and **creates** a **new commit** which **inverses** the specified commit

* undo commit in public branch and create a fresh commit

### git checkout

* `git checkout $commit-hash`: **move** HEAD to a **specific** commit; useful when inspecting old snapshots

* `git checkout $file-name`: discard changes in the working dir

### git pull

_assuming the current branch is `master`_

* it **copies** origin master into origin/master && **merges** origin/master into master(_master_ = local branch)