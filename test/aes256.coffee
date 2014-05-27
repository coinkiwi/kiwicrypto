
describe 'AES256 module', () ->


  it 'it encodes and then decodes to the same input', () ->
    { AES256 } = require 'AES256'
    aes256 = new AES256()
    input = 'a8G+4i5An5bpPX4Rc5MXKg=='
    key = 'YD3rEBXKcb4rc67whX13gR81LAc7YQjXLZgQowkU3/Q='
    h = aes256.encrypt input, key
    expect(h).not.toBe(null)

    input2 = aes256.decrypt h, key
    expect(input).toEqual(input2)


  it 'it encodes according to SPEC NIST PUB sp800-38a, F.1.5', () ->
    { AES256 } = require 'AES256'
    aes256 = new AES256()
    i = 'a8G+4i5An5bpPX4Rc5MXKq4tilceA6ycnrdvrEWvjl' +
      'EwyBxGo1zkEeX7wRkaClLv9p8kRd9PmxetK0F75mw3EA=='

    key = 'YD3rEBXKcb4rc67whX13gR81LAc7YQjXLZgQowkU3/Q='

    result = '8+7RvbXSoDwGS1p+PbGB+FkcyxDUEO0m3FunSjE2K' +
      'HC27SG5nKb0+fFT57G+r+0dIzBLejn58/8GfY2PniTsxw=='

    h = aes256.encrypt i, key

    expect(h).toEqual(result)
