var test = {
  vectorOverlap: function() {
	  var vector1 = arguments[0]
	  var vector2 = arguments[1]
	  
	  
	  
	  
    return vector1;
  }
}



var has = 'hasOwnProperty',
    p2s = /,?([a-z]),?/gi,
    toFloat = parseFloat,
    math = Math,
    PI = math.PI,
    mmin = math.min,
    mmax = math.max,
    pow = math.pow,
    abs = math.abs,
    pathCommand = /([a-z])[\s,]*((-?\d*\.?\d*(?:e[-+]?\d+)?[\s]*,?[\s]*)+)/ig,
    pathValues = /(-?\d*\.?\d*(?:e[-+]?\\d+)?)[\s]*,?[\s]*/ig;

function is(o, type) {
  type = String.prototype.toLowerCase.call(type);

  if (type == 'finite') {
    return isFinite(o);
  }

  if (type == 'array' && (o instanceof Array || Array.isArray && Array.isArray(o))) {
    return true;
  }

  return (type == 'null' && o === null) ||
         (type == typeof o && o !== null) ||
         (type == 'object' && o === Object(o)) ||
         Object.prototype.toString.call(o).slice(8, -1).toLowerCase() == type;
}

function clone(obj) {

  if (typeof obj == 'function' || Object(obj) !== obj) {
    return obj;
  }

  var res = new obj.constructor;

  for (var key in obj) if (obj[has](key)) {
    res[key] = clone(obj[key]);
  }

  return res;
}

function repush(array, item) {
  for (var i = 0, ii = array.length; i < ii; i++) if (array[i] === item) {
    return array.push(array.splice(i, 1)[0]);
  }
}

function cacher(f, scope, postprocessor) {

  function newf() {

    var arg = Array.prototype.slice.call(arguments, 0),
        args = arg.join('\u2400'),
        cache = newf.cache = newf.cache || {},
        count = newf.count = newf.count || [];

    if (cache[has](args)) {
      repush(count, args);
      return postprocessor ? postprocessor(cache[args]) : cache[args];
    }

    count.length >= 1e3 && delete cache[count.shift()];
    count.push(args);
    cache[args] = f.apply(scope, arg);

    return postprocessor ? postprocessor(cache[args]) : cache[args];
  }
  return newf;
}

function parsePathString(pathString) {

  if (!pathString) {
    return null;
  }

  var pth = paths(pathString);

  if (pth.arr) {
    return clone(pth.arr);
  }

  var paramCounts = { a: 7, c: 6, o: 2, h: 1, l: 2, m: 2, r: 4, q: 4, s: 4, t: 2, v: 1, u: 3, z: 0 },
      data = [];

  if (is(pathString, 'array') && is(pathString[0], 'array')) { // rough assumption
    data = clone(pathString);
  }

  if (!data.length) {

    String(pathString).replace(pathCommand, function(a, b, c) {
      var params = [],
          name = b.toLowerCase();

      c.replace(pathValues, function(a, b) {
        b && params.push(+b);
      });

      if (name == 'm' && params.length > 2) {
        data.push([b].concat(params.splice(0, 2)));
        name = 'l';
        b = b == 'm' ? 'l' : 'L';
      }

      if (name == 'o' && params.length == 1) {
        data.push([b, params[0]]);
      }

      if (name == 'r') {
        data.push([b].concat(params));
      } else while (params.length >= paramCounts[name]) {
        data.push([b].concat(params.splice(0, paramCounts[name])));
        if (!paramCounts[name]) {
          break;
        }
      }
    });
  }

  data.toString = paths.toString;
  pth.arr = clone(data);

  return data;
}

function paths(ps) {
  var p = paths.ps = paths.ps || {};

  if (p[ps]) {
    p[ps].sleep = 100;
  } else {
    p[ps] = {
      sleep: 100
    };
  }

  setTimeout(function() {
    for (var key in p) if (p[has](key) && key != ps) {
      p[key].sleep--;
      !p[key].sleep && delete p[key];
    }
  });

  return p[ps];
}

function box(x, y, width, height) {
  if (x == null) {
    x = y = width = height = 0;
  }

  if (y == null) {
    y = x.y;
    width = x.width;
    height = x.height;
    x = x.x;
  }

  return {
    x: x,
    y: y,
    width: width,
    w: width,
    height: height,
    h: height,
    x2: x + width,
    y2: y + height,
    cx: x + width / 2,
    cy: y + height / 2,
    r1: math.min(width, height) / 2,
    r2: math.max(width, height) / 2,
    r0: math.sqrt(width * width + height * height) / 2,
    path: rectPath(x, y, width, height),
    vb: [x, y, width, height].join(' ')
  };
}

function pathToString() {
  return this.join(',').replace(p2s, '$1');
}

function pathClone(pathArray) {
  var res = clone(pathArray);
  res.toString = pathToString;
  return res;
}

