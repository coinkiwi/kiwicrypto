
describe 'BigInt module', () ->

  BigInt = undefined

  beforeEach () ->
    { BigInt } = require 'BigInt'
    BigInt = BigInt
    BigInt.init()

  it 'can instantiate and initialize BigInt number', () ->
    n = new BigInt(1)
    expect(BigInt).toBeDefined()
    expect(n).toBeDefined()
    # expect(n).toBeGreaterThan(0)


  it 'findPrimes(n) returns correct primes for small n', () ->
    p = BigInt.findPrimes(10) # primes are: 2, 3, 5, 7
    expect(p).toBeDefined()
    expect(p).toEqual([2, 3, 5, 7])

    p = BigInt.findPrimes(1000) # should have 168 primes
    expect(p.length).toBe(168)

    pp = BigInt.findPrimes(10000)
    expect(pp.length).toBe(1229)



  it 'can construct BigInt from string', () ->
    bi = BigInt.str2BigInt '123', 10
    expect(bi).toEqual [123, 0]
    str = '123456789123456789123456789'
    bi = BigInt.str2BigInt str, 10
    expect(bi).toBeDefined()
    expect(bi.length).toBe 7


  it 'can construct BigInt from int', () ->
    bi = BigInt.int2BigInt 123, 8
    expect(bi).toEqual [123, 0]


  it 'can check if BigInt isZero()', () ->
    z1 = BigInt.str2BigInt '0', 10
    z2 = BigInt.int2BigInt 0, 1
    nz = BigInt.int2BigInt 1, 1
    expect(BigInt.isZero(z1)).toBeTruthy()
    expect(BigInt.isZero(z2)).toBeTruthy()
    expect(BigInt.isZero(nz)).toBeFalsy()


  it 'can convert BigInt to string', () ->
    str = '123456789123456789123456789'
    bi = BigInt.str2BigInt str, 10
    expect(BigInt.BigInt2str bi).toEqual(str)
    bi = BigInt.int2BigInt 65535, 16
    expect(BigInt.BigInt2str bi).toEqual('65535')


  it 'can trim leading zeros', () ->
    bi = new Array()
    bi.push 12
    bi.push 0
    bi.push 0
    bi.push 0
    bi.push 0
    expect(bi).toEqual [12, 0, 0, 0, 0]
    bi = BigInt.trim bi, 1
    expect(bi).toEqual [12, 0]


  it 'can compare two BigInt for equality', () ->
    b1 = BigInt.int2BigInt 15, 4
    b2 = BigInt.str2BigInt '15'
    b3 = BigInt.str2BigInt '16'
    expect(BigInt.equals(b1, b2)).toBeTruthy()
    expect(BigInt.equals(b2, b1)).toBeTruthy()
    expect(BigInt.equals(b1, b3)).toBeFalsy()
    expect(BigInt.equals(b2, b3)).toBeFalsy()
    expect(BigInt.equals(b3, b1)).toBeFalsy()
    bi = BigInt.int2BigInt 65535, 16
    expect(BigInt.equals bi, BigInt.str2BigInt('65535')).toBeTruthy()


  it 'can add two small BigInt numbers', () ->
    b1 = BigInt.int2BigInt 15, 4
    b2 = BigInt.int2BigInt 4, 2
    sum = BigInt.add(b1, b2)
    expect(sum).toEqual [19, 0]


  it 'can add two large BigInt numbers', () ->
    str1 = '123456789123456789123456789'
    str2 = '123456789123456789123456789'
    resultStr = '246913578246913578246913578'
    b1 = BigInt.str2BigInt str1
    b2 = BigInt.str2BigInt str2
    result = BigInt.str2BigInt resultStr
    sum = BigInt.add(b1, b2)
    expect(sum).toEqual result


  it 'can multiply two large numbers', () ->
    str1 = '123456789123456789123456789'
    str2 = '123456789123456789123456789'
    resultStr = '15241578780673678546105778281054720515622620750190521'
    b1 = BigInt.str2BigInt str1
    b2 = BigInt.str2BigInt str2
    result = BigInt.str2BigInt resultStr
    mult = BigInt.mult(b1, b2)
    expect(mult).toEqual result


  it 'can compare two BigInts', () ->
    str1 = '123456789123456789123456788'
    str2 = '123456789123456789123456789'
    b1 = BigInt.str2BigInt str1
    b2 = BigInt.str2BigInt str2
    expect(BigInt.greater(b2, b1)).toBeTruthy()
    expect(BigInt.greater(b1, b2)).toBeFalsy()


  it 'can divide BigInt by an Integer', () ->
    result = '123456789123456789123456789'
    str = '8090740675205740675205740667115'
    i = 65535
    bi = BigInt.str2BigInt str
    rem = BigInt._divInt_(bi, i)
    # the returned reminder is 0
    expect(rem).toEqual 0
    expect(BigInt.BigInt2str bi).toEqual(result)
