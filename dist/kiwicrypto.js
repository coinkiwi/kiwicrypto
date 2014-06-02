require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AES256":[function(require,module,exports){
module.exports=require('DXGQ/B');
},{}],"DXGQ/B":[function(require,module,exports){
(function (Buffer){
(function() {
  var AES256, byteToHex, incrementCounterBlock;

  incrementCounterBlock = function(cb) {
    var index;
    index = 15;
    cb[index] = cb[index] + 1;
    while (index > 0 && cb[index] > 0xff) {
      cb[index] = 0;
      index = index - 1;
      cb[index] = cb[index] + 1;
    }
    if (cb[index] > 0xff) {
      cb[index] = 0;
    }
    return cb;
  };

  byteToHex = function(byte) {
    var t;
    t = byte.toString(16);
    if (byte < 10) {
      t = '0' + t;
    }
    return t;
  };

  AES256 = (function() {
    var Base64, SHA256, addRoundKey, cipher, keyExpansion, mixColumns, rCon, rotWord, sBox, shiftRows, subBytes, subWord;

    function AES256() {}

    Base64 = require('Base64').Base64;

    SHA256 = require('SHA256').SHA256;

    sBox = [0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76, 0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0, 0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15, 0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75, 0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84, 0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf, 0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8, 0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2, 0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73, 0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb, 0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79, 0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08, 0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a, 0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e, 0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf, 0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16];

    rCon = [[0x00, 0x00, 0x00, 0x00], [0x01, 0x00, 0x00, 0x00], [0x02, 0x00, 0x00, 0x00], [0x04, 0x00, 0x00, 0x00], [0x08, 0x00, 0x00, 0x00], [0x10, 0x00, 0x00, 0x00], [0x20, 0x00, 0x00, 0x00], [0x40, 0x00, 0x00, 0x00], [0x80, 0x00, 0x00, 0x00], [0x1b, 0x00, 0x00, 0x00], [0x36, 0x00, 0x00, 0x00]];

    subBytes = function(s, Nb) {
      var c, r, _i, _j, _ref;
      for (r = _i = 0; _i <= 3; r = ++_i) {
        for (c = _j = 0, _ref = Nb - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; c = 0 <= _ref ? ++_j : --_j) {
          s[r][c] = sBox[s[r][c]];
        }
      }
      return s;
    };

    shiftRows = function(s, Nb) {
      var c, r, t, _i, _j, _k;
      t = new Array(4);
      for (r = _i = 1; _i <= 3; r = ++_i) {
        for (c = _j = 0; _j <= 3; c = ++_j) {
          t[c] = s[r][(c + r) % Nb];
        }
        for (c = _k = 0; _k <= 3; c = ++_k) {
          s[r][c] = t[c];
        }
      }
      return s;
    };

    mixColumns = function(s, Nb) {
      var a, b, c, i, _i, _j;
      for (c = _i = 0; _i <= 3; c = ++_i) {
        a = new Array(4);
        b = new Array(4);
        for (i = _j = 0; _j <= 3; i = ++_j) {
          a[i] = s[i][c];
          if (s[i][c] & 0x80) {
            b[i] = s[i][c] << 1 ^ 0x011b;
          } else {
            b[i] = s[i][c] << 1;
          }
        }
        s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
        s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
        s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
        s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
      }
      return s;
    };

    addRoundKey = function(state, w, rnd, Nb) {
      var c, r, _i, _j, _ref;
      for (r = _i = 0; _i <= 3; r = ++_i) {
        for (c = _j = 0, _ref = Nb - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; c = 0 <= _ref ? ++_j : --_j) {
          state[r][c] ^= w[rnd * 4 + c][r];
        }
      }
      return state;
    };

    subWord = function(w) {
      var i, _i;
      for (i = _i = 0; _i <= 3; i = ++_i) {
        w[i] = sBox[w[i]];
      }
      return w;
    };

    rotWord = function(w) {
      var i, tmp, _i;
      tmp = w[0];
      for (i = _i = 0; _i <= 2; i = ++_i) {
        w[i] = w[i + 1];
      }
      w[3] = tmp;
      return w;
    };

    cipher = function(input, w) {
      var Nb, Nr, i, output, round, state, _i, _j, _k, _ref, _ref1, _ref2;
      Nb = 4;
      Nr = w.length / Nb - 1;
      state = [[], [], [], []];
      for (i = _i = 0, _ref = 4 * Nb - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        state[i % 4][Math.floor(i / 4)] = input[i];
      }
      state = addRoundKey(state, w, 0, Nb);
      for (round = _j = 1, _ref1 = Nr - 1; 1 <= _ref1 ? _j <= _ref1 : _j >= _ref1; round = 1 <= _ref1 ? ++_j : --_j) {
        state = subBytes(state, Nb);
        state = shiftRows(state, Nb);
        state = mixColumns(state, Nb);
        state = addRoundKey(state, w, round, Nb);
      }
      state = subBytes(state, Nb);
      state = shiftRows(state, Nb);
      state = addRoundKey(state, w, Nr, Nb);
      output = new Array(4 * Nb);
      for (i = _k = 0, _ref2 = 4 * Nb - 1; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        output[i] = state[i % 4][Math.floor(i / 4)];
      }
      return output;
    };

    keyExpansion = function(key) {
      var Nb, Nk, Nr, i, r, t, temp, w, _i, _j, _k, _l, _m, _ref, _ref1;
      Nb = 4;
      Nk = key.length / 4;
      Nr = Nk + 6;
      w = new Array(Nb * (Nr + 1));
      temp = new Array(4);
      for (i = _i = 0, _ref = Nk - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
        w[i] = r;
      }
      for (i = _j = Nk, _ref1 = (Nb * (Nr + 1)) - 1; Nk <= _ref1 ? _j <= _ref1 : _j >= _ref1; i = Nk <= _ref1 ? ++_j : --_j) {
        w[i] = new Array(4);
        for (t = _k = 0; _k <= 3; t = ++_k) {
          temp[t] = w[i - 1][t];
        }
        if (i % Nk === 0) {
          temp = subWord(rotWord(temp));
          for (t = _l = 0; _l <= 3; t = ++_l) {
            temp[t] = temp[t] ^ rCon[i / Nk][t];
          }
        } else if (Nk > 6 && (i % Nk) === 4) {
          temp = subWord(temp);
        }
        for (t = _m = 0; _m <= 3; t = ++_m) {
          w[i][t] = w[i - Nk][t] ^ temp[t];
        }
      }
      return w;
    };

    AES256.prototype.encrypt = function(plaintext, secret) {
      var b, blockCount, blockLength, blockSize, cipherChar, cipherCntr, ciphertext, ciphertxt, counterBlock, ctrTxt, i, key, keySchedule, nonce, nonceMs, nonceRnd, nonceSec, _i, _j, _k, _l, _m, _n, _o, _ref, _ref1;
      blockSize = 16;
      key = new Buffer(secret, 'hex');
      if (key.length !== 32) {
        console.log('AES256 encrypt() ERROR: wrong key length', key.length);
        return null;
      }
      counterBlock = new Array(blockSize);
      nonce = (new Date()).getTime();
      nonceMs = nonce % 1000;
      nonceSec = Math.floor(nonce / 1000);
      nonceRnd = Math.floor(Math.random() * 0xffff);
      for (i = _i = 0; _i <= 1; i = ++_i) {
        counterBlock[i] = (nonceMs >>> i * 8) & 0xff;
      }
      for (i = _j = 0; _j <= 1; i = ++_j) {
        counterBlock[i + 2] = (nonceRnd >>> i * 8) & 0xff;
      }
      for (i = _k = 0; _k <= 3; i = ++_k) {
        counterBlock[i + 4] = (nonceSec >>> i * 8) & 0xff;
      }
      for (i = _l = 8; _l <= 15; i = ++_l) {
        counterBlock[i] = Math.floor(Math.random() * 0xff);
      }
      ctrTxt = '';
      for (i = _m = 0; _m <= 15; i = ++_m) {
        ctrTxt += byteToHex(counterBlock[i]);
      }
      keySchedule = keyExpansion(key);
      blockCount = Math.ceil(plaintext.length / blockSize);
      ciphertxt = new Array(blockCount);
      for (b = _n = 0, _ref = blockCount - 1; 0 <= _ref ? _n <= _ref : _n >= _ref; b = 0 <= _ref ? ++_n : --_n) {
        cipherCntr = cipher(counterBlock, keySchedule);
        if (b < blockCount - 1) {
          blockLength = blockSize;
        } else {
          blockLength = (plaintext.length - 1) % blockSize + 1;
        }
        cipherChar = new Array(blockLength);
        for (i = _o = 0, _ref1 = blockLength - 1; 0 <= _ref1 ? _o <= _ref1 : _o >= _ref1; i = 0 <= _ref1 ? ++_o : --_o) {
          cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
          cipherChar[i] = byteToHex(cipherChar[i]);
        }
        ciphertxt[b] = cipherChar.join('');
        incrementCounterBlock(counterBlock);
      }
      ciphertext = ctrTxt + ciphertxt.join('');
      return ciphertext;
    };

    AES256.prototype.decrypt = function(ciphertext, secret) {
      var b, blockSize, cipherCntr, counterBlock, ct, ctrTxt, i, key, keySchedule, nBlocks, plaintxt, plaintxtByte, _i, _j, _k, _l, _ref, _ref1, _ref2;
      blockSize = 16;
      ciphertext = new Buffer(ciphertext, 'hex');
      key = new Buffer(secret, 'hex');
      if (key.length !== 32) {
        console.log("AES256 decrypt() ERROR: wrong key length ", key.length);
        return null;
      }
      counterBlock = new Array(16);
      ctrTxt = ciphertext.slice(0, 16);
      for (i = _i = 0; _i <= 15; i = ++_i) {
        counterBlock[i] = ctrTxt.readUInt8(i);
      }
      keySchedule = keyExpansion(key);
      nBlocks = Math.ceil((ciphertext.length - 16) / blockSize);
      ct = new Array(nBlocks);
      for (b = _j = 0, _ref = nBlocks - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; b = 0 <= _ref ? ++_j : --_j) {
        ct[b] = ciphertext.slice(16 + b * blockSize, 16 + b * blockSize + blockSize);
      }
      ciphertext = ct;
      plaintxt = new Array(ciphertext.length);
      for (b = _k = 0, _ref1 = nBlocks - 1; 0 <= _ref1 ? _k <= _ref1 : _k >= _ref1; b = 0 <= _ref1 ? ++_k : --_k) {
        cipherCntr = cipher(counterBlock, keySchedule);
        plaintxtByte = new Array(ciphertext[b].length);
        for (i = _l = 0, _ref2 = ciphertext[b].length - 1; 0 <= _ref2 ? _l <= _ref2 : _l >= _ref2; i = 0 <= _ref2 ? ++_l : --_l) {
          plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].readUInt8(i);
          plaintxtByte[i] = byteToHex(plaintxtByte[i]);
        }
        plaintxt[b] = plaintxtByte.join('');
        incrementCounterBlock(counterBlock);
      }
      plaintxt = plaintxt.join('');
      return plaintxt;
    };

    return AES256;

  })();

  exports.AES256 = AES256;

  exports.incrementCounterBlock = incrementCounterBlock;

}).call(this);

}).call(this,require("buffer").Buffer)
},{"Base64":"D+r4VZ","SHA256":"EqKf60","buffer":15}],"D+r4VZ":[function(require,module,exports){
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

},{}],"BigInt":[function(require,module,exports){
module.exports=require('R/V1wN');
},{}],"HmacSHA256":[function(require,module,exports){
module.exports=require('akbUIo');
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

},{"SHA256":"EqKf60"}],"c9W1Ra":[function(require,module,exports){

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

},{}],"SHA256":[function(require,module,exports){
module.exports=require('EqKf60');
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

    SHA256.prototype.hex2ascii = function(hexx) {
      var hex, i, str;
      hex = hexx.toString();
      str = '';
      i = 0;
      while (i < hex.length) {
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        i = i + 2;
      }
      return str;
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

},{}],15:[function(require,module,exports){
/**
 * The buffer module from node.js, for the browser.
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install buffer`
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
   // Detect if browser supports Typed Arrays. Supported browsers are IE 10+,
   // Firefox 4+, Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+.
  if (typeof Uint8Array !== 'function' || typeof ArrayBuffer !== 'function')
    return false

  // Does the browser support adding properties to `Uint8Array` instances? If
  // not, then that's the same as no `Uint8Array` support. We need to be able to
  // add all the node Buffer API methods.
  // Bug in Firefox 4-29, now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var arr = new Uint8Array(0)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // Assume object is an array
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof Uint8Array === 'function' &&
      subject instanceof Uint8Array) {
    // Speed optimization -- use set if we're copying from a Uint8Array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  // copy!
  for (var i = 0; i < end - start; i++)
    target[i + target_start] = this[i + start]
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array === 'function') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment the Uint8Array *instance* (not the class!) with Buffer methods
 */
function augment (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":16,"ieee754":17}],16:[function(require,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var ZERO   = '0'.charCodeAt(0)
	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	module.exports.toByteArray = b64ToByteArray
	module.exports.fromByteArray = uint8ToBase64
}())

},{}],17:[function(require,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}]},{},["c9W1Ra"])