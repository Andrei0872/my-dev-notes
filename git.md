## Contents

[Tricks](#tricks)
[Credentials](#credentials)
[Branches](#branches)

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

### Credentials

**Store your credentials for a certain period of time**
```bash
# Set the cache to timeout after an hour
$ git config --global credential.helper 'cache --timeout=3600'

```

### Branches

**See where all my the branches are tracking from**
```bash
git branch -vv
```

**List remote branches**
```bash
git branch -r
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