'use strict'



# constants
b64map = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='


#
# Represents utility class for Base64 encoding/decoding.
# See [http://tools.ietf.org/html/rfc4648]
#
class Base64

  #
  # Convert string to hex.
  # @param str [String]
  # @return [String] hex representation of the given string.
  #
  @stringToHex: (str) ->
    str = '' if not str?
    hs = ''

    for i in [0..str.length - 1]
      hv = str.charCodeAt(i).toString(16)
      if hv.length is 1
        hs += '0' + hv
      else
        hs += hv

    return hs



  #
  # Convert hex to string.
  # @param str [String] hex representation of a string
  # @return [String] the actual string
  @hexToString: (str) ->
    str = '' if not str?
    s = ''
    for i in [0..str.length - 1] by 2
      s += String.fromCharCode parseInt(str.substring(i, i + 2), 16)

    return s





  #
  # Converts/encodes plain string to base64.
  #
  # @param str [String] input string
  # @return [String] base64 encoded string
  #
  @encode: (str) ->
    str = '' if not str?
    pad = ''
    e = []

    # pad string to multiples of 3
    c = str.length % 3
    if (c > 0)
      for i in [c..2]
        pad += '='
        str += '\0'

    for i in [0..str.length - 1] by 3
      o1 = str.charCodeAt i
      o2 = str.charCodeAt i + 1
      o3 = str.charCodeAt i + 2

      bits = o1 << 16 | o2 << 8 | o3

      h1 = bits >> 18 & 0x3f
      h2 = bits >>12 & 0x3f
      h3 = bits >> 6 & 0x3f
      h4 = bits & 0x3f


      e[i / 3] = b64map.charAt(h1) + b64map.charAt(h2) +
        b64map.charAt(h3) + b64map.charAt(h4)

    coded = e.join('')
    coded.slice(0, coded.length - pad.length) + pad



  #
  # Converts/decodes base64 encoded string to plain string.
  # @param str [String] base64 encoded string
  # @return [String] plain string
  #
  @decode: (str) ->
    str = '' if not str?
    d = []

    for i in [0..str.length - 1] by 4
      h1 = b64map.indexOf str.charAt i
      h2 = b64map.indexOf str.charAt i + 1
      h3 = b64map.indexOf str.charAt i + 2
      h4 = b64map.indexOf str.charAt i + 3

      bits = h1 << 18 | h2 << 12 | h3 << 6 | h4

      o1 = bits >>> 16 & 0xff
      o2 = bits >>> 8 & 0xff
      o3 = bits & 0xff

      d[i / 4] = String.fromCharCode o1, o2, o3

      if h4 is 0x40
        d[i / 4] = String.fromCharCode o1, o2
      if h3 is 0x40
        d[i / 4] = String.fromCharCode o1

    d.join('')


exports.Base64 = Base64
