#
#
# HMAC wish SHA256
#
# See: http://csrc.nist.gov/publications/fips/fips198-1/FIPS-198-1_final.pdf
# and http://csrc.nist.gov/groups/ST/toolkit/message_auth.html
#
# Tests also taken from:
#   https://tools.ietf.org/html/rfc4868
#
# Author: Mariusz Nowostawski
# April 2014
#
class HmacSHA256

  { SHA256 } = require 'SHA256'
  sha256 = new SHA256()

  iKey = []
  oKey = []


  #
  # init the HmacSHA256 with a given string or byteArray key
  # if the argument is string, it is assumed ASCII
  # otherwise it will be treated as [] of bytes.
  #
  init: (s) ->

    # Shortcuts
    blockSize = 64

    # If the key is longer than 256 bytes
    # we just use the SHA256 hash as key

    if typeof s is 'string'
      if s.length < blockSize
        while s.length < blockSize
          s = s + String.fromCharCode(0)
      key = sha256.str2binb(s)
    else
      if s.length < blockSize
        while s.length < blockSize
          s.push 0
      key = sha256.array2binb(s)

    #if key.length > blockSizeBytes
    #  throw {error: 'We do not deal with this case yet'}
    # key = sha256.hash(s)

    # Prepare keys for inner and outer hashes
    i = 0
    while i < key.length
      oKey[i] = key[i] ^ 0x5c5c5c5c
      iKey[i] = key[i] ^ 0x36363636
      i = i + 1

  hmac: (s) ->
    innerInput = iKey.concat(sha256.str2binb(s))
    innerDigest = sha256.core_sha256(innerInput,
      iKey.length * 32 + s.length * 8)

    outerInput = oKey.concat(innerDigest)
    return sha256.binb2hex(sha256.core_sha256(outerInput,
      oKey.length * 32 + innerDigest.length * 32))


exports.HmacSHA256 = HmacSHA256