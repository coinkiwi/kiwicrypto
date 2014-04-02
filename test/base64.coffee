

describe 'Base64 module', () ->

  it 'converts string to hex', () ->
    { Base64 } = require 'Base64'
    h = Base64.stringToHex 'hello world'
    hExpected = '68656c6c6f20776f726c64'
    expect(h).toBe(hExpected)


  it 'converts hex to string', () ->
    { Base64 } = require 'Base64'
    s = Base64.hexToString '68656c6c6f20776f726c64'
    sExpected = 'hello world'
    expect(s).toBe(sExpected)


  it 'encodes string data into base64', () ->
    { Base64 } = require 'Base64'
    b1 = Base64.encode 'worlds'
    b1Encoded = 'd29ybGRz'
    expect(b1).toBe(b1Encoded)
    b2 = Base64.encode 'hello worlds'
    b2Encoded = 'aGVsbG8gd29ybGRz'
    expect(b2).toBe(b2Encoded)
    b3 = Base64.encode 'Hello'
    b3Encoded = 'SGVsbG8='
    expect(b3).toBe(b3Encoded)


  it 'decodes base64 into string', () ->
    { Base64 } = require 'Base64'
    b1 = Base64.decode 'd29ybGRz'
    b1Encoded = 'worlds'
    expect(b1).toBe(b1Encoded)
    b2 = Base64.decode 'aGVsbG8gd29ybGRz'
    b2Encoded = 'hello worlds'
    expect(b2).toBe(b2Encoded)
    b3 = Base64.decode 'SGVsbG8='
    b3Encoded = 'Hello'
    expect(b3).toBe(b3Encoded)