function findDotsAtSegment(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y, t) {
  var t1 = 1 - t,
      t13 = pow(t1, 3),
      t12 = pow(t1, 2),
      t2 = t * t,
      t3 = t2 * t,
      x = t13 * p1x + t12 * 3 * t * c1x + t1 * 3 * t * t * c2x + t3 * p2x,
      y = t13 * p1y + t12 * 3 * t * c1y + t1 * 3 * t * t * c2y + t3 * p2y,
      mx = p1x + 2 * t * (c1x - p1x) + t2 * (c2x - 2 * c1x + p1x),
      my = p1y + 2 * t * (c1y - p1y) + t2 * (c2y - 2 * c1y + p1y),
      nx = c1x + 2 * t * (c2x - c1x) + t2 * (p2x - 2 * c2x + c1x),
      ny = c1y + 2 * t * (c2y - c1y) + t2 * (p2y - 2 * c2y + c1y),
      ax = t1 * p1x + t * c1x,
      ay = t1 * p1y + t * c1y,
      cx = t1 * c2x + t * p2x,
      cy = t1 * c2y + t * p2y,
      alpha = (90 - math.atan2(mx - nx, my - ny) * 180 / PI);

  return {
    x: x,
    y: y,
    m: { x: mx, y: my },
    n: { x: nx, y: ny },
    start: { x: ax, y: ay },
    end: { x: cx, y: cy },
    alpha: alpha
  };
}

function bezierBBox(p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y) {

  if (!is(p1x, 'array')) {
    p1x = [p1x, p1y, c1x, c1y, c2x, c2y, p2x, p2y];
  }

  var bbox = curveBBox.apply(null, p1x);

  return box(
    bbox.min.x,
    bbox.min.y,
    bbox.max.x - bbox.min.x,
    bbox.max.y - bbox.min.y
  );
}

function isPointInsideBBox(bbox, x, y) {
  return x >= bbox.x &&
    x <= bbox.x + bbox.width &&
    y >= bbox.y &&
    y <= bbox.y + bbox.height;
}

function isBBoxIntersect(bbox1, bbox2) {
  bbox1 = box(bbox1);
  bbox2 = box(bbox2);
  return isPointInsideBBox(bbox2, bbox1.x, bbox1.y)
    || isPointInsideBBox(bbox2, bbox1.x2, bbox1.y)
    || isPointInsideBBox(bbox2, bbox1.x, bbox1.y2)
    || isPointInsideBBox(bbox2, bbox1.x2, bbox1.y2)
    || isPointInsideBBox(bbox1, bbox2.x, bbox2.y)
    || isPointInsideBBox(bbox1, bbox2.x2, bbox2.y)
    || isPointInsideBBox(bbox1, bbox2.x, bbox2.y2)
    || isPointInsideBBox(bbox1, bbox2.x2, bbox2.y2)
    || (bbox1.x < bbox2.x2 && bbox1.x > bbox2.x
        || bbox2.x < bbox1.x2 && bbox2.x > bbox1.x)
    && (bbox1.y < bbox2.y2 && bbox1.y > bbox2.y
        || bbox2.y < bbox1.y2 && bbox2.y > bbox1.y);
}

function base3(t, p1, p2, p3, p4) {
  var t1 = -3 * p1 + 9 * p2 - 9 * p3 + 3 * p4,
      t2 = t * t1 + 6 * p1 - 12 * p2 + 6 * p3;
  return t * t2 - 3 * p1 + 3 * p2;
}

function bezlen(x1, y1, x2, y2, x3, y3, x4, y4, z) {

  if (z == null) {
    z = 1;
  }

  z = z > 1 ? 1 : z < 0 ? 0 : z;

  var z2 = z / 2,
      n = 12,
      Tvalues = [-.1252,.1252,-.3678,.3678,-.5873,.5873,-.7699,.7699,-.9041,.9041,-.9816,.9816],
      Cvalues = [0.2491,0.2491,0.2335,0.2335,0.2032,0.2032,0.1601,0.1601,0.1069,0.1069,0.0472,0.0472],
      sum = 0;

  for (var i = 0; i < n; i++) {
    var ct = z2 * Tvalues[i] + z2,
        xbase = base3(ct, x1, x2, x3, x4),
        ybase = base3(ct, y1, y2, y3, y4),
        comb = xbase * xbase + ybase * ybase;

    sum += Cvalues[i] * math.sqrt(comb);
  }

  return z2 * sum;
}


