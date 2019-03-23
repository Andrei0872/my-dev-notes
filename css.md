
# CSS Notebook

## Contents

[Knowledge](#knowledge)  
[Tricks](#tricks)

### Knowledge

**Rendering**  
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

### Tricks

**Triangle(Arrow)**
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