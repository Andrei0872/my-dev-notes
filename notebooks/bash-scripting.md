# Bash Scripting Notebook

- [Bash Scripting Notebook](#bash-scripting-notebook)
  - [Concepts](#concepts)
    - [2&gt;&amp;1](#2gtamp1)
  - [Useful Commands](#useful-commands)
    - [Move multiple files to another location](#move-multiple-files-to-another-location)
    - [Delete everything that is not a directory](#delete-everything-that-is-not-a-directory)
    - [Move content from subdirectory x to subdirectory y](#move-content-from-subdirectory-x-to-subdirectory-y)
    - [Create a directory and cd into id immediately](#create-a-directory-and-cd-into-id-immediately)
    - [Update multiple npm packages](#update-multiple-npm-packages)
    - [List only files in a directory](#list-only-files-in-a-directory)

## Concepts

### 2>&1

* **2**: file descriptor for *stderr*

* **1**: file descriptor for *stdout*

* **&**: indicates that what follows `>` is a file descriptor

* **redirects** stderr to stdout

---

## Useful Commands

### Move multiple files to another location
```bash
for i in $(ls -1 | grep -e "$YOUR_REGEX"); do 
    mv "$i" $YOUR_LOCATION 
done
```

### Delete everything that is not a directory
```bash
# First preview what we are going to delete
find . -maxdepth 1  -not -type d
# Expand the previous command
rm $(!!)
```

### Move content from subdirectory `x` to subdirectory `y`
```bash
# Assuming that x and y have the same parent directory
ls -QI "YOUR_DIR" | xargs -I{}  mv ./{} client
```

### Create a directory and cd into id immediately
```bash
mkdir <dir_name> && cd $_
```

### Update multiple npm packages

```bash
# Use case: Updating the packages that belong to `@angular`
npm i $(npm outdated | grep @angular | cut -d ' ' -f1 | xargs -I $ echo '$@latest' | xargs echo)
```

### List only files in a directory

```bash
# -p - append `/` to directories
ls -p | grep -v /
```
