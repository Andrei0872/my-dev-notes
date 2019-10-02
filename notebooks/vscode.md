# VS Code Notebook

* [Shortcuts](#shortcuts)
    * [Go to previous mouse cursor](#go-to-previous-mouse-cursor)
* [Keybindings](#keyn)

## Shortcuts

### Go to previous mouse cursor

```bash
CTRL + ALT + -

# Undo the above
CTRL + SHIFT + -
```

---

## Keybindings

<details>
<summary>list</summary>
<br>


```json
[
    {
        "key": "ctrl+shift+5",
        "command": "editor.emmet.action.matchTag" 
    },
    {
        "key": "ctrl+`",
        "command": "workbench.action.focusActiveEditorGroup",
        "when": "terminalFocus"
    }, {
        "key": "ctrl+`",
        "command": "workbench.action.terminal.focus",
        "when": "!terminalFocus"
    },
    {
        "key": "ctrl+shift+k",
        "command": "workbench.action.terminal.focusNext"
    }, {
        "key": "ctrl+shift+j",
        "command": "workbench.action.terminal.focusPrevious"
    },
    {
        "key": "ctrl+shift+1",
        "command": "workbench.action.terminal.focusPreviousPane"
    },
    {
        "key": "ctrl+shift+2",
        "command": "workbench.action.terminal.focusNextPane"
    }, 
    {
        "key": "ctrl+shift+4",
        "command": "editor.action.addSelectionToNextFindMatch"
    },
    {
        "key": "ctrl+shift+3",
        "command": "editor.action.addSelectionToPreviousFindMatch"
    },
    {
        "key": "ctrl+w",
        "command": "workbench.action.terminal.kill",
        "when": "terminalFocus"
    },
    {
        "key": "ctrl+shift+n",
        "command": "extension.advancedNewFile",
    },
    {
        "key": "ctrl+alt right",
        "ckommand": "workbench.action.moveEditorToNextGroup"
    },
    {
        "key": "ctrl+k left",
        "command": "workbench.action.moveEditorToPreviousGroup"
    },
    {
        "key": "ctrl+k right",
        "command": "-workbench.action.moveActiveEditorGroupRight"
    },
    {
        "key": "ctrl+k right",
        "command": "workbench.action.moveEditorToNextGroup"
    },
    {
        "key": "ctrl+alt+right",
        "command": "-workbench.action.moveEditorToNextGroup"
    },
]
```
</details>
