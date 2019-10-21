
# CSS Notebook

* [Knowledge](#knowledge)  
* [Properties](#properties)
* [Tricks](#tricks)
    * [Hover Media Query](#hover-media-query)
    * [prefers-reduced-motion](#prefers-reduced-motion)
* [Accessibility](#accessibility)
* [BEM](#bem)
* [Cascade and Specificity](#cascade-and-specificity)
* [CSS Grid](#css-grid)

## Knowledge

### Rendering
[Article 1](https://dev.to/devdevcharlie/things-nobody-ever-taught-me-about-css-2lhj)  
[Article 2](https://itnext.io/how-the-browser-renders-a-web-page-dom-cssom-and-rendering-df10531c9969)

After the **Render-tree** has been constructed from **DOM + CSSOM**, the browser starts printing elements on the screen.

Changes in **one phase** will have **consequences** on the **following phases**.

* when `<link rel="stylesheet">`(load external `css` file) is encountered: the browser will send a request to fetch the `.css` file **asynchronously** and **continue to parse** the **other HTML elements** below

* when `<script src="">`(load external `js` file) is encountered: the **DOM construction** is stopped **until** the **js file** is **downloaded and parsed**

* `DOMContentLoaded` - emitted when both the **DOM** and **CSSOM** are constructed

* `window.onload` - emitted when external stylesheets and files(`images`, `videos` etc...) are downloaded and ready

* **CSS** is a **render-blocking** resource because **subsequent** rules my **override** the **previous** ones

* `DOM` is **incremental**, `CSSOM` is not, because it gets constructed as CSS is parsed

#### layout
* calculation of how much space an element takes when it is on screen
* calculation of element's position
* modifying a layout prop(width, height) - the browser will re-render the page
* also called **reflow**
* occurs on when you
    * **insert/remove/update** a DOM element
    * **modify content** on page(text in input box)
    * **animate** a DOM element
    * change **CSS style**
    * change **className**
    * resize the window
    * scroll
* `opacity` & `transform`: do **not** cause the browser to repaint or reflow the page
* the **most expensive** to animate

#### paint  
* filling pixels for every visual part of the elements (colors, borders etc..)
* often the most expensive part of the pipeline
* here occurs the process called **rasterization**: where the browser **fills** the **pixels** inside each layer(`layer` - created for each Render-Tree element, as they will change look, position, geometry)

#### compositing
* browser need to draw layers in the correct order
* some elements might overlap each other, so it is important to make sure elements appear in the order intended
* the **least expensive** to animate(`transform`, `opacity`)


### `@import` vs `<link>`

* **@import**
    * blocks parallel downloads
    * the browser will wait for the imported file to finish downloading before it starts downloading the rest of the content

### extrinsic vs intrinsic dimensions

* **extrinsic** - depends on the **parent**; ex: `width: 80%`

* **intrinsic** - depends on the **content** it contains; ex: `width: max-content`

### stacking context

* group of elements with the same parent

* created by
    * html root element
    * an element with a **position other** than `static`
    * an element with **opacity less than 1**

---

## Properties

### `display`

[display: contents](https://bitsofco.de/how-display-contents-works/)

* **block** - stretch horizontally to fill their containing block
* **inline** - shrink to fit their contents
* **none** - not rendered at all, no space allocated; however, you can still get the element's reference
* **contents**
    * the element is **replaced** by element's **contents** to appear as if the **element's children** were **direct descendants** of **element's parent**
    * on images or on form elements it acts as `display: none`, because their box is not defined

### `visibility`

* **hidden**: rendered, space allocated on the page, but not visible

### `width`

* **min-content**
    * the **smallest width & height** of a box where box's content does **not overflow**

* **max-content** 
    * the **smallest size** the box could take while **still fitting around its contents**
    * takes **all the available space** on axis **without wasting** it

* **fit-content**: `min(maxSize content, minSize content)`

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

### Hover Media Query

* tests whether the user's primary input mechanism can hover over elements

```css
@media (hover: hover) {
    .foo:hover {
        /* hover styles */
    }
}
```

### prefers-reduced-motion

* detect if the user has requested that the system minimize the amount of animation or motion it uses

```css
@media screen and (prefers-reduced-motion: no-preference) {
    .animatable { animation: animation-name 2s ease-out; }
}

@media screen and (prefers-reduced-motion: reduce) {
    .animatable { animation: none; }
}
```

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

---

## BEM

[Resource](https://www.smashingmagazine.com/2016/06/battling-bem-extended-edition-common-problems-and-how-to-avoid-them/) :sparkles:

### Namespaces

* `c-` - component: `c-card`
* `l-` - layout(structure application's layout): `l-grid`, `l-container`
* `h-` - helper: `h-hide`
* `is-` - states: `is-visible`, `is-hidden`

---

## Cascade and Specificity

### Cascade

[Resource](https://blog.logrocket.com/the-only-reason-your-css-fails-8e4388d562af/) :sparkles:

* the **algorithm** the browsers use to **decide which rules** to apply to each element when they encounter **conflicting declarations**(more than one rule assigning different values to an elements' property)

* the **source order** is important; browsers **don't look** at the **order** on which the classes are declared in **HTML**, **but** in the **CSS**.
    <details>
    <summary>Example</summary>
    <br>


    ```css
    .red {
        color: red;
    }

    .blue {
        color: blue;
    }
    ```

    ```html
    <div class="red blue"> <!-- blue -->
    <div class="blue red"> <!-- blue -->
    ```
    </details>

### Specificity

#### Order of priority

0. **inline styles**

1. **id** selectors

2. **class** selectors & **pseudo-classes**(`:hover`)

3. elements(`p`) & pseudo-elements(`::before`)

---

## CSS Grid

* **auto-fit**: the columns will **stretch** to fit into the row

* **auto-fill**: an **empty column** is **added** to fill the remaining space
