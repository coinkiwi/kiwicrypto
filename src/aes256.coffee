
#
# Author: Mariusz Nowostawski (modifications)
# All modifications in public domain.
#
# Original implementation by Chris Veness in JavaScript
# http://www.movable-type.co.uk/scripts/aes.html
#




#
# @param arr CounterBlock, of 16-bytes
#
incrementCounterBlock = (cb) ->
  index = 15
  cb[index] = cb[index] + 1
  while index > 0 and cb[index] > 0xff
    cb[index] = 0
    index = index - 1
    cb[index] = cb[index] + 1

  cb[index] = 0 if cb[index] > 0xff
  cb

#
#
#
byteToHex = (byte) ->
  t = byte.toString(16)
  t = '0' + t if byte < 10
  return t


class AES256

  { Base64 } = require 'Base64'
  { SHA256 } = require 'SHA256'


  #####################################################################
  #
  #   private routines, not called externally
  #
  #####################################################################

  # sBox is pre-computed multiplicative inverse in GF(2^8)
  # used in subBytes and keyExpansion [§5.1.1]
  sBox = [0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,
          0xd7,0xab,0x76,
          0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,
          0xa4,0x72,0xc0,
          0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,
          0xd8,0x31,0x15,
          0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,
          0x27,0xb2,0x75,
          0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,
          0xe3,0x2f,0x84,
          0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,
          0x4c,0x58,0xcf,
          0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,
          0x3c,0x9f,0xa8,
          0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,
          0xff,0xf3,0xd2,
          0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,
          0x5d,0x19,0x73,
          0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,
          0x5e,0x0b,0xdb,
          0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,
          0x95,0xe4,0x79,
          0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,
          0x7a,0xae,0x08,
          0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,
          0xbd,0x8b,0x8a,
          0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,
          0xc1,0x1d,0x9e,
          0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,
          0x55,0x28,0xdf,
          0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,
          0x54,0xbb,0x16]

  # rCon is Round Constant used for the Key Expansion
  # [1st col is 2^(r-1) in GF(2^8)] [§5.2]
  rCon = [[0x00, 0x00, 0x00, 0x00],
          [0x01, 0x00, 0x00, 0x00],
          [0x02, 0x00, 0x00, 0x00],
          [0x04, 0x00, 0x00, 0x00],
          [0x08, 0x00, 0x00, 0x00],
          [0x10, 0x00, 0x00, 0x00],
          [0x20, 0x00, 0x00, 0x00],
          [0x40, 0x00, 0x00, 0x00],
          [0x80, 0x00, 0x00, 0x00],
          [0x1b, 0x00, 0x00, 0x00],
          [0x36, 0x00, 0x00, 0x00]]

  # apply SBox to state S [§5.1.1]
  subBytes = (s, Nb) ->
    for r in [0..3]
      for c in [0..(Nb - 1)]
        s[r][c] = sBox[s[r][c]]

    return s


  # shift row r of state S left by r bytes [§5.1.2]
  shiftRows = (s, Nb) ->
    t = new Array(4)
    for r in [1..3]
      for c in [0..3]
        t[c] = s[r][(c + r) % Nb] # shift into temp copy
      for c in [0..3]
        s[r][c] = t[c]            # and copy back
    # note that this will work for Nb=4,5,6, but not 7,8 (always 4 for AES):
    # see asmaes.sourceforge.net/rijndael/rijndaelImplementation.pdf
    return s


  # combine bytes of each col of state S [§5.1.3]
  mixColumns = (s, Nb) ->
    for c in [0..3]
      a = new Array(4)  # 'a' is a copy of the current column from 's'
      b = new Array(4)  # 'b' is a•{02} in GF(2^8)
      for i in [0..3]
        a[i] = s[i][c]
        if s[i][c] & 0x80
          b[i] = s[i][c] << 1 ^ 0x011b
        else
          b[i] = s[i][c] << 1


      # a[n] ^ b[n] is a•{03} in GF(2^8)
      s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3] # 2*a0 + 3*a1 + a2 + a3
      s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3] # a0 * 2*a1 + 3*a2 + a3
      s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3] # a0 + a1 + 2*a2 + 3*a3
      s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3] # 3*a0 + a1 + a2 + 2*a3

    return s


  # xor Round Key into state S [§5.1.4]
  addRoundKey = (state, w, rnd, Nb) ->
    for r in [0..3]
      for c in [0..(Nb - 1)]
        state[r][c] ^= w[rnd * 4 + c][r]

    return state


  # apply SBox to 4-byte word w
  subWord = (w) ->
    for i in [0..3]
      w[i] = sBox[w[i]]
    return w


  # rotate 4-byte word w left by one byte
  rotWord = (w) ->
    tmp = w[0]
    for i in [0..2]
      w[i] = w[i + 1]
    w[3] = tmp
    return w



  #
  # AES Cipher function: encrypt 'input' state with Rijndael algorithm
  # applies Nr rounds (10/12/14) using key schedule w for 'add round key' stage
  #
  # @param {Number[]} input 16-byte (128-bit) input state array
  # @param {Number[][]} w   Key schedule as 2D byte-array (Nr+1 x Nb bytes)
  # @returns {Number[]}     Encrypted output state array
  #
  cipher = (input, w) ->   # main Cipher function [§5.1]

    # block size (in words): no of columns
    # in state (fixed at 4 for AES)
    Nb = 4
    Nr = w.length / Nb - 1   # no of rounds: 10/12/14 for 128/192/256-bit keys

    # initialise 4xNb byte-array 'state' with input [§3.4]
    state = [[],[],[],[]]
    for i in [ 0.. (4 * Nb - 1)]
      state[i % 4][Math.floor(i / 4)] = input[i]

    state = addRoundKey(state, w, 0, Nb)

    for round in [1..(Nr - 1)]
      state = subBytes(state, Nb)
      state = shiftRows(state, Nb)
      state = mixColumns(state, Nb)
      state = addRoundKey(state, w, round, Nb)


    state = subBytes(state, Nb)
    state = shiftRows(state, Nb)
    state = addRoundKey(state, w, Nr, Nb)

    # convert state to 1-d array before returning [§3.4]
    output = new Array(4 * Nb)
    for i in [0..(4 * Nb - 1)]
      output[i] = state[i % 4][Math.floor(i / 4)]

    return output


  #
  # Perform Key Expansion to generate a Key Schedule
  #
  # @param {Number[]} key Key as 16/24/32-byte array
  # @returns {Number[][]} Expanded key schedule as
  # 2D byte-array (Nr+1 x Nb bytes)
  #
  keyExpansion = (key) ->
    # generate Key Schedule (byte-array Nr+1 x Nb) from Key [§5.2]
    # block size (in words): no of columns in state
    # (fixed at 4 for AES)
    # key length (in words): 4/6/8 for 128/192/256-bit keys
    # no of rounds: 10/12/14 for 128/192/256-bit keys
    Nb = 4
    Nk = key.length / 4
    Nr = Nk + 6

    w = new Array(Nb * (Nr + 1))
    temp = new Array(4)

    for i in [0..(Nk - 1)]
      r = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]]
      w[i] = r


    for i in [Nk..(Nb * (Nr + 1)) - 1]
      w[i] = new Array(4)
      for t in [0..3]
        temp[t] = w[i - 1][t]
      if (i % Nk is 0)
        temp = subWord(rotWord(temp))
        for t in [0..3]
          temp[t] = temp[t] ^ rCon[i / Nk][t]
      else if (Nk > 6 and (i % Nk) is 4)
        temp = subWord(temp)

      for t in [0..3]
        w[i][t] = w[i - Nk][t] ^ temp[t]

    return w









  # Encrypt a text using AES encryption in Counter mode of operation
  #
  # Unicode multi-byte character safe
  #
  # @param {String} plaintext Source text to be encrypted
  # @param {String} secret Encryption string in hex
  # @returns {string} Encrypted text, in HEX format.
  #    The CounterBlock is passed as first 16 bytes
  #
  encrypt: (plaintext, secret) ->
    blockSize = 16 # block size fixed at 16 bytes / 128 bits (Nb=4) for AES
    # standard allows 128/192/256 bit keys, we only use 256

    key = new Buffer(secret, 'hex')

    if key.length isnt 32 # key must be 256bits
      console.log 'AES256 encrypt() ERROR: wrong key length', key.length
      return null

    # initialise 1st 8 bytes of counter block with nonce
    # (NIST SP800-38A §B.2): [0-1] = millisec,
    # [2-3] = random, [4-7] = seconds
    # the remaining 8 bytes are random

    counterBlock = new Array(blockSize)

    nonce = (new Date()).getTime();  # timestamp: milliseconds since 1-Jan-1970
    nonceMs = nonce % 1000
    nonceSec = Math.floor(nonce / 1000)
    nonceRnd = Math.floor(Math.random() * 0xffff)

    for i in [0..1]
      counterBlock[i] = (nonceMs >>> i * 8) & 0xff
    for i in [0..1]
      counterBlock[i + 2] = (nonceRnd >>> i * 8) & 0xff
    for i in [0..3]
      counterBlock[i + 4] = (nonceSec >>> i * 8) & 0xff
    for i in [8..15]
      counterBlock[i] = Math.floor(Math.random() * 0xff)

    # and convert it to a string to go on the front of the ciphertext
    ctrTxt = ''
    for i in [0..15]
      ctrTxt += byteToHex(counterBlock[i])

    # generate key schedule - an expansion of the key into distinct
    # Key Rounds for each round
    keySchedule = keyExpansion(key)

    blockCount = Math.ceil(plaintext.length / blockSize)
    ciphertxt = new Array(blockCount)  # ciphertext as array of strings

    for b in [0..(blockCount - 1)]
      # encrypt counter block
      cipherCntr = cipher(counterBlock, keySchedule)

      # block size is reduced on final block
      if b < blockCount - 1
        blockLength = blockSize
      else
        blockLength = (plaintext.length - 1) % blockSize + 1

      cipherChar = new Array(blockLength)

      for i in [0..(blockLength - 1)]
        # xor plaintext with ciphered counter char-by-char
        cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i)
        cipherChar[i] = byteToHex(cipherChar[i])

      ciphertxt[b] = cipherChar.join('')

      incrementCounterBlock(counterBlock)


    # Array.join is more efficient than repeated string concatenation in IE
    ciphertext = ctrTxt + ciphertxt.join('')

    return ciphertext



  #
  #
  # returns the HEX representation of the plain text
  #
  decrypt: (ciphertext, secret) ->
    blockSize = 16

    ciphertext = new Buffer(ciphertext, 'hex')
    key = new Buffer(secret, 'hex')

    if key.length isnt 32
      console.log "AES256 decrypt() ERROR: wrong key length ", key.length
      # ERROR, we cannot do the required encryption, we need key of 32-bytes
      return null


    # recover nonce from 1st 8 bytes of ciphertext
    counterBlock = new Array(16)
    ctrTxt = ciphertext.slice(0, 16)
    for i in [0..15]
      counterBlock[i] = ctrTxt.readUInt8(i)

    # generate key schedule
    keySchedule = keyExpansion(key)

    # separate ciphertext into blocks (skipping past initial 16 bytes)
    nBlocks = Math.ceil((ciphertext.length - 16) / blockSize)
    ct = new Array(nBlocks)

    for b in [0..(nBlocks - 1)]
      ct[b] = ciphertext.slice(16 + b * blockSize
        , 16 + b * blockSize + blockSize)
    # ciphertext is now array of block-length strings
    ciphertext = ct

    # plaintext will get generated block-by-block into array
    # of block-length strings
    plaintxt = new Array(ciphertext.length)

    for b in [0..(nBlocks - 1)]

      # encrypt counter block
      cipherCntr = cipher(counterBlock, keySchedule)

      plaintxtByte = new Array(ciphertext[b].length)

      for i in [0..ciphertext[b].length - 1]
        # xor plaintxt with ciphered counter byte-by-byte
        plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].readUInt8(i)
        plaintxtByte[i] = byteToHex plaintxtByte[i]

      plaintxt[b] = plaintxtByte.join('')

      incrementCounterBlock(counterBlock)

    # join array of blocks into single plaintext string
    plaintxt = plaintxt.join('')

    return plaintxt




exports.AES256 = AES256
exports.incrementCounterBlock = incrementCounterBlock