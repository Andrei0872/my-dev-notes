
# CSS Notebook

* [Knowledge](#knowledge)  
* [Properties](#properties)
* [Tricks](#tricks)  
* [Accessibility](#accessibility)

## Knowledge

### Rendering
[Source](https://dev.to/devdevcharlie/things-nobody-ever-taught-me-about-css-2lhj)

- layout:  
    * calculation of how much space an element takes when it is on screen
    * modifying a layout prop(width, height) - the browser will re-render the page
- paint:  
    * filling pixels for every visual part of the elements (colors, borders etc..)
    * often the most expensive part of the pipeline
- composite:
    * browser need to draw layers in the correct order
    * some elements might overlap each other, so it is important to make sure elements appear in the order intended

### `@import` vs `<link>`

* **@import**
    * blocks parallel downloads
    * the browser will wait for the imported file to finish downloading before it starts downloading the rest of the content

---

## Properties

### `display`

* **block** - stretch horizontally to fill their containing block
* **inline** - shrink to fit their contents

---

## Tricks

### Triangle(Arrow)

<details>
<summary>Example</summary>
<br>


```css
.element:before {
    position: absolute;
    content: "";
    top: -6px;
    right: 30px;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    /* Arrow up */
    border-bottom: 6px solid #FFF;
    /* Arrow down */
    /* border-top: 6px solid #FFF; */
    /* Arrow left */
    /* border-right: 6px solid #FFF; */
    /* Arrow right */
    /* border-left: 6px solid #FFF; */
}
```
</details>

### Checking if an input is empty with CSS

<details>
<summary>Example</summary>
<br>

```css
input:not(:placeholder-shown) {
  border-color: hsl(0, 76%, 50%);
}
```
</details>

---

## Accessibility

### Hiding an element

<details>
<summary>Example</summary>
<br>


```css
.is-visually-hidden {
    border: 0;
    clip: rect(0 0 0 0);
    height: auto;
    margin: 0;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
    white-space: nowrap;
}
```
</details>
