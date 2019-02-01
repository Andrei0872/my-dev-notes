
### Important

- before git add: _working area_

- after git add: _index area_

- ```git log```: shows the current HEAD and its ancestry

- ```git reflog```: undo history for the repo; it isn't part of the repo itself

--- 

### Tell github who you are

```git config --global user.name "our_GitHub_user_name"```

```git config --global user.email "our_GitHub_user_email"```


---

### Fetching

* Clone a single branch
```git clone -b <branch_name> --single-branch <git://sub.domain.com/repo.git>```

---

### Basic Commands

Create a new branch : ``` git checkout -b <name> ```

Switch to master : ``` git checkout master ```

```git merge <name of branch>```

```git checkout``` : alters files in the working directory to a state previously known to git


---

### UNDO local commit (didn't push yet)

```git reflog```

```git reset <last good SHA>```

<p>
git reset: <br>
  <li> rewinds your repo's history all the way back to the specified SHA
  <li> by default, it preserves the working dir the commits are gone, but the contents are still on disk
</p>

undo the commits and changes in one move : --hard

--- 


### REDO local commit (assume you've done "git reset --hard ...")

```git reflog```

```git checkout <SHA> -- <filename>```

<b>Recreate one or more files in ur working dir as they were at that moment</b>

```git reflog```
```git reset --hard <SHA>```


<b> Restore the project's history as it was at tha moment in time</b>

```git reflog```
```git cherry-pick <SHA>```


<b>Replay exactly one of those commits into ur repo</b>

```checkout``` - point to a specific version
depending on a version

```cherry-pick``` - replay a commit

--- 

### Removing Stuff

<b>Clear reflog</b>

```git reflog expire --expire=90.days.ago --expire-unreachable=now --all```

<b>Completely remove all history</b>

```git reflog expire --expire=now --all```

<b>Removing folder from history</b>

```git filter-branch --tree-filter 'rm -rf <folder>' HEAD```

```rm -rf .git/refs/original/```

```git push origin master --force```

<b>REMOVE commit from history (local || remote)</b>

https://ncona.com/2011/07/how-to-delete-a-commit-in-git-local-and-remote/


```git log --pretty=oneline --abbrev-commit```
```git rebase -i HEAD~{how many commits u want to see}```

* The bottom one is the most recent
* Delete the line within the editor

```git push origin +master``` (+ means force)



<b>Remove untracked files</b>

```git clean -f``` - remove from directories as well
```git clean -n``` - visualize what is about to be delted

<b>Remove modified files</b>

```git checkout .```

---

### Rebase

Say you started a feature in one direction, but mid-way through you realized
another solution was better
you got a dozen or so commits, but you only want some of them
you'd like the others to dissapear


```git rebase -i <earlier SHA>```

---


### Add to .gitignore 

<b>Before Commit</b>
1. touch .gitignore into ur local repo
2. add the name of the folder, file etc

<b>After commit </b>
1. git rm -r --cached <what u want to hide>
2. git add .
3. git commit -m 'ur message'
4. git push origin HEAD	


---

### See unpushed commits

```git log origin/master..HEAD```

OR

```git log --branches --not --remotes```

---

## Undo Operations

### Undo the most recent commit

git commit -m 'hmm, I might not want to do that'

git reset HEAD

Adding your new files

git commit -C ORIG_HEAD

---

### Discard changes

```bash
# To a specific bile
git checkout <file_name>

# To all files
git checkout .
```

---

### Unstaging Files

* after unstaging - the files are kept in working area

```bash
# All the files
git reset HEAD * # .

# Specific file
git reset HEAD <file_name>
```

---

### Remove the latest command in the history

- removing arbitrary/specific commit is not possible with ```git reset```

```bash
# Also remove commit from history
# Do this locally!
# Use this command when you haven't pushed the files to the remote repo
git reset HEAD~1 # The files are send in working area


# Remove 3 commits
git reset HEAD~3
```

* ```git reset``` modes
  * soft  - keeps all the changes in the staging area
  * mixed - default; resets index, but not the working tree(the changes are kept in the working tree)
  * hard - removes all the commits and discards changes from index and from working tree


* after pushing to remote remo, ```git reset``` will only reset the files **locally**

---

* ```git revert``` 
  * undo changes in any commit 
  * won't remove commit from the history
  * will undo the changes and will create a fresh commit

```bash
git revert <id_commit>
```

### Personal notes

I first used ```git reset --soft``` when I was ready to push files to the remote repo, but suddenly I realised that I also want to include
other files within that commit.
