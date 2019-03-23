
# CSS Notebook

## Contents

[Knowledge](#knowledge)

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