function intersectLines(x1, y1, x2, y2, x3, y3, x4, y4) {

  if (
    mmax(x1, x2) < mmin(x3, x4) ||
      mmin(x1, x2) > mmax(x3, x4) ||
      mmax(y1, y2) < mmin(y3, y4) ||
      mmin(y1, y2) > mmax(y3, y4)
  ) {
    return;
  }

  var nx = (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
      ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
      denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (!denominator) {
    return;
  }

  var px = nx / denominator,
      py = ny / denominator,
      px2 = +px.toFixed(2),
      py2 = +py.toFixed(2);

  if (
    px2 < +mmin(x1, x2).toFixed(2) ||
      px2 > +mmax(x1, x2).toFixed(2) ||
      px2 < +mmin(x3, x4).toFixed(2) ||
      px2 > +mmax(x3, x4).toFixed(2) ||
      py2 < +mmin(y1, y2).toFixed(2) ||
      py2 > +mmax(y1, y2).toFixed(2) ||
      py2 < +mmin(y3, y4).toFixed(2) ||
      py2 > +mmax(y3, y4).toFixed(2)
  ) {
    return;
  }

  return { x: px, y: py };
}

function findBezierIntersections(bez1, bez2, justCount) {
  var bbox1 = bezierBBox(bez1),
      bbox2 = bezierBBox(bez2);

  if (!isBBoxIntersect(bbox1, bbox2)) {
    return justCount ? 0 : [];
  }

  var l1 = bezlen.apply(0, bez1),
      l2 = bezlen.apply(0, bez2),
      n1 = ~~(l1 / 5),
      n2 = ~~(l2 / 5),
      dots1 = [],
      dots2 = [],
      xy = {},
      res = justCount ? 0 : [];

  for (var i = 0; i < n1 + 1; i++) {
    var p = findDotsAtSegment.apply(0, bez1.concat(i / n1));
    dots1.push({ x: p.x, y: p.y, t: i / n1 });
  }

  for (i = 0; i < n2 + 1; i++) {
    p = findDotsAtSegment.apply(0, bez2.concat(i / n2));
    dots2.push({ x: p.x, y: p.y, t: i / n2 });
  }

  for (i = 0; i < n1; i++) {

    for (var j = 0; j < n2; j++) {
      var di = dots1[i],
          di1 = dots1[i + 1],
          dj = dots2[j],
          dj1 = dots2[j + 1],
          ci = abs(di1.x - di.x) < .01 ? 'y' : 'x',
          cj = abs(dj1.x - dj.x) < .01 ? 'y' : 'x',
          is = intersectLines(di.x, di.y, di1.x, di1.y, dj.x, dj.y, dj1.x, dj1.y);

      if (is) {

        if (xy[is.x.toFixed(0)] == is.y.toFixed(0)) {
          continue;
        }

        xy[is.x.toFixed(0)] = is.y.toFixed(0);

        var t1 = di.t + abs((is[ci] - di[ci]) / (di1[ci] - di[ci])) * (di1.t - di.t),
            t2 = dj.t + abs((is[cj] - dj[cj]) / (dj1[cj] - dj[cj])) * (dj1.t - dj.t);

        if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {

          if (justCount) {
            res++;
          } else {
            res.push({
              x: is.x,
              y: is.y,
              t1: t1,
              t2: t2
            });
          }
        }
      }
    }
  }

  return res;
}



function findPathIntersections(path1, path2, justCount) {
  path1 = pathToCurve(path1);
  path2 = pathToCurve(path2);

  var x1, y1, x2, y2, x1m, y1m, x2m, y2m, bez1, bez2,
      res = justCount ? 0 : [];

  for (var i = 0, ii = path1.length; i < ii; i++) {
    var pi = path1[i];

    if (pi[0] == 'M') {
      x1 = x1m = pi[1];
      y1 = y1m = pi[2];
    } else {

      if (pi[0] == 'C') {
        bez1 = [x1, y1].concat(pi.slice(1));
        x1 = bez1[6];
        y1 = bez1[7];
      } else {
        bez1 = [x1, y1, x1, y1, x1m, y1m, x1m, y1m];
        x1 = x1m;
        y1 = y1m;
      }

      for (var j = 0, jj = path2.length; j < jj; j++) {
        var pj = path2[j];

        if (pj[0] == 'M') {
          x2 = x2m = pj[1];
          y2 = y2m = pj[2];
        } else {

          if (pj[0] == 'C') {
            bez2 = [x2, y2].concat(pj.slice(1));
            x2 = bez2[6];
            y2 = bez2[7];
          } else {
            bez2 = [x2, y2, x2, y2, x2m, y2m, x2m, y2m];
            x2 = x2m;
            y2 = y2m;
          }

          var intr = findBezierIntersections(bez1, bez2, justCount);

          if (justCount) {
            res += intr;
          } else {

            for (var k = 0, kk = intr.length; k < kk; k++) {
              intr[k].segment1 = i;
              intr[k].segment2 = j;
              intr[k].bez1 = bez1;
              intr[k].bez2 = bez2;
            }

            res = res.concat(intr);
          }
        }
      }
    }
  }

  return res;
}


function rectPath(x, y, w, h, r) {
  if (r) {
    return [
      ['M', +x + (+r), y],
      ['l', w - r * 2, 0],
      ['a', r, r, 0, 0, 1, r, r],
      ['l', 0, h - r * 2],
      ['a', r, r, 0, 0, 1, -r, r],
      ['l', r * 2 - w, 0],
      ['a', r, r, 0, 0, 1, -r, -r],
      ['l', 0, r * 2 - h],
      ['a', r, r, 0, 0, 1, r, -r],
      ['z']
    ];
  }

  var res = [['M', x, y], ['l', w, 0], ['l', 0, h], ['l', -w, 0], ['z']];
  res.toString = pathToString;

  return res;
}

function ellipsePath(x, y, rx, ry, a) {
  if (a == null && ry == null) {
    ry = rx;
  }

  x = +x;
  y = +y;
  rx = +rx;
  ry = +ry;

  if (a != null) {
    var rad = Math.PI / 180,
        x1 = x + rx * Math.cos(-ry * rad),
        x2 = x + rx * Math.cos(-a * rad),
        y1 = y + rx * Math.sin(-ry * rad),
        y2 = y + rx * Math.sin(-a * rad),
        res = [['M', x1, y1], ['A', rx, rx, 0, +(a - ry > 180), 0, x2, y2]];
  } else {
    res = [
      ['M', x, y],
      ['m', 0, -ry],
      ['a', rx, ry, 0, 1, 1, 0, 2 * ry],
      ['a', rx, ry, 0, 1, 1, 0, -2 * ry],
      ['z']
    ];
  }

  res.toString = pathToString;

  return res;
}


function pathToAbsolute(pathArray) {
  var pth = paths(pathArray);

  if (pth.abs) {
    return pathClone(pth.abs);
  }

  if (!is(pathArray, 'array') || !is(pathArray && pathArray[0], 'array')) { // rough assumption
    pathArray = parsePathString(pathArray);
  }

  if (!pathArray || !pathArray.length) {
    return [['M', 0, 0]];
  }

  var res = [],
      x = 0,
      y = 0,
      mx = 0,
      my = 0,
      start = 0,
      pa0;

  if (pathArray[0][0] == 'M') {
    x = +pathArray[0][1];
    y = +pathArray[0][2];
    mx = x;
    my = y;
    start++;
    res[0] = ['M', x, y];
  }

  var crz = pathArray.length == 3 &&
      pathArray[0][0] == 'M' &&
      pathArray[1][0].toUpperCase() == 'R' &&
      pathArray[2][0].toUpperCase() == 'Z';

  for (var r, pa, i = start, ii = pathArray.length; i < ii; i++) {
    res.push(r = []);
    pa = pathArray[i];
    pa0 = pa[0];

    if (pa0 != pa0.toUpperCase()) {
      r[0] = pa0.toUpperCase();

      switch (r[0]) {
      case 'A':
        r[1] = pa[1];
        r[2] = pa[2];
        r[3] = pa[3];
        r[4] = pa[4];
        r[5] = pa[5];
        r[6] = +pa[6] + x;
        r[7] = +pa[7] + y;
        break;
      case 'V':
        r[1] = +pa[1] + y;
        break;
      case 'H':
        r[1] = +pa[1] + x;
        break;
      case 'R':
        var dots = [x, y].concat(pa.slice(1));

        for (var j = 2, jj = dots.length; j < jj; j++) {
          dots[j] = +dots[j] + x;
          dots[++j] = +dots[j] + y;
        }

        res.pop();
        res = res.concat(catmulRomToBezier(dots, crz));
        break;
      case 'O':
        res.pop();
        dots = ellipsePath(x, y, pa[1], pa[2]);
        dots.push(dots[0]);
        res = res.concat(dots);
        break;
      case 'U':
        res.pop();
        res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
        r = ['U'].concat(res[res.length - 1].slice(-2));
        break;
      case 'M':
        mx = +pa[1] + x;
        my = +pa[2] + y;
      default:

        for (j = 1, jj = pa.length; j < jj; j++) {
          r[j] = +pa[j] + ((j % 2) ? x : y);
        }
      }
    } else if (pa0 == 'R') {
      dots = [x, y].concat(pa.slice(1));
      res.pop();
      res = res.concat(catmulRomToBezier(dots, crz));
      r = ['R'].concat(pa.slice(-2));
    } else if (pa0 == 'O') {
      res.pop();
      dots = ellipsePath(x, y, pa[1], pa[2]);
      dots.push(dots[0]);
      res = res.concat(dots);
    } else if (pa0 == 'U') {
      res.pop();
      res = res.concat(ellipsePath(x, y, pa[1], pa[2], pa[3]));
      r = ['U'].concat(res[res.length - 1].slice(-2));
    } else {

      for (var k = 0, kk = pa.length; k < kk; k++) {
        r[k] = pa[k];
      }
    }
    pa0 = pa0.toUpperCase();

    if (pa0 != 'O') {
      switch (r[0]) {
      case 'Z':
        x = +mx;
        y = +my;
        break;
      case 'H':
        x = r[1];
        break;
      case 'V':
        y = r[1];
        break;
      case 'M':
        mx = r[r.length - 2];
        my = r[r.length - 1];
      default:
        x = r[r.length - 2];
        y = r[r.length - 1];
      }
    }
  }

  res.toString = pathToString;
  pth.abs = pathClone(res);

  return res;
}

function lineToCurve(x1, y1, x2, y2) {
  return [
    x1, y1, x2,
    y2, x2, y2
  ];
}

function qubicToCurve(x1, y1, ax, ay, x2, y2) {
  var _13 = 1 / 3,
      _23 = 2 / 3;

  return [
    _13 * x1 + _23 * ax,
    _13 * y1 + _23 * ay,
    _13 * x2 + _23 * ax,
    _13 * y2 + _23 * ay,
    x2,
    y2
  ];
}

function arcToCurve(x1, y1, rx, ry, angle, large_arc_flag, sweep_flag, x2, y2, recursive) {


  var _120 = PI * 120 / 180,
      rad = PI / 180 * (+angle || 0),
      res = [],
      xy,
      rotate = cacher(function(x, y, rad) {
        var X = x * math.cos(rad) - y * math.sin(rad),
            Y = x * math.sin(rad) + y * math.cos(rad);

        return { x: X, y: Y };
      });

  if (!recursive) {
    xy = rotate(x1, y1, -rad);
    x1 = xy.x;
    y1 = xy.y;
    xy = rotate(x2, y2, -rad);
    x2 = xy.x;
    y2 = xy.y;

    var x = (x1 - x2) / 2,
        y = (y1 - y2) / 2;

    var h = (x * x) / (rx * rx) + (y * y) / (ry * ry);

    if (h > 1) {
      h = math.sqrt(h);
      rx = h * rx;
      ry = h * ry;
    }

    var rx2 = rx * rx,
        ry2 = ry * ry,
        k = (large_arc_flag == sweep_flag ? -1 : 1) *
            math.sqrt(abs((rx2 * ry2 - rx2 * y * y - ry2 * x * x) / (rx2 * y * y + ry2 * x * x))),
        cx = k * rx * y / ry + (x1 + x2) / 2,
        cy = k * -ry * x / rx + (y1 + y2) / 2,
        f1 = math.asin(((y1 - cy) / ry).toFixed(9)),
        f2 = math.asin(((y2 - cy) / ry).toFixed(9));

    f1 = x1 < cx ? PI - f1 : f1;
    f2 = x2 < cx ? PI - f2 : f2;
    f1 < 0 && (f1 = PI * 2 + f1);
    f2 < 0 && (f2 = PI * 2 + f2);

    if (sweep_flag && f1 > f2) {
      f1 = f1 - PI * 2;
    }
    if (!sweep_flag && f2 > f1) {
      f2 = f2 - PI * 2;
    }
  } else {
    f1 = recursive[0];
    f2 = recursive[1];
    cx = recursive[2];
    cy = recursive[3];
  }

  var df = f2 - f1;

  if (abs(df) > _120) {
    var f2old = f2,
        x2old = x2,
        y2old = y2;

    f2 = f1 + _120 * (sweep_flag && f2 > f1 ? 1 : -1);
    x2 = cx + rx * math.cos(f2);
    y2 = cy + ry * math.sin(f2);
    res = arcToCurve(x2, y2, rx, ry, angle, 0, sweep_flag, x2old, y2old, [f2, f2old, cx, cy]);
  }

  df = f2 - f1;

  var c1 = math.cos(f1),
      s1 = math.sin(f1),
      c2 = math.cos(f2),
      s2 = math.sin(f2),
      t = math.tan(df / 4),
      hx = 4 / 3 * rx * t,
      hy = 4 / 3 * ry * t,
      m1 = [x1, y1],
      m2 = [x1 + hx * s1, y1 - hy * c1],
      m3 = [x2 + hx * s2, y2 - hy * c2],
      m4 = [x2, y2];

  m2[0] = 2 * m1[0] - m2[0];
  m2[1] = 2 * m1[1] - m2[1];

  if (recursive) {
    return [m2, m3, m4].concat(res);
  } else {
    res = [m2, m3, m4].concat(res).join().split(',');
    var newres = [];

    for (var i = 0, ii = res.length; i < ii; i++) {
      newres[i] = i % 2 ? rotate(res[i - 1], res[i], rad).y : rotate(res[i], res[i + 1], rad).x;
    }

    return newres;
  }
}


function catmulRomToBezier(crp, z) {
  var d = [];

  for (var i = 0, iLen = crp.length; iLen - 2 * !z > i; i += 2) {
    var p = [
      { x: +crp[i - 2], y: +crp[i - 1] },
      { x: +crp[i], y: +crp[i + 1] },
      { x: +crp[i + 2], y: +crp[i + 3] },
      { x: +crp[i + 4], y: +crp[i + 5] }
    ];

    if (z) {

      if (!i) {
        p[0] = { x: +crp[iLen - 2], y: +crp[iLen - 1] };
      } else if (iLen - 4 == i) {
        p[3] = { x: +crp[0], y: +crp[1] };
      } else if (iLen - 2 == i) {
        p[2] = { x: +crp[0], y: +crp[1] };
        p[3] = { x: +crp[2], y: +crp[3] };
      }

    } else {

      if (iLen - 4 == i) {
        p[3] = p[2];
      } else if (!i) {
        p[0] = { x: +crp[i], y: +crp[i + 1] };
      }

    }

    d.push(['C',
      (-p[0].x + 6 * p[1].x + p[2].x) / 6,
      (-p[0].y + 6 * p[1].y + p[2].y) / 6,
      (p[1].x + 6 * p[2].x - p[3].x) / 6,
      (p[1].y + 6*p[2].y - p[3].y) / 6,
      p[2].x,
      p[2].y
    ]);
  }

  return d;
}


function curveBBox(x0, y0, x1, y1, x2, y2, x3, y3) {
  var tvalues = [],
      bounds = [[], []],
      a, b, c, t, t1, t2, b2ac, sqrtb2ac;

  for (var i = 0; i < 2; ++i) {

    if (i == 0) {
      b = 6 * x0 - 12 * x1 + 6 * x2;
      a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
      c = 3 * x1 - 3 * x0;
    } else {
      b = 6 * y0 - 12 * y1 + 6 * y2;
      a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
      c = 3 * y1 - 3 * y0;
    }

    if (abs(a) < 1e-12) {

      if (abs(b) < 1e-12) {
        continue;
      }

      t = -c / b;

      if (0 < t && t < 1) {
        tvalues.push(t);
      }

      continue;
    }

    b2ac = b * b - 4 * c * a;
    sqrtb2ac = math.sqrt(b2ac);

    if (b2ac < 0) {
      continue;
    }

    t1 = (-b + sqrtb2ac) / (2 * a);

    if (0 < t1 && t1 < 1) {
      tvalues.push(t1);
    }

    t2 = (-b - sqrtb2ac) / (2 * a);

    if (0 < t2 && t2 < 1) {
      tvalues.push(t2);
    }
  }

  var j = tvalues.length,
      jlen = j,
      mt;

  while (j--) {
    t = tvalues[j];
    mt = 1 - t;
    bounds[0][j] = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
    bounds[1][j] = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
  }

  bounds[0][jlen] = x0;
  bounds[1][jlen] = y0;
  bounds[0][jlen + 1] = x3;
  bounds[1][jlen + 1] = y3;
  bounds[0].length = bounds[1].length = jlen + 2;

  return {
    min: { x: mmin.apply(0, bounds[0]), y: mmin.apply(0, bounds[1]) },
    max: { x: mmax.apply(0, bounds[0]), y: mmax.apply(0, bounds[1]) }
  };
}

function pathToCurve(path, path2) {
  var pth = !path2 && paths(path);

  if (!path2 && pth.curve) {
    return pathClone(pth.curve);
  }

  var p = pathToAbsolute(path),
      p2 = path2 && pathToAbsolute(path2),
      attrs = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
      attrs2 = { x: 0, y: 0, bx: 0, by: 0, X: 0, Y: 0, qx: null, qy: null },
      processPath = function(path, d, pcom) {
        var nx, ny;

        if (!path) {
          return ['C', d.x, d.y, d.x, d.y, d.x, d.y];
        }

        !(path[0] in { T: 1, Q: 1 }) && (d.qx = d.qy = null);

        switch (path[0]) {
        case 'M':
          d.X = path[1];
          d.Y = path[2];
          break;
        case 'A':
          path = ['C'].concat(arcToCurve.apply(0, [d.x, d.y].concat(path.slice(1))));
          break;
        case 'S':
          if (pcom == 'C' || pcom == 'S') {
            // In 'S' case we have to take into account, if the previous command is C/S.
            nx = d.x * 2 - d.bx;
            // And reflect the previous
            ny = d.y * 2 - d.by;
            // command's control point relative to the current point.
          }
          else {
            // or some else or nothing
            nx = d.x;
            ny = d.y;
          }
          path = ['C', nx, ny].concat(path.slice(1));
          break;
        case 'T':
          if (pcom == 'Q' || pcom == 'T') {
            // In 'T' case we have to take into account, if the previous command is Q/T.
            d.qx = d.x * 2 - d.qx;
            // And make a reflection similar
            d.qy = d.y * 2 - d.qy;
            // to case 'S'.
          }
          else {
            // or something else or nothing
            d.qx = d.x;
            d.qy = d.y;
          }
          path = ['C'].concat(qubicToCurve(d.x, d.y, d.qx, d.qy, path[1], path[2]));
          break;
        case 'Q':
          d.qx = path[1];
          d.qy = path[2];
          path = ['C'].concat(qubicToCurve(d.x, d.y, path[1], path[2], path[3], path[4]));
          break;
        case 'L':
          path = ['C'].concat(lineToCurve(d.x, d.y, path[1], path[2]));
          break;
        case 'H':
          path = ['C'].concat(lineToCurve(d.x, d.y, path[1], d.y));
          break;
        case 'V':
          path = ['C'].concat(lineToCurve(d.x, d.y, d.x, path[1]));
          break;
        case 'Z':
          path = ['C'].concat(lineToCurve(d.x, d.y, d.X, d.Y));
          break;
        }

        return path;
      },

      fixArc = function(pp, i) {

        if (pp[i].length > 7) {
          pp[i].shift();
          var pi = pp[i];

          while (pi.length) {
            pcoms1[i] = 'A'; // if created multiple C:s, their original seg is saved
            p2 && (pcoms2[i] = 'A'); // the same as above
            pp.splice(i++, 0, ['C'].concat(pi.splice(0, 6)));
          }

          pp.splice(i, 1);
          ii = mmax(p.length, p2 && p2.length || 0);
        }
      },

      fixM = function(path1, path2, a1, a2, i) {

        if (path1 && path2 && path1[i][0] == 'M' && path2[i][0] != 'M') {
          path2.splice(i, 0, ['M', a2.x, a2.y]);
          a1.bx = 0;
          a1.by = 0;
          a1.x = path1[i][1];
          a1.y = path1[i][2];
          ii = mmax(p.length, p2 && p2.length || 0);
        }
      },

      pcoms1 = [], // path commands of original path p
      pcoms2 = [], // path commands of original path p2
      pfirst = '', // temporary holder for original path command
      pcom = ''; // holder for previous path command of original path

  for (var i = 0, ii = mmax(p.length, p2 && p2.length || 0); i < ii; i++) {
    p[i] && (pfirst = p[i][0]); // save current path command

    if (pfirst != 'C') // C is not saved yet, because it may be result of conversion
    {
      pcoms1[i] = pfirst; // Save current path command
      i && (pcom = pcoms1[i - 1]); // Get previous path command pcom
    }
    p[i] = processPath(p[i], attrs, pcom); // Previous path command is inputted to processPath

    if (pcoms1[i] != 'A' && pfirst == 'C') pcoms1[i] = 'C'; // A is the only command
    // which may produce multiple C:s
    // so we have to make sure that C is also C in original path

    fixArc(p, i); // fixArc adds also the right amount of A:s to pcoms1

    if (p2) { // the same procedures is done to p2
      p2[i] && (pfirst = p2[i][0]);

      if (pfirst != 'C') {
        pcoms2[i] = pfirst;
        i && (pcom = pcoms2[i - 1]);
      }

      p2[i] = processPath(p2[i], attrs2, pcom);

      if (pcoms2[i] != 'A' && pfirst == 'C') {
        pcoms2[i] = 'C';
      }

      fixArc(p2, i);
    }

    fixM(p, p2, attrs, attrs2, i);
    fixM(p2, p, attrs2, attrs, i);

    var seg = p[i],
        seg2 = p2 && p2[i],
        seglen = seg.length,
        seg2len = p2 && seg2.length;

    attrs.x = seg[seglen - 2];
    attrs.y = seg[seglen - 1];
    attrs.bx = toFloat(seg[seglen - 4]) || attrs.x;
    attrs.by = toFloat(seg[seglen - 3]) || attrs.y;
    attrs2.bx = p2 && (toFloat(seg2[seg2len - 4]) || attrs2.x);
    attrs2.by = p2 && (toFloat(seg2[seg2len - 3]) || attrs2.y);
    attrs2.x = p2 && seg2[seg2len - 2];
    attrs2.y = p2 && seg2[seg2len - 1];
  }

  if (!p2) {
    pth.curve = pathClone(p);
  }

  return p2 ? [p, p2] : p;
}

//FUNCTIONAL
function shoelaceTheorem(X, Y, numPoints) 
{ 
  area = 0;         // Accumulates area in the loop
  j = numPoints-1;  // The last vertex is the 'previous' one to the first

  for (i=0; i<numPoints; i++)
    { area = area + X[j]*Y[i] -Y[j]*X[i]; 
      j = i;  //j is previous vertex to i
    }
	area = Math.abs(area)
  return area/2;
}

function parseStringCoord(string) {
	var result = string.substring(1, string.length - 2);
	result = result.replace(new RegExp("L", 'g'), "");
	result = result.replace(new RegExp(" ", 'g'), ",");
	return result;
}

function extractXY(coords) {
	
	var x = [];
	var y = [];
	
	var i = 0;
	var j = 0;
	var count = 0;

	x.push(coords.substring(0, coords.indexOf(",")))
	for (i = 0; i > -1; i = coords.indexOf(",", i+1)) {
		count++;
		if (i != coords.lastIndexOf(",") && i != 0) {
			if (count % 2 == 1) {
			x.push(coords.substring(i+1, coords.indexOf(",", i+1)));
			} else {
			y.push(coords.substring(i+1, coords.indexOf(",", i+1)));
			}
		}
	}
	y.push(coords.substring(coords.lastIndexOf(",")+1));
	
	return [x, y];
}

function polygonArea(string){
	var result = extractXY(parseStringCoord(string));
	
	var x = result[0];
	var y = result[1];
	
	
	return shoelaceTheorem(x, y, x.length);

}



function intersectionPolygon(spec1, spec2, intX, intY) {
	var result = extractXY(parseStringCoord(spec1));
	
	var x1 = result[0];
	var y1 = result[1];
	
	result = extractXY(parseStringCoord(spec2));
	
	var x2 = result[0];
	var y2 = result[1];
	
	result = 0;
	
	
	
	var x = [];
	var y = [];
	
	var i;
	var testIndex1 = 0;
	for (i=0; i<x1.length; i++) {
		if(x1[i] > intX) {
			testIndex1 = i;
			i = x1.length + 100;
		}
	}
	var testIndex2 = 0;
	for (i=0; i<x2.length; i++) {
		if(x2[i] > intX) {
			testIndex2 = i;
			i = x2.length + 100;
		}
	}

	
	
	if (y1[testIndex1] > y2[testIndex2]) {
		x.push(intX)
		y.push(intY)
		for (i=testIndex1; i<x1.length; i++) {
			if (y1[i] == 220) {
				x.push(x1[i])
				y.push(y1[i])
				i = x1.length + 100;
			} else {
				x.push(x1[i])
				y.push(y1[i])
			}
		}
		for (i=0; i<testIndex2; i++) {
			x.push(x2[i])
			y.push(y2[i])
		}
	} else {
		x.push(intX)
		y.push(intY)
		for (i=testIndex2; i<x2.length; i++) {
			if (y2[i] == 220) {
				x.push(x2[i])
				y.push(y2[i])
				i = x2.length + 100;
			} else {
				x.push(x2[i])
				y.push(y2[i])
			}
		}
		for (i=0; i<testIndex1; i++) {
			x.push(x1[i])
			y.push(y1[i])
		}
	}

	return [x, y];
}
	
function intersectionPecentage(spec1, spec2) {
	
	var totalArea = polygonArea(spec1) + polygonArea(spec2);

	var intersectionPoint = findPathIntersections(spec1, spec2);

	var intPoly = intersectionPolygon(spec1, spec2, intersectionPoint[0].x, intersectionPoint[0].y);

	console.log(intPoly[0])
	console.log(intPoly[1])
	var intArea = shoelaceTheorem(intPoly[0], intPoly[1], intPoly[0].length)
	
	return intArea/totalArea;
	
}
	
var spec1 = "M402 220 L402 218 L403 218 L404 218 L405 218 L406 218 L407 218 L408 218 L409 218 L410 218 L411 218 L413 218 L415 218 L416 218 L418 218 L420 218 L421 218 L422 218 L423 218 L424 216 L425 216 L426 216 L427 216 L428 216 L429 216 L430 216 L431 216 L433 216 L435 216 L436 216 L438 214 L440 214 L441 214 L443 212 L445 212 L446 212 L448 210 L450 208 L451 208 L453 206 L455 206 L456 206 L458 204 L460 202 L461 202 L463 202 L465 200 L466 198 L468 196 L470 194 L471 194 L473 190 L475 186 L476 184 L478 178 L480 174 L481 170 L483 166 L485 162 L486 160 L488 156 L490 152 L491 152 L492 150 L494 150 L495 150 L497 148 L498 148 L500 146 L501 144 L503 140 L505 134 L506 130 L508 122 L510 112 L511 106 L512 92 L514 84 L515 76 L517 60 L518 52 L520 40 L521 34 L522 26 L524 24 L525 22 L527 22 L528 24 L530 32 L531 38 L532 56 L534 64 L535 74 L537 96 L538 107 L540 130 L541 140 L542 156 L544 162 L545 170 L547 182 L548 188 L550 196 L551 200 L552 204 L553 208 L555 210 L556 212 L557 214 L558 216 L560 216 L561 218 L562 218 L564 218 L565 220 L567 220 L568 220 L570 220 L571 220 L572 220 L573 220 L575 220 L576 220 L577 220 L578 220 L580 220 L581 220 L582 220 L583 220 L585 220 L586 220 L587 220 L402 220 Z";
var spec2 = "M506 220 L507 220 L508 218 L509 218 L510 218 L511 218 L512 216 L513 214 L514 214 L515 212 L516 210 L517 208 L518 204 L519 202 L520 198 L521 192 L522 188 L523 182 L524 174 L525 168 L526 158 L527 150 L528 140 L529 130 L530 120 L531 107 L532 98 L533 86 L534 76 L535 66 L536 56 L537 48 L538 42 L539 36 L540 30 L541 26 L542 22 L543 20 L544 22 L545 22 L546 24 L547 26 L548 30 L549 34 L550 40 L551 46 L552 52 L553 58 L554 64 L555 70 L556 78 L557 84 L558 90 L559 96 L560 104 L561 107 L562 114 L563 120 L564 124 L565 128 L566 132 L567 136 L568 140 L569 144 L570 146 L571 150 L572 152 L573 154 L574 156 L575 158 L576 160 L577 162 L578 164 L579 166 L580 166 L581 168 L582 168 L583 170 L584 170 L585 172 L586 174 L587 174 L588 176 L589 176 L590 178 L591 178 L592 180 L593 180 L594 182 L595 184 L596 184 L597 186 L598 186 L599 188 L600 190 L601 190 L602 192 L603 194 L604 194 L605 196 L606 196 L607 198 L608 200 L609 200 L610 202 L611 202 L612 204 L613 204 L614 204 L615 206 L616 206 L617 208 L618 208 L619 208 L620 208 L621 210 L622 210 L623 210 L624 212 L625 212 L626 212 L627 212 L628 212 L629 212 L630 214 L631 214 L632 214 L633 214 L634 214 L635 214 L636 214 L637 216 L638 216 L639 216 L640 216 L641 216 L642 216 L643 216 L644 216 L645 216 L646 216 L647 216 L648 218 L649 218 L650 218 L651 218 L652 218 L653 218 L654 218 L655 218 L656 218 L657 218 L658 218 L659 218 L660 218 L661 218 L662 218 L663 218 L664 218 L665 220 L666 220 L667 220 L668 220 L669 220 L670 220 L671 220 L672 220 L673 220 L674 220 L675 220 L676 220 L677 220 L678 220 L679 220 L680 220 L681 220 L682 220 L683 220 L684 220 L685 220 L686 220 L687 220 L688 220 L689 220 L690 220 L691 220 L692 220 L693 220 L694 220 L695 220 L696 220 L697 220 L698 220 L699 220 L700 220 L701 220 L702 220 L703 220 L704 220 L705 220 L706 220 L707 220 L708 220 L709 220 L710 220 L711 220 L712 220 L713 220 L714 220 L715 220 L716 220 L717 220 L718 220 L719 220 L720 220 L721 220 L722 220 L723 220 L724 220 L725 220 L726 220 L727 220 L728 220 L729 220 L730 220 L731 220 L732 220 L733 220 L734 220 L735 220 L736 220 L737 220 L738 220 L739 220 L740 220 L741 220 L742 220 L743 220 L744 220 L745 220 L746 220 L747 220 L748 220 L749 220 L750 220 L751 220 L752 220 L753 220 L754 220 L755 220 L756 220 L757 220 L758 220 L759 220 L760 220 L761 220 L762 220 L763 220 L764 220 L765 220 L766 220 L767 220 L768 220 L769 220 L770 220 L771 220 L772 220 L773 220 L774 220 L775 220 L776 220 L777 220 L778 220 L779 220 L780 220 L781 220 L782 220 L783 220 L784 220 L785 220 L786 220 L787 220 L788 220 L789 220 L790 220 L791 220 L792 220 L793 220 L794 220 L795 220 L796 220 L797 220 L798 220 L799 220 L800 220 L801 220 L802 220 L803 220 L804 220 L805 220 L806 220 L807 220 L808 220 L809 220 L810 220 L811 220 L812 220 L813 220 L814 220 L815 220 L816 220 L817 220 L818 220 L819 220 L820 220 L821 220 L822 220 L823 220 L824 220 L825 220 L826 220 L827 220 L828 220 L829 220 L830 220 L831 220 L832 220 L833 220 L834 220 L835 220 L836 220 L837 220 L838 220 L839 220 L840 220 L841 220 L842 220 L843 220 L844 220 L845 220 L846 220 L847 220 L848 220 L506 220 Z";




console.log(intersectionPecentage(spec1, spec2))

