# Useful commands

[Generate project structure](#generate-project-structure)  
[Move multiple files to another location](#move-multiple-files-to-another-location)


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
