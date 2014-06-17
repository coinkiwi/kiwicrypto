
describe 'AES256 module', () ->

  describe 'incrementCounterBlock', () ->

    incrementCounterBlock = undefined

    beforeEach () ->
      { incrementCounterBlock } = require 'AES256'

    it 'works for 0', () ->
      cb = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      expect(cb.length).toEqual(16)
      for i in [0..15]
        expect(cb[i]).toEqual(0)

      incrementCounterBlock(cb)
      for i in [0..14]
        expect(cb[i]).toEqual(0)

      expect(cb[15]).toEqual(1)

    it 'works for 200', () ->
      cb = [200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 200]
      expect(cb.length).toEqual(16)
      for i in [1..14]
        expect(cb[i]).toEqual(0)
      expect(cb[0]).toEqual(200)
      expect(cb[15]).toEqual(200)

      incrementCounterBlock(cb)
      for i in [1..14]
        expect(cb[i]).toEqual(0)

      expect(cb[0]).toEqual(200)
      expect(cb[15]).toEqual(201)

    it 'works for 255', () ->
      cb = [200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255]
      expect(cb.length).toEqual(16)
      for i in [1..13]
        expect(cb[i]).toEqual(0)

      expect(cb[0]).toEqual(200)
      expect(cb[14]).toEqual(255)
      expect(cb[15]).toEqual(255)

      incrementCounterBlock(cb)
      for i in [1..12]
        expect(cb[i]).toEqual(0)

      expect(cb[0]).toEqual(200)
      expect(cb[13]).toEqual(1)
      expect(cb[14]).toEqual(0)
      expect(cb[15]).toEqual(0)

    it 'works for border case', () ->
      cb = new Array(16)
      for i in [0..15]
        cb[i] = 0xff

      incrementCounterBlock(cb)

      for i in [0..15]
        expect(cb[i]).toEqual(0)


  describe 'hex to byte array', () ->

    hexStringToByteArray = undefined
    byteArrayToHexString = undefined

    beforeEach () ->
      { hexStringToByteArray, byteArrayToHexString } = require 'AES256'

    it 'converts 010203040a0b0c', () ->
      t = '010203040a0b0c'
      a = [1, 2, 3, 4, 10, 11, 12]
      na = hexStringToByteArray t
      nt = byteArrayToHexString a

      expect(a).toEqual(na)
      expect(t).toEqual(nt)



  describe 'aes', () ->

    it 'encodes and then decodes to the same input', () ->
      { SHA256 } = require 'SHA256'
      { AES256 } = require 'AES256'
      sha256 = new SHA256()
      aes256 = new AES256()
      input = 'aa'
      key = sha256.hash('mama')
      h = aes256.encrypt(input, key)
      expect(h).not.toBe(null)
      input2 = aes256.decrypt(h, key)
      expect(input).toEqual(new Buffer(input2, 'hex').toString('ascii'))


    it 'decodes the AES-256 test vector 1', () ->
      { AES256 } = require 'AES256'
      aes256 = new AES256()
      secret =
        '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'
      iv = 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff'
      cipher = '601ec313775789a5b7a7f504bbf3d228'
      plain = '6bc1bee22e409f96e93d7e117393172a'
      expect(aes256.decrypt(iv + cipher, secret)).toEqual(plain)


    it 'decodes the AES-256 test vector 2', () ->
      { AES256 } = require 'AES256'
      aes256 = new AES256()
      secret =
        '603deb1015ca71be2b73aef0857d77811f352c073b6108d72d9810a30914dff4'
      iv = 'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff'
      cipher =
        '601ec313775789a5b7a7f504bbf3d228f443e3ca4d62b59aca84e990cacaf5c5'
      plain =
        '6bc1bee22e409f96e93d7e117393172aae2d8a571e03ac9c9eb76fac45af8e51'
      h = aes256.decrypt(iv + cipher, secret)
      for i in [0..(h.length - 1)]
        expect(h[i]).toEqual(plain[i])
