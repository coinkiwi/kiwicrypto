require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"D+r4VZ":[function(require,module,exports){
(function() {
  'use strict';
  var Base64, b64map;

  b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  Base64 = (function() {
    function Base64() {}

    Base64.stringToHex = function(str) {
      var hs, hv, i, _i, _ref;
      if (str == null) {
        str = '';
      }
      hs = '';
      for (i = _i = 0, _ref = str.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        hv = str.charCodeAt(i).toString(16);
        if (hv.length === 1) {
          hs += '0' + hv;
        } else {
          hs += hv;
        }
      }
      return hs;
    };

    Base64.hexToString = function(str) {
      var i, s, _i, _ref;
      if (str == null) {
        str = '';
      }
      s = '';
      for (i = _i = 0, _ref = str.length - 1; _i <= _ref; i = _i += 2) {
        s += String.fromCharCode(parseInt(str.substring(i, i + 2), 16));
      }
      return s;
    };

    Base64.encode = function(str) {
      var bits, c, coded, e, h1, h2, h3, h4, i, o1, o2, o3, pad, _i, _j, _ref;
      if (str == null) {
        str = '';
      }
      pad = '';
      e = [];
      c = str.length % 3;
      if (c > 0) {
        for (i = _i = c; c <= 2 ? _i <= 2 : _i >= 2; i = c <= 2 ? ++_i : --_i) {
          pad += '=';
          str += '\0';
        }
      }
      for (i = _j = 0, _ref = str.length - 1; _j <= _ref; i = _j += 3) {
        o1 = str.charCodeAt(i);
        o2 = str.charCodeAt(i + 1);
        o3 = str.charCodeAt(i + 2);
        bits = o1 << 16 | o2 << 8 | o3;
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
        e[i / 3] = b64map.charAt(h1) + b64map.charAt(h2) + b64map.charAt(h3) + b64map.charAt(h4);
      }
      coded = e.join('');
      return coded.slice(0, coded.length - pad.length) + pad;
    };

    Base64.decode = function(str) {
      var bits, d, h1, h2, h3, h4, i, o1, o2, o3, _i, _ref;
      if (str == null) {
        str = '';
      }
      d = [];
      for (i = _i = 0, _ref = str.length - 1; _i <= _ref; i = _i += 4) {
        h1 = b64map.indexOf(str.charAt(i));
        h2 = b64map.indexOf(str.charAt(i + 1));
        h3 = b64map.indexOf(str.charAt(i + 2));
        h4 = b64map.indexOf(str.charAt(i + 3));
        bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
        o1 = bits >>> 16 & 0xff;
        o2 = bits >>> 8 & 0xff;
        o3 = bits & 0xff;
        d[i / 4] = String.fromCharCode(o1, o2, o3);
        if (h4 === 0x40) {
          d[i / 4] = String.fromCharCode(o1, o2);
        }
        if (h3 === 0x40) {
          d[i / 4] = String.fromCharCode(o1);
        }
      }
      return d.join('');
    };

    return Base64;

  })();

  exports.Base64 = Base64;

}).call(this);

},{}],"Base64":[function(require,module,exports){
module.exports=require('D+r4VZ');
},{}],"BigInt":[function(require,module,exports){
module.exports=require('R/V1wN');
},{}],"R/V1wN":[function(require,module,exports){

/*
 * Author: Mariusz Nowostawski, and others. See AUTHORS.
 * Copyright (C) 2014 Mariusz Nowostawski, and others. See LICENSE.
 */

(function() {
  'use strict';
  var BigInt;

  BigInt = (function() {
    var T, bpe, digitsStr, eg_A, eg_B, eg_C, eg_D, eg_u, eg_v, mask, md_q1, md_q2, md_q3, md_r, md_r1, md_r2, md_tt, mr_a, mr_r, mr_x1, one, pows, primes, radix, rpprb, s0, s1, s2, s3, s4, s5, s6, s7, s_R, s_a, s_aa, s_b, s_d, s_i, s_i2, s_n, s_n1, s_q, s_r2, s_rm, s_x1, s_x2, sa, ss, t;

    function BigInt() {}

    bpe = 0;

    mask = 0;

    radix = mask + 1;

    one = void 0;

    digitsStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" + "_=!@#$%^&*()[]{}|;:,.<>/?`~ \\\'\"+-";

    t = new Array(0);

    ss = t;

    s0 = t;

    s1 = t;

    s2 = t;

    s3 = t;

    s4 = s5 = t;

    s6 = t;

    s7 = t;

    T = t;

    sa = t;

    mr_x1 = t;

    mr_r = t;

    mr_a = t;

    eg_v = eg_u = eg_A = eg_B = eg_C = eg_D = t;

    md_q1 = md_q2 = md_q3 = md_r = md_r1 = md_r2 = md_tt = t;

    primes = pows = s_i = s_i2 = s_R = s_rm = s_q = s_n1 = t;

    s_a = s_r2 = s_n = s_b = s_d = s_x1 = s_x2 = s_aa = t;

    rpprb = t;

    BigInt.init = function() {
      bpe = 0;
      while ((1 << (bpe + 1)) > (1 << bpe)) {
        bpe++;
      }
      bpe >>= 1;
      mask = (1 << bpe) - 1;
      radix = mask + 1;
      return one = this.int2BigInt(1, 1, 1);
    };

    BigInt.int2BigInt = function(t, bits, minSize) {
      var buff, k;
      if (minSize == null) {
        minSize = 1;
      }
      k = Math.ceil(bits / bpe) + 1;
      if (minSize > k) {
        k = minSize;
      }
      buff = new Array(k);
      this._copyInt_(buff, t);
      return buff;
    };

    BigInt.bitSize = function(x) {
      var j, w, z;
      j = void 0;
      z = void 0;
      w = void 0;
      j = x.length - 1;
      while (x[j] === 0 && j > 0) {
        j--;
      }
      z = 0;
      w = x[j];
      while (w > 0) {
        w >>= 1;
        z++;
      }
      z += bpe * j;
      return z;
    };

    BigInt.str2BigInt = function(s, base, minSize) {
      var d, i, k, kk, stillSearching, x, y, _i, _j, _k, _ref, _ref1, _ref2;
      if (base == null) {
        base = 10;
      }
      if (minSize == null) {
        minSize = 1;
      }
      k = s.length;
      if (base === -1) {
        x = new Array(0);
        stillSearching = true;
        while (stillSearching) {
          y = new Array(x.length + 1);
          for (i = _i = 0, _ref = x.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            y[i + 1] = x[i];
          }
          y[0] = parseInt(s, 10);
          x = y;
          d = s.indexOf(',', 0);
          if (d < 1) {
            stillSearching = false;
            break;
          }
          s = s.substring(d + 1);
          if (s.length === 0) {
            stillSearching = false;
            break;
          }
        }
        if (x.length < minSize) {
          y = new Array(minSize);
          this._copy_(y, x);
          return y;
        }
        return x;
      }
      x = this.int2BigInt(0, base * k, 0);
      for (i = _j = 0, _ref1 = k - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        d = digitsStr.indexOf(s.substring(i, i + 1), 0);
        if (base <= 36 && d >= 36) {
          d -= 26;
        }
        if (d >= base || d < 0) {
          break;
        }
        this._multInt_(x, base);
        this._addInt_(x, d);
      }
      k = x.length;
      while (k > 0 && !x[k - 1]) {
        k--;
      }
      if (minSize > k + 1) {
        k = minSize;
      } else {
        k = k + 1;
      }
      y = new Array(k);
      if (k < x.length) {
        kk = k;
      } else {
        kk = x.length;
      }
      for (i = _k = 0, _ref2 = kk - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        y[i] = x[i];
      }
      while (i < k) {
        y[i++] = 0;
      }
      return y;
    };

    BigInt.equalsInt = function(x, y) {
      var i, _i, _ref;
      if (x[0] !== y) {
        return false;
      }
      for (i = _i = 1, _ref = x.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
        if (x[i]) {
          return false;
        }
      }
      return true;
    };

    BigInt.equals = function(x, y) {
      var i, k, _i, _ref;
      if (x.length < y.length) {
        k = x.length;
      } else {
        k = y.length;
      }
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (x[i] !== y[i]) {
          return false;
        }
      }
      if (x.length > y.length) {
        while (i < x.length) {
          if (x[i++]) {
            return false;
          }
        }
      } else {
        while (i < y.length) {
          if (y[i++]) {
            return false;
          }
        }
      }
      return true;
    };

    BigInt.isZero = function(x) {
      var i, _i, _ref;
      for (i = _i = 0, _ref = x.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (x[i]) {
          return false;
        }
      }
      return true;
    };

    BigInt.BigInt2str = function(x, base) {
      var i, s;
      if (base == null) {
        base = 10;
      }
      s = '';
      if (s6.length !== x.length) {
        s6 = this.dup(x);
      } else {
        this._copy_(s6, x);
      }
      if (base === -1) {
        i = x.length - 1;
        while (i > 0) {
          s += x[i--] + ',';
          s += x[0];
        }
      } else {
        while (!this.isZero(s6)) {
          t = this._divInt_(s6, base);
          s = digitsStr.substring(t, t + 1) + s;
        }
      }
      if (s.length === 0) {
        s = '0';
      }
      return s;
    };

    BigInt.expand = function(x, n) {
      var ans, l;
      l = n;
      if (x.length > n) {
        l = x.length;
      }
      ans = this.int2BigInt(0, l * bpe, 0);
      this._copy_(ans, x);
      return ans;
    };

    BigInt.mod = function(x, n) {
      var ans;
      ans = this.dup(x);
      this._mod_(ans, n);
      return this.trim(ans, 1);
    };

    BigInt.add = function(x, y) {
      var ans;
      ans = this.expand(x, this._expandBufferLength_(x, y));
      this._add_(ans, y);
      return this.trim(ans, 1);
    };

    BigInt.addInt = function(x, n) {
      var ans;
      ans = this.expand(x, x.length + 1);
      this._addInt_(ans, n);
      return this.trim(ans, 1);
    };

    BigInt.mult = function(x, y) {
      var ans;
      ans = this.expand(x, x.length + y.length);
      this._mult_(ans, y);
      return this.trim(ans, 1);
    };

    BigInt.powMod = function(x, y, n) {
      var ans;
      ans = this.expand(x, n.length);
      this._powMod_(ans, this.trim(y, 2), this.trim(n, 2), 0);
      return this.trim(ans, 1);
    };

    BigInt.sub = function(x, y) {
      var ans;
      ans = this.expand(x, this._expandBufferLength_(x, y));
      this._sub_(ans, y);
      return this.trim(ans, 1);
    };

    BigInt.inverseMod = function(x, n) {
      var ans, s;
      ans = this.expand(x, n.length);
      s = this._inverseMod_(ans, n);
      if (s) {
        return this.trim(ans, 1);
      }
      return null;
    };

    BigInt.multMod = function(x, y, n) {
      var ans;
      ans = this.expand(x, n.length);
      this._multMod_(ans, y, n);
      return this.trim(ans, 1);
    };

    BigInt.negative = function(x) {
      return (x[x.length - 1] >> (bpe - 1)) & 1;
    };

    BigInt.greater = function(x, y) {
      var i, k;
      if (x.length < y.length) {
        k = x.length;
      } else {
        k = y.length;
      }
      i = x.length;
      while (i < y.length) {
        if (y[i++]) {
          return false;
        }
      }
      i = y.length;
      while (i < x.length) {
        if (x[i++]) {
          return true;
        }
      }
      i = k - 1;
      while (i >= 0) {
        if (x[i] > y[i]) {
          return true;
        } else if (x[i] < y[i]) {
          return false;
        }
        i--;
      }
      return false;
    };

    BigInt._multInt_ = function(x, n) {
      var b, c, i, k, _i, _ref, _results;
      if (!n) {
        return;
      }
      k = x.length;
      c = 0;
      _results = [];
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        c += x[i] * n;
        b = 0;
        if (c < 0) {
          b = -(c >> bpe);
          c += b * radix;
        }
        x[i] = c & mask;
        _results.push(c = (c >> bpe) - b);
      }
      return _results;
    };

    BigInt._sub_ = function(x, y) {
      var c, i, k, _i, _ref, _results;
      if (x.length < y.length) {
        k = x.length;
      } else {
        k = y.length;
      }
      c = 0;
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        c += x[i] - y[i];
        x[i] = c & mask;
        c >>= bpe;
      }
      i = k;
      _results = [];
      while (c && i < x.length) {
        c += x[i];
        x[i++] = c & mask;
        _results.push(c >>= bpe);
      }
      return _results;
    };

    BigInt._add_ = function(x, y) {
      var c, i, k, _i, _ref, _results;
      if (x.length < y.length) {
        k = x.length;
      } else {
        k = y.length;
      }
      c = 0;
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        c += x[i] + y[i];
        x[i] = c & mask;
        c >>= bpe;
      }
      i = k;
      _results = [];
      while (c && i < x.length) {
        c += x[i];
        x[i++] = c & mask;
        _results.push(c >>= bpe);
      }
      return _results;
    };

    BigInt._addInt_ = function(x, n) {
      var b, c, i, k, _i, _ref;
      x[0] += n;
      k = x.length;
      c = 0;
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        c += x[i];
        b = 0;
        if (c < 0) {
          b = -(c >> bpe);
          c += b * radix;
        }
        x[i] = c & mask;
        c = (c >> bpe) - b;
        if (!c) {
          return;
        }
      }
    };

    BigInt._mult_ = function(x, y) {
      var i, _i, _ref;
      if (ss.length !== 2 * x.length) {
        ss = new Array(2 * x.length);
      }
      this._copyInt_(ss, 0);
      for (i = _i = 0, _ref = y.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (y[i]) {
          this._linCombShift_(ss, x, y[i], i);
        }
      }
      return this._copy_(x, ss);
    };

    BigInt._mod_ = function(x, n) {
      if (s4.length !== x.length) {
        s4 = dup(x);
      } else {
        this._copy_(s4, x);
      }
      if (s5.length !== x.length) {
        s5 = dup(x);
      }
      return this._divide_(s4, n, s5, x);
    };

    BigInt._multMod_ = function(x, y, n) {
      var i, _i, _ref;
      if (s0.length !== 2 * x.length) {
        s0 = new Array(2 * x.length);
      }
      this._copyInt_(s0, 0);
      for (i = _i = 0, _ref = y.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (y[i]) {
          this._linCombShift_(s0, x, y[i], i);
        }
      }
      this._mod_(s0, n);
      return this._copy_(x, s0);
    };

    BigInt._divInt_ = function(x, n) {
      var i, r, s;
      r = 0;
      i = x.length - 1;
      while (i >= 0) {
        s = r * radix + x[i];
        x[i] = Math.floor(s / n);
        r = s % n;
        i--;
      }
      return r;
    };

    BigInt._divide_ = function(x, y, q, r) {
      var a, b, c, i, kx, ky, res, y1, y2;
      this._copy_(r, x);
      ky = y.length;
      while (y[ky - 1] === 0) {
        ky--;
      }
      b = y[ky - 1];
      a = 0;
      while (b) {
        a++;
        b >>= 1;
      }
      a = bpe - a;
      this._leftShift_(y, a);
      this._leftShift_(r, a);
      kx = r.length;
      while (r[kx - 1] === 0 && kx > ky) {
        kx--;
      }
      this._copyInt_(q, 0);
      while (!greaterShift(y, r, kx - ky)) {
        this._subShift_(r, y, kx - ky);
        q[kx - ky]++;
      }
      i = kx;
      while ((i - 1) >= ky) {
        i--;
        if (r[i] === y[ky - 1]) {
          q[i - ky] = mask;
        } else {
          q[i - ky] = Math.floor((r[i] * radix + r[i - 1]) / y[ky - 1]);
        }
        while (true) {
          y2 = 0;
          if (ky > 1) {
            y2 = y[ky - 2] * q[i - ky];
          }
          c = y2 >> bpe;
          y2 = y2 & mask;
          y1 = c + q[i - ky] * y[ky - 1];
          c = y1 >> bpe;
          y1 = y1 & mask;
          res = void 0;
          if (c === r[i]) {
            if (y1 === r[i - 1]) {
              t = 0;
              if (i > 1) {
                t = r[i - 2];
              }
              res = y2 > t;
            } else {
              res = y1 > r[i - 1];
            }
          } else {
            res = c > r[i];
          }
          if (res) {
            q[i - ky]--;
          } else {
            break;
          }
        }
        this._linCombShift_(r, y, -q[i - ky], i - ky);
        if (negative(r)) {
          this._addShift_(r, y, i - ky);
          q[i - ky]--;
        }
      }
      rightShift_(y, a);
      return rightShift_(r, a);
    };

    BigInt._carry_ = function(x) {
      var b, c, i, k, _i, _ref, _results;
      k = x.length;
      c = 0;
      _results = [];
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        c += x[i];
        b = 0;
        if (c < 0) {
          b = -(c >> bpe);
          c += b * radix;
        }
        x[i] = c & mask;
        _results.push(c = (c >> bpe) - b);
      }
      return _results;
    };

    BigInt._copy_ = function(x, y) {
      var i, k, _i, _j, _ref, _ref1, _results;
      if (x.length < y.length) {
        k = x.length;
      } else {
        k = y.length;
      }
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        x[i] = y[i];
      }
      if (k === x.length) {
        return;
      }
      _results = [];
      for (i = _j = k, _ref1 = x.length - 1; k <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = k <= _ref1 ? ++_j : --_j) {
        _results.push(x[i] = 0);
      }
      return _results;
    };

    BigInt._copyInt_ = function(x, n) {
      var c, i, _i, _ref, _results;
      c = n;
      _results = [];
      for (i = _i = 0, _ref = x.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        x[i] = c & mask;
        _results.push(c >>= bpe);
      }
      return _results;
    };

    BigInt.dup = function(x) {
      var buff;
      buff = new Array(x.length);
      this._copy_(buff, x);
      return buff;
    };

    BigInt.trim = function(x, k) {
      var i, y;
      i = x.length;
      while (i > 0 && x[i - 1] === 0) {
        i = i - 1;
      }
      y = new Array(i + k);
      this._copy_(y, x);
      return y;
    };

    BigInt.findPrimes = function(n) {
      var ans, i, p, s, _i, _j, _ref, _ref1;
      s = new Array(n);
      for (i = _i = 0, _ref = n - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        s[i] = 0;
      }
      s[0] = 2;
      p = 0;
      while (s[p] < n) {
        i = s[p] * s[p];
        while (i < n) {
          s[i] = 1;
          i += s[p];
        }
        p++;
        s[p] = s[p - 1] + 1;
        while (s[p] < n && s[s[p]]) {
          s[p]++;
        }
      }
      ans = new Array(p);
      for (i = _j = 0, _ref1 = p - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        ans[i] = s[i];
      }
      return ans;
    };

    BigInt.millerRabinInt = function(x, b) {
      if (mr_x1.length !== x.length) {
        mr_x1 = dup(x);
        mr_r = dup(x);
        mr_a = dup(x);
      }
      this._copyInt_(mr_a, b);
      return millerRabin(x, mr_a);
    };

    BigInt.millerRabin = function(x, b) {
      var i, j, k, s, _i, _j, _ref, _ref1;
      if (mr_x1.length !== x.length) {
        mr_x1 = dup(x);
        mr_r = dup(x);
        mr_a = dup(x);
      }
      this._copy_(mr_a, b);
      this._copy_(mr_r, x);
      this._copy_(mr_x1, x);
      addInt_(mr_r, -1);
      addInt_(mr_x1, -1);
      k = 0;
      for (i = _i = 0, _ref = mr_r.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        for (j = _j = 1, _ref1 = mask - 1; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 1 <= _ref1 ? ++_j : --_j) {
          if (x[i] & j) {
            s = void 0;
            if (k < mr_r.length + bpe) {
              s = k;
            }
            i = mr_r.length;
            j = mask;
          } else {
            k++;
          }
        }
      }
      if (s != null) {
        this._rightShift_(mr_r, s);
      }
      powMod_(mr_a, mr_r, x);
      if (!equalsInt(mr_a, 1) && !equals(mr_a, mr_x1)) {
        j = 1;
        while (j <= s - 1 && !equals(mr_a, mr_x1)) {
          squareMod_(mr_a, x);
          if (equalsInt(mr_a, 1)) {
            return false;
          }
          j++;
        }
        if (!equals(mr_a, mr_x1)) {
          return false;
        }
      }
      return true;
    };

    BigInt._linComb_ = function(x, y, a, b) {
      var c, i, k, kk, _i, _ref, _results;
      if (x.length < y.length) {
        k = x.length;
      } else {
        k = y.length;
      }
      kk = x.length;
      c = 0;
      for (i = _i = 0, _ref = k - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        c += a * x[i] + b * y[i];
        x[i] = c & mask;
        c >>= bpe;
      }
      i = k;
      _results = [];
      while (i < kk) {
        c += a * x[i];
        x[i++] = c & mask;
        _results.push(c >>= bpe);
      }
      return _results;
    };

    BigInt._linCombShift_ = function(x, y, b, ys) {
      var c, i, k, kk, _results;
      if (x.length < ys + y.length) {
        k = x.length;
      } else {
        k = ys + y.length;
      }
      kk = x.length;
      c = 0;
      i = ys;
      while (i < k) {
        c += x[i] + b * y[i - ys];
        x[i++] = c & mask;
        c >>= bpe;
      }
      i = k;
      _results = [];
      while (c && i < kk) {
        c += x[i];
        x[i++] = c & mask;
        _results.push(c >>= bpe);
      }
      return _results;
    };

    BigInt.randTruePrime = function(k) {
      var ans;
      ans = int2bigInt(0, k, 0);
      randTruePrime_(ans, k);
      return this.trim(ans, 1);
    };

    BigInt.randProbPrime = function(k) {
      if (k >= 600) {
        return randProbPrimeRounds(k, 2);
      }
      if (k >= 550) {
        return randProbPrimeRounds(k, 4);
      }
      if (k >= 500) {
        return randProbPrimeRounds(k, 5);
      }
      if (k >= 400) {
        return randProbPrimeRounds(k, 6);
      }
      if (k >= 350) {
        return randProbPrimeRounds(k, 7);
      }
      if (k >= 300) {
        return randProbPrimeRounds(k, 9);
      }
      if (k >= 250) {
        return randProbPrimeRounds(k, 12);
      }
      if (k >= 200) {
        return randProbPrimeRounds(k, 15);
      }
      if (k >= 150) {
        return randProbPrimeRounds(k, 18);
      }
      if (k >= 100) {
        return randProbPrimeRounds(k, 27);
      }
      return randProbPrimeRounds(k, 40);
    };

    BigInt.randProbPrimeRounds = function(k, n) {
      var B, ans, divisible, i;
      B = 30000;
      ans = int2bigInt(0, k, 0);
      if (primes.length === 0) {
        primes = findPrimes(30000);
      }
      if (rpprb.length !== ans.length) {
        rpprb = dup(ans);
      }
      while (true) {
        this._randBigInt_(ans, k, 0);
        ans[0] |= 1;
        divisible = false;
        i = 0;
        while (i < primes.length && primes[i] <= B) {
          if (modInt(ans, primes[i]) === 0 && !equalsInt(ans, primes[i])) {
            divisible = true;
            break;
          }
          i++;
        }
        i = 0;
        while (i < n && !divisible) {
          this._randBigInt_(rpprb, k, 0);
          while (!greater(ans, rpprb)) {
            randBigInt_(rpprb, k, 0);
            if (!millerRabin(ans, rpprb)) {
              divisible = true;
            }
          }
          i++;
        }
        if (!divisible) {
          return ans;
        }
      }
    };

    BigInt._randTruePrime_ = function(ans, k) {
      var B, c, dd, divisible, j, m, pm, r, recLimit, recSize, w, z, zz, _i;
      if (primes.length === 0) {
        primes = findPrimes(30000);
      }
      if (pows.length === 0) {
        pows = new Array(512);
        for (j = _i = 0; _i <= 511; j = ++_i) {
          pows[j] = Math.pow(2, j / 511.0 - 1.0);
        }
      }
      c = 0.1;
      m = 20;
      recLimit = 20;
      if (s_i2.length !== ans.length) {
        s_i2 = dup(ans);
        s_R = dup(ans);
        s_n1 = dup(ans);
        s_r2 = dup(ans);
        s_d = dup(ans);
        s_x1 = dup(ans);
        s_x2 = dup(ans);
        s_b = dup(ans);
        s_n = dup(ans);
        s_i = dup(ans);
        s_rm = dup(ans);
        s_q = dup(ans);
        s_a = dup(ans);
        s_aa = dup(ans);
      }
      if (k <= recLimit) {
        pm = (1 << ((k + 2) >> 1)) - 1;
        this._copyInt_(ans, 0);
        dd = 1;
        while (dd) {
          dd = 0;
          ans[0] = 1 | (1 << (k - 1)) | Math.floor(Math.random() * (1 << k));
          j = 1;
          while (j < primes.length && (primes[j] & pm) === primes[j]) {
            if (0 === (ans[0] % primes[j])) {
              dd = 1;
              break;
            }
            j++;
          }
        }
        this._carry_(ans);
        return;
      }
      B = c * k * k;
      if (k > 2 * m) {
        r = 1;
        while (k - k * r <= m) {
          r = pows[Math.floor(Math.random() * 512)];
        }
      } else {
        r = 0.5;
      }
      recSize = Math.floor(r * k) + 1;
      this._randTruePrime_(s_q, recSize);
      this._copyInt_(s_i2, 0);
      s_i2[Math.floor((k - 2) / bpe)] |= 1 << ((k - 2) % bpe);
      divide_(s_i2, s_q, s_i, s_rm);
      z = bitSize(s_i);
      while (true) {
        while (true) {
          randBigInt_(s_R, z, 0);
          if (greater(s_i, s_R)) {
            break;
          }
        }
        this._addInt_(s_R, 1);
        this._add_(s_R, s_i);
        this._copy_(s_n, s_q);
        this._mult_(s_n, s_R);
        this._multInt_(s_n, 2);
        this._addInt_(s_n, 1);
        this._copy_(s_r2, s_R);
        this._multInt_(s_r2, 2);
        divisible = false;
        j = 0;
        while (j < primes.length && primes[j] < B) {
          if (modInt(s_n, primes[j]) === 0 && !equalsInt(s_n, primes[j])) {
            divisible = true;
            break;
          }
        }
        if (!divisible) {
          if (!millerRabinInt(s_n, 2)) {
            divisible = true;
          }
        }
        if (!divisible) {
          this._addInt_(s_n, -3);
          j = s_n.length - 1;
          while (s_n[j] === 0 && j > 0) {
            zz = 0;
            w = s_n[j];
            zz = 0;
            w = s_n[j];
            while (w != null) {
              zz += bpe * j;
              while (true) {
                this._randBigInt_(s_a, zz, 0);
                if (greater(s_n, s_a)) {
                  break;
                }
              }
              this._addInt_(s_n, 3);
              this._addInt_(s_a, 2);
              this._copy_(s_b, s_a);
              this._copy_(s_n1, s_n);
              this._addInt_(s_n1, -1);
              this._powMod_(s_b, s_n1, s_n);
              this._addInt_(s_b, -1);
              if (isZero(s_b)) {
                copy_(s_b, s_a);
                powMod_(s_b, s_r2, s_n);
                addInt_(s_b, -1);
                copy_(s_aa, s_n);
                copy_(s_d, s_b);
                GCD_(s_d, s_n);
                if (equalsInt(s_d, 1)) {
                  this._copy_(ans, s_aa);
                  return;
                }
              }
              w >>= 1;
              zz++;
            }
            j--;
          }
        }
      }
    };

    BigInt.randBigInt = function(n, s) {
      var a, b;
      a = Math.floor((n - 1) / bpe) + 2;
      b = int2bigInt(0, 0, a);
      this._randBigInt_(b, n, s);
      return b;
    };

    BigInt._randBigInt_ = function(b, n, s) {
      var a, i, _i, _j, _ref, _ref1;
      for (i = _i = 0, _ref = b.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        b[i] = 0;
      }
      a = Math.floor((n - 1) / bpe) + 1;
      for (i = _j = 0, _ref1 = a - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = 0 <= _ref1 ? ++_j : --_j) {
        b[i] = Math.floor(Math.random() * (1 << (bpe - 1)));
      }
      b[a - 1] &= (2 << ((n - 1) % bpe)) - 1;
      if (s) {
        return b[a - 1] |= 1 << ((n - 1) % bpe);
      }
    };

    BigInt.GCD = function(x, y) {
      var xc, yc;
      xc = dup(x);
      yc = dup(y);
      this._GCD_(xc, yc);
      return xc;
    };

    BigInt._GCD_ = function(x, y) {
      var A, B, C, D, i, q, qp, sing, xp, yp, _i, _ref, _results;
      if (T.length !== x.length) {
        T = dup(x);
      }
      sing = 1;
      while (sing) {
        sing = false;
        for (i = _i = 1, _ref = y.length - 1; 1 <= _ref ? _i <= _ref : _i >= _ref; i = 1 <= _ref ? ++_i : --_i) {
          if (y[i]) {
            sing = true;
            break;
          }
          if (!sing) {
            break;
          }
          i = x.length;
          while (!x[i] && i >= 0) {
            i--;
          }
          xp = x[i];
          yp = y[i];
          A = 1;
          B = 0;
          C = 0;
          D = 1;
          while ((yp + C) && (yp + D)) {
            q = Math.floor((xp + A) / (yp + C));
            qp = Math.floor((xp + B) / (yp + D));
            if (q !== qp) {
              break;
            }
            t = A - q * C;
            A = C;
            C = t;
            t = B - q * D;
            B = D;
            D = t;
            t = xp - q * yp;
            xp = yp;
            yp = t;
          }
          if (B) {
            this._copy_(T, x);
            this._linComb_(x, y, A, B);
            this._linComb_(y, T, D, C);
          } else {
            this._mod_(x, y);
            this._copy_(T, x);
            this._copy_(x, y);
            this._copy_(y, T);
          }
        }
      }
      if (y[0] === 0) {
        return;
      }
      t = this.modInt(x, y[0]);
      this._copyInt_(x, y[0]);
      y[0] = t;
      _results = [];
      while (y[0]) {
        x[0] %= y[0];
        t = x[0];
        x[0] = y[0];
        _results.push(y[0] = t);
      }
      return _results;
    };

    BigInt._inverseMod_ = function(x, n) {
      var k;
      k = 1 + 2 * Math.max(x.length, n.length);
      if (!x[0] & 1 && !n[0] & 1) {
        this._copyInt_(x, 0);
        return 0;
      }
      if (eg_u.length !== k) {
        eg_u = new Array(k);
        eg_v = new Array(k);
        eg_A = new Array(k);
        eg_B = new Array(k);
        eg_C = new Array(k);
        eg_D = new Array(k);
      }
      this._copy_(eg_u, x);
      this._copy_(eg_v, n);
      this._copyInt_(eg_A, 1);
      this._copyInt_(eg_B, 0);
      this._copyInt_(eg_C, 0);
      this._copyInt_(eg_D, 1);
      while (true) {
        while (!eg_u[0] & 1) {
          this._halve_(eg_u);
          if (!eg_A[0] & 1 && !eg_B[0] & 1) {
            halve_(eg_A);
            halve_(eg_B);
          } else {
            add_(eg_A, n);
            halve_(eg_A);
            sub_(eg_B, x);
            halve_(eg_B);
          }
        }
        while (!eg_v[0] & 1) {
          halve_(eg_v);
          if (!eg_C[0] & 1 && !eg_D[0] & 1) {
            halve_(eg_C);
            halve_(eg_D);
          } else {
            add_(eg_C, n);
            halve_(eg_C);
            sub_(eg_D, x);
            halve_(eg_D);
          }
        }
        if (!greater(eg_v, eg_u)) {
          sub_(eg_u, eg_v);
          sub_(eg_A, eg_C);
          sub_(eg_B, eg_D);
        } else {
          sub_(eg_v, eg_u);
          sub_(eg_C, eg_A);
          sub_(eg_D, eg_B);
        }
        if (equalsInt(eg_u, 0)) {
          while (negative(eg_C)) {
            add_(eg_C, n);
            copy_(x, eg_C);
            if (!equalsInt(eg_v, 1)) {
              copyInt_(x, 0);
              return 0;
            }
          }
          return 1;
        }
      }
    };

    BigInt.inverseModInt = function(x, n) {
      var a, b;
      a = 1;
      b = 0;
      while (true) {
        if (x === 1) {
          return a;
        }
        if (x === 0) {
          return 0;
        }
        b -= a * Math.floor(n / x);
        n %= x;
        if (n === 1) {
          return b;
        }
        if (n === 0) {
          return 0;
        }
        a -= b * Math.floor(x / n);
        x %= n;
      }
    };

    BigInt._eGCD_ = function(x, y, v, a, b) {
      var g, k;
      g = 0;
      k = Math.max(x.length, y.length);
      if (eg_u.length !== k) {
        eg_u = new Array(k);
        eg_A = new Array(k);
        eg_B = new Array(k);
        eg_C = new Array(k);
        eg_D = new Array(k);
      }
      while (!x[0] & 1 && !y[0] & 1) {
        halve_(x);
        halve_(y);
        g++;
      }
      this._copy_(eg_u, x);
      this._copy_(v, y);
      this._copyInt_(eg_A, 1);
      this._copyInt_(eg_B, 0);
      this._copyInt_(eg_C, 0);
      this._copyInt_(eg_D, 1);
      while (true) {
        while (!eg_u[0] & 1) {
          halve_(eg_u);
          if (!eg_A[0] & 1 && !eg_B[0] & 1) {
            halve_(eg_A);
            halve_(eg_B);
          } else {
            add_(eg_A, y);
            halve_(eg_A);
            sub_(eg_B, x);
            halve_(eg_B);
          }
        }
        while (!v[0] & 1) {
          halve_(v);
          if (!eg_C[0] & 1 && !eg_D[0] & 1) {
            halve_(eg_C);
            halve_(eg_D);
          } else {
            add_(eg_C, y);
            halve_(eg_C);
            sub_(eg_D, x);
            halve_(eg_D);
          }
        }
        if (greater(v, eg_u)) {
          sub_(eg_u, v);
          sub_(eg_A, eg_C);
          sub_(eg_B, eg_D);
        } else {
          sub_(v, eg_u);
          sub_(eg_C, eg_A);
          sub_(eg_D, eg_B);
        }
        if (equalsInt(eg_u, 0)) {
          while (negative(eg_C)) {
            add_(eg_C, y);
            sub_(eg_D, x);
          }
          multInt_(eg_D, -1);
          copy_(a, eg_C);
          copy_(b, eg_D);
          leftShift_(v, g);
          return;
        }
      }
    };

    BigInt.greaterShift = function(x, y, shift) {
      var i, k, kx, ky;
      kx = x.length;
      ky = y.length;
      if ((kx + shift) < ky) {
        k = kx + shift;
      } else {
        k = ky;
      }
      i = ky - 1 - shift;
      while (i < kx && i >= 0) {
        if (x[i] > 0) {
          return 1;
        }
        i++;
      }
      i = kx - 1 + shift;
      while (i < ky) {
        if (y[i] > 0) {
          return 0;
        }
        i++;
      }
      i = k - 1;
      while (i >= shift) {
        if (x[i - shift] > y[i]) {
          return 1;
        } else if (x[i - shift] < y[i]) {
          return 0;
        }
        i--;
      }
      return 0;
    };

    BigInt._expandBufferLength_ = function(x, y) {
      if (x.length > y.length) {
        return x.length + 1;
      } else {
        return y.length + 1;
      }
    };

    return BigInt;

  })();

  exports.BigInt = BigInt;

}).call(this);

},{}],"akbUIo":[function(require,module,exports){
(function() {
  var HmacSHA256;

  HmacSHA256 = (function() {
    var SHA256, iKey, oKey, sha256;

    function HmacSHA256() {}

    SHA256 = require('SHA256').SHA256;

    sha256 = new SHA256();

    iKey = [];

    oKey = [];

    HmacSHA256.prototype.init = function(s) {
      var blockSize, i, key, _results;
      blockSize = 64;
      if (typeof s === 'string') {
        if (s.length < blockSize) {
          while (s.length < blockSize) {
            s = s + String.fromCharCode(0);
          }
        }
        key = sha256.str2binb(s);
      } else {
        if (s.length < blockSize) {
          while (s.length < blockSize) {
            s.push(0);
          }
        }
        key = sha256.array2binb(s);
      }
      i = 0;
      _results = [];
      while (i < key.length) {
        oKey[i] = key[i] ^ 0x5c5c5c5c;
        iKey[i] = key[i] ^ 0x36363636;
        _results.push(i = i + 1);
      }
      return _results;
    };

    HmacSHA256.prototype.hmac = function(s) {
      var innerDigest, innerInput, outerInput;
      innerInput = iKey.concat(sha256.str2binb(s));
      innerDigest = sha256.core_sha256(innerInput, iKey.length * 32 + s.length * 8);
      outerInput = oKey.concat(innerDigest);
      return sha256.binb2hex(sha256.core_sha256(outerInput, oKey.length * 32 + innerDigest.length * 32));
    };

    return HmacSHA256;

  })();

  exports.HmacSHA256 = HmacSHA256;

}).call(this);

},{"SHA256":"EqKf60"}],"HmacSHA256":[function(require,module,exports){
module.exports=require('akbUIo');
},{}],"c9W1Ra":[function(require,module,exports){

/*
Author: Mariusz Nowostawski, and others. See AUTHORS.
Copyright (C) 2014 Mariusz Nowostawski, and others. See LICENSE.
 */

(function() {
  exports.Base64 = require('./base64');

  exports.Random = require('./random');

  exports.BigInt = require('./bigint');

}).call(this);

},{"./base64":"D+r4VZ","./bigint":"R/V1wN","./random":"M+uFHl"}],"KiwiCrypto":[function(require,module,exports){
module.exports=require('c9W1Ra');
},{}],"Random":[function(require,module,exports){
module.exports=require('M+uFHl');
},{}],"M+uFHl":[function(require,module,exports){

/*
Author: Mariusz Nowostawski, and others. See AUTHORS.
Copyright (C) 2014 Mariusz Nowostawski, and others. See LICENSE.
 */

(function() {
  var RC4, Random;

  RC4 = (function() {
    var S, i, j;

    function RC4() {}

    i = 0;

    j = 0;

    S = new Array();

    RC4.prototype.init = function(key) {
      var _i, _j, _ref;
      for (i = _i = 0; _i <= 255; i = ++_i) {
        S[i] = i;
      }
      j = 0;
      for (i = _j = 0; _j <= 255; i = ++_j) {
        j = (j + S[i] + key[i % key.length]) & 255;
        _ref = [S[j], S[i]], S[i] = _ref[0], S[j] = _ref[1];
      }
      i = 0;
      return j = 0;
    };

    RC4.prototype.next = function() {
      var _ref;
      i = (i + 1) & 255;
      j = (j + S[i]) & 255;
      _ref = [S[j], S[i]], S[i] = _ref[0], S[j] = _ref[1];
      return S[(S[j] + S[i]) & 255];
    };

    return RC4;

  })();

  Random = (function() {
    var pool, pptr, state;

    Random.POOL_SIZE = 256;

    state = void 0;

    pool = null;

    pptr = null;

    function Random() {
      var i, t, _i, _ref;
      pool = new Array();
      pptr = 0;
      while (pptr < this.POOL_SIZE) {
        t = Math.floor(65536 * Math.random());
        pool[pptr++] = t >>> 8;
        pool[pptr++] = t & 255;
      }
      pptr = 0;
      this.mixinSeedTime();
      state = new RC4();
      state.init(pool);
      for (i = _i = 0, _ref = pool.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        pool[i] = 0;
      }
      pptr = 0;
    }

    Random.prototype.mixinSeed = function(x) {
      pool[pptr++] ^= x & 255;
      pool[pptr++] ^= (x >> 8) & 255;
      pool[pptr++] ^= (x >> 16) & 255;
      pool[pptr++] ^= (x >> 24) & 255;
      if (pptr >= this.POOL_SIZE) {
        return pptr -= this.POOL_SIZE;
      }
    };

    Random.prototype.mixinSeedTime = function() {
      return this.mixinSeed(new Date().getTime());
    };

    Random.prototype.nextByte = function() {
      return state.next();
    };

    return Random;

  })();

  exports.Random = Random;

}).call(this);

},{}],"EqKf60":[function(require,module,exports){
(function() {
  'use strict';
  var SHA256;

  SHA256 = (function() {
    var Ch, Gamma0256, Gamma1256, Maj, R, S, Sigma0256, Sigma1256, chrsz, safe_add;

    function SHA256() {}

    chrsz = 8;

    safe_add = function(x, y) {
      var lsw, msw;
      lsw = (x & 0xFFFF) + (y & 0xFFFF);
      msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xFFFF);
    };

    S = function(X, n) {
      return (X >>> n) | (X << (32 - n));
    };

    R = function(X, n) {
      return X >>> n;
    };

    Ch = function(x, y, z) {
      return (x & y) ^ ((~x) & z);
    };

    Maj = function(x, y, z) {
      return (x & y) ^ (x & z) ^ (y & z);
    };

    Sigma0256 = function(x) {
      return S(x, 2) ^ S(x, 13) ^ S(x, 22);
    };

    Sigma1256 = function(x) {
      return S(x, 6) ^ S(x, 11) ^ S(x, 25);
    };

    Gamma0256 = function(x) {
      return S(x, 7) ^ S(x, 18) ^ R(x, 3);
    };

    Gamma1256 = function(x) {
      return S(x, 17) ^ S(x, 19) ^ R(x, 10);
    };

    SHA256.prototype.core_sha256 = function(m, l) {
      var HASH, K, T1, T2, W, a, b, c, d, e, f, g, h, i, j, _i;
      K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3, 0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786, 0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA, 0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147, 0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13, 0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070, 0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208, 0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);
      HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
      W = new Array(64);
      m[l >> 5] |= 0x80 << (24 - l % 32);
      m[((l + 64 >> 9) << 4) + 15] = l;
      i = 0;
      while (i < m.length) {
        a = HASH[0];
        b = HASH[1];
        c = HASH[2];
        d = HASH[3];
        e = HASH[4];
        f = HASH[5];
        g = HASH[6];
        h = HASH[7];
        for (j = _i = 0; _i <= 63; j = ++_i) {
          if (j < 16) {
            W[j] = m[j + i];
          } else {
            W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
          }
          T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
          T2 = safe_add(Sigma0256(a), Maj(a, b, c));
          h = g;
          g = f;
          f = e;
          e = safe_add(d, T1);
          d = c;
          c = b;
          b = a;
          a = safe_add(T1, T2);
        }
        HASH[0] = safe_add(a, HASH[0]);
        HASH[1] = safe_add(b, HASH[1]);
        HASH[2] = safe_add(c, HASH[2]);
        HASH[3] = safe_add(d, HASH[3]);
        HASH[4] = safe_add(e, HASH[4]);
        HASH[5] = safe_add(f, HASH[5]);
        HASH[6] = safe_add(g, HASH[6]);
        HASH[7] = safe_add(h, HASH[7]);
        i += 16;
      }
      return HASH;
    };

    SHA256.prototype.str2binb = function(str) {
      var bin, i, mask;
      bin = Array();
      mask = (1 << chrsz) - 1;
      i = 0;
      while (i < str.length * chrsz) {
        bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        i += chrsz;
      }
      return bin;
    };

    SHA256.prototype.array2binb = function(arr) {
      var bin, i, mask;
      bin = Array();
      mask = (1 << chrsz) - 1;
      i = 0;
      while (i < arr.length * chrsz) {
        bin[i >> 5] |= (arr[i / chrsz] & mask) << (24 - i % 32);
        i += chrsz;
      }
      return bin;
    };

    SHA256.prototype.binb2hex = function(binarray) {
      var hex_tab, i, str, _i, _ref;
      hex_tab = "0123456789abcdef";
      str = "";
      for (i = _i = 0, _ref = (binarray.length * 4) - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) + hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
      }
      return str;
    };

    SHA256.prototype.hash = function(s) {
      return this.binb2hex(this.core_sha256(this.str2binb(s), s.length * chrsz));
    };

    return SHA256;

  })();

  exports.SHA256 = SHA256;

}).call(this);

},{}],"SHA256":[function(require,module,exports){
module.exports=require('EqKf60');
},{}]},{},["c9W1Ra"])