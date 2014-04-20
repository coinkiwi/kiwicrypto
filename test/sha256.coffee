
describe 'SHA256 module', () ->

  it 'it produces correct sha1 hash for input: a', () ->
    { SHA256 } = require 'SHA256'
    sha256 = new SHA256()
    h = sha256.hash 'a'
    expect(h)
      .toBe('ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb')


  it 'it produces correct sha1 hash for: hello world', () ->
    { SHA256 } = require 'SHA256'
    sha256 = new SHA256()
    h = sha256.hash('hello world')

    hExpected =
      'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    expect(h).toBe(hExpected)
