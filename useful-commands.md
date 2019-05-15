# Useful commands

[Generate project structure](#generate-project-structure)  
[Move multiple files to another location](#move-multiple-files-to-another-location)  
[Delete everything that is not a directory](#delete-everything-that-is-not-a-directory)  
[Move content from subdirectory x to subdirectory y](#move-content-from-subdirectory-x-to-subdirectory-y)

### Generate project structure

```bash
tree -a -L 2 -R -I '<ignored_dir1>|<ignored_dir2>|...' --dirsfirst
```

---

### Move multiple files to another location
```bash
for i in $(ls -1 | grep -e "$YOUR_REGEX"); do 
    mv "$i" $YOUR_LOCATION 
done
```

---

### Delete everything that is not a directory
```bash
# First preview what we are going to delete
find . -maxdepth 1  -not -type d
# Expand the previous command
rm $(!!)
```

---

### Move content from subdirectory `x` to subdirectory `y`
```bash
# Assuming that x and y have the same parent directory
ls -QI "YOUR_DIR" | xargs -I{}  mv ./{} client