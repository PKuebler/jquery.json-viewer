# jQuery json-viewer

json-viewer is a jQuery plugin for easily reading JSON objects by transforming them into HTML elements.

Features:
- Syntax highlighting
- Collapse and expand child nodes
- Easily readable DOM structure

## Usage

Just call the `json_viewer` method and pass your JSON data in argument:
```html
<pre id="json-renderer"></pre>
```

```js
$('#json-renderer').json_viewer(json_object);
```

## About

- Author: [Alexandre Bodelot](https//github.com/abodelot)
- License: [MIT License](http://opensource.org/licenses/MIT)