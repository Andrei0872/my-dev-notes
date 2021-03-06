# VS Code Notebook

[_Terminal Themes_](https://glitchbone.github.io/vscode-base16-term/#/)

- [VS Code Notebook](#vs-code-notebook)
  - [Shortcuts](#shortcuts)
    - [Go to previous mouse cursor](#go-to-previous-mouse-cursor)
    - [Trim whitespace from selection](#trim-whitespace-from-selection)
  - [Keybindings](#keybindings)
  - [Debugging](#debugging)
    - [Knowledge](#knowledge)
    - [Debugging TS](#debugging-ts)
    - [Debugging TS with tests](#debugging-ts-with-tests)
  - [Snippets](#snippets)
  - [Tricks](#tricks)
    - [Compare Files](#compare-files)

## Shortcuts

### Go to previous mouse cursor

```bash
CTRL + ALT + -

# Undo the above
CTRL + SHIFT + -
```

### Trim whitespace from selection

```bash
CTRL + K + CTRL + X
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
    {
        "key": "ctrl+shift+6",
        "command": "editor.action.codeAction",
        "args": {
            "kind": "refactor.extract",
            "preferred": true
        }
    },
]
```
</details>

---

## Debugging

### Knowledge

* `runtimeArgs` - arguments passed to the **executable** that is used to run the program
* `args` - arguments passed to the **program you want to run**, not to its executable

### Debugging TS

<details>
<summary>Example</summary>
<br>


```json
{
    "type": "node",
    "request": "launch",
    "name": "Debug TS in Node.js",
    "preLaunchTask": "typescript",
    "program": "${workspaceFolder}/server/src/index.ts",
    "cwd": "${workspaceFolder}/server/",
    "protocol": "inspector",
    "outFiles": [
        "${workspaceFolder}/server/dist/**/*.js"
    ]
}
```
</details>

### Debugging TS with tests

_Using **Mocha**_

<details>
<summary>Example</summary>
<br>


```json
{
    "type": "node",
    "request": "launch",
    "name": "Mocha Tests",
    "program": "${workspaceFolder}/server/node_modules/mocha/bin/_mocha",
    "args": [
        "--require", "ts-node/register",
        "-u", "bdd",
        "--timeout", "999999",
        "--colors", "--recursive",
        "${workspaceFolder}/server/tests/**/*.ts"
    ],
    "internalConsoleOptions": "openOnSessionStart"
}
```
</details>

---

## Snippets

<details>
<summary>List</summary>
<br>


```json
{
    "Line Break": {
        "prefix": "lineB",
        "body": [
            "//================================"
        ],
        "description": "Outputs a line break",
    },
    "T:Describe": {
        "prefix": "tdesc",
        "body": [
            "describe('$1', () => {",
            "",
            "});"
        ],
    },
    "T:it": {
        "prefix": "testit",
        "body": [
            "it('$1', () => {",
            "",
            "});"
        ]
    }
}
```
</details>

---

## Tricks

### Compare Files

1) **Right Click** on a file and choose **Select for Compare**
2) **Right Click** on **another file** and choose **Compare with Selected**
