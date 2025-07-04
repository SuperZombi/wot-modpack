# Optimize branch (delete commits history)

### Switch branch
```
git checkout mods
```

### Create a new branch from the current state
```
git checkout --orphan mods-clean
```

### Add and commit files
```
git add .
git commit -m "Initial clean commit [skip ci]"
```

### Overwrite a remote branch
```
git branch -M mods
git push -f origin mods
```
