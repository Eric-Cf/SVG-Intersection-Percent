# SVG-Intersection-Percent
Built for AAT Bioquest

## Usage

```javascript
var intersect = require('path-intersection');

var path0 = 'M30,100L270,20';
var path1 = 'M150,150m0,-18a18,18,0,1,1,0,36a18,18,0,1,1,0,-36z';

var intersection = intersect(path0, path1);
// [ { x: ..., y: ..., segment1: ..., segment2: ... }, ... ]
```

Results are give as a percentage (out of 100) representing the intersection area divided by total area.


## Project Dependencies

No dependencies for this project


## Credits

The intersection logic used in this code is provided by [`intersect.js`](https://github.com/bpmn-io/path-intersection/blob/master/intersect.js), part of  [bpmn.io](https://github.com/bpmn-io).


## License

Use under the terms of the [Apache license 2.0](https://opensource.org/licenses/Apache-2.0).
