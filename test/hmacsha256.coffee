
describe 'HmacSHA256 module', () ->

  it 'hmac for input: a and key: a', () ->

    { HmacSHA256 } = require 'HmacSHA256'
    h = new HmacSHA256()
    h.init('a')
    hmac = h.hmac('a')
    expect(hmac)
    .toBe('3ecf5388e220da9e0f919485deb676d8bee3aec046a779353b463418511ee622')



  # test cases from
  #   http://csrc.nist.gov/groups/ST/toolkit/documents/Examples/HMAC_SHA256.pdf

  it 'hmac for Test Case 1 of NIST.gov HMAC_SHA256.pdf', () ->
    { HmacSHA256 } = require 'HmacSHA256'
    h = new HmacSHA256()
    binArray = []
    for i in [0..63]
      binArray.push i
    h.init(binArray)
    hmac = h.hmac('Sample message for keylen=blocklen')
    expect(hmac)
    .toBe('8bb9a1db9806f20df7f77b82138c7914d174d59e13dc4d0169c9057b133e1d62')

  it 'hmac for Test Case 2 of NIST.gov HMAC_SHA256.pdf', () ->
    { HmacSHA256 } = require 'HmacSHA256'
    h = new HmacSHA256()
    binArray = []
    for i in [0..31]
      binArray.push i
    h.init(binArray)
    hmac = h.hmac('Sample message for keylen<blocklen')
    expect(hmac)
    .toBe('a28cf43130ee696a98f14a37678b56bcfcbdd9e5cf69717fecf5480f0ebdf790')



  # test cases from https://tools.ietf.org/html/rfc4868

  it 'solves Test Case PRF-2 from RFC4868', () ->

    { HmacSHA256 } = require 'HmacSHA256'
    h = new HmacSHA256()
    h.init('Jefe')
    hmac = h.hmac('what do ya want for nothing?')
    expect(hmac)
    .toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843')

  it 'solves Test Case AUTH256-2 from RFC4868', () ->

    { HmacSHA256 } = require 'HmacSHA256'
    h = new HmacSHA256()
    h.init('JefeJefeJefeJefeJefeJefeJefeJefe')
    hmac = h.hmac('what do ya want for nothing?')
    expect(hmac)
    .toBe('167f928588c5cc2eef8e3093caa0e87c9ff566a14794aa61648d81621a2a40c6')
