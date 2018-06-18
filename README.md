# SVG-Intersection-Percent
Built for AAT Bioquest
Designed to calculate the percentage overlap between two spectrums (represented by SVG graphics)

## Usage

```javascript
var path0 = "M30 100 L270 20 L300 40 Z";
var path1 = "M150 200 L160 180 L170 160 L180 140 L190 180 L200 200 Z";

var percent = intersectionPercentage(path0, path1);
// percent is a double between 0 and 1
```

Results are give as a double representing the intersection area divided by total area.


## Project Dependencies

No dependencies for this project


## Credits

The intersection logic used in this code is provided by [`intersect.js`](https://github.com/bpmn-io/path-intersection/blob/master/intersect.js), part of  [bpmn.io](https://github.com/bpmn-io).


## License

Use under the terms of the [Apache license 2.0](https://opensource.org/licenses/Apache-2.0).
