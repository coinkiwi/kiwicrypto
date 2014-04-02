###
# Author: Mariusz Nowostawski, and others. See AUTHORS.
# Copyright (C) 2014 Mariusz Nowostawski, and others. See LICENSE.
###


'use strict'

#
# Represents arbitrary precision integer numbers.
#
class BigInt

  # bits stored per array element
  # AND this with an array element to chop it down to bpe bits
  # equals 2^bpe.  A single 1 bit to the left of the last bit of mask.
  bpe = 0
  mask = 0

  radix = mask + 1
  one = undefined

  # the digits for converting to different bases
  digitsStr = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" +
              "_=!@#$%^&*()[]{}|;:,.<>/?`~ \\\'\"+-"



  # the following global variables are scratchpad memory to
  # reduce dynamic memory allocation in the inner loop
  t = new Array(0)
  ss = t  # used in _mult_()
  s0 = t  # used in _multMod_(), squareMod_()
  s1 = t  # used in _powMod_(), multMod_(), squareMod_()
  s2 = t  # used in _powMod_(), multMod_()
  s3 = t  # used in _powMod_()
  s4 = s5 = t  # used in _mod_()
  s6 = t  # used in bigInt2str()
  s7 = t  # used in _powMod_()
  T = t   # used in _GCD_()
  sa = t  # used in _mont_()
  mr_x1 = t
  mr_r = t
  mr_a = t # used in millerRabin()
  eg_v = eg_u = eg_A = eg_B = eg_C = eg_D = t # used in eGCD_(), inverseMod_()

  md_q1 = md_q2 = md_q3 = md_r = md_r1 = md_r2 = md_tt = t # used in mod_()

  primes = pows = s_i = s_i2 = s_R = s_rm = s_q = s_n1 = t
  s_a = s_r2 = s_n = s_b = s_d = s_x1 = s_x2 = s_aa = t

  rpprb = t # used in randProbPrimeRounds() (which also uses "primes")


  # initialize the global variables
  @init: () ->
    bpe = 0
    while (1 << (bpe + 1)) > (1 << bpe)
      # bpe=number of bits in the mantissa on this platform
      bpe++

    # bpe=number of bits in one element of the array representing the bigInt
    bpe >>= 1

    # AND the mask with an integer to get its bpe least significant bits
    mask = (1 << bpe) - 1

    # 2^bpe.  a single 1 bit to the left of the first bit of mask
    radix = mask + 1

    one = @int2BigInt(1, 1, 1)  # constant used in _powMod_()





  # convert the integer t into a bigInt with at least the given number of bits.
  # the returned array stores the bigInt in bpe-bit chunks, little endian
  # (buff[0] is least significant word)
  # Pad the array with leading zeros so that it has at least minSize elements.
  # There will always be at least one leading 0 element.
  @int2BigInt: (t, bits, minSize = 1) ->
    k = Math.ceil(bits / bpe) + 1
    k = minSize if minSize > k
    buff = new Array(k)
    @_copyInt_(buff, t)
    return buff


  # returns how many bits long the BigInt x is, not counting leading zeros.
  @bitSize: (x) ->
    j = undefined
    z = undefined
    w = undefined
    j = x.length - 1
    while x[j] is 0 and j > 0
      j--
    z = 0
    w = x[j]
    while w > 0
      w >>= 1
      z++

    z += bpe * j
    return z



  # return the BigInt given a string representation in a given base.
  # Pad the array with leading zeros so that it has at least minSize elements.
  # If base=-1, then it reads in a space-separated list of array elements
  # in decimal.
  # The array will always have at least one leading zero, unless base=-1.

  @str2BigInt: (s, base = 10, minSize = 1) ->
    k = s.length
    if base is -1 # we have comma-separated list of array elements in decimal
      x = new Array(0)
      stillSearching = true
      while stillSearching
        y = new Array(x.length + 1)
        for i in [0..x.length - 1]
          y[i + 1] = x[i]
        y[0] = parseInt(s, 10)
        x = y
        d = s.indexOf(',', 0)
        if d < 1
          stillSearching = false
          break
        s = s.substring(d + 1)
        if s.length is 0
          stillSearching = false
          break

      if x.length < minSize
        y = new Array(minSize)
        @_copy_(y, x)
        return y

      return x

    x = @int2BigInt(0, base * k, 0)
    for i in [0..k - 1]
      d = digitsStr.indexOf(s.substring(i, i + 1), 0)
      if base <= 36 and d >= 36 # convert lowercase to uppercase if base <= 36
        d -= 26
      if d >= base or d < 0 # stop at first illegal character
        break

      @_multInt_(x, base)
      @_addInt_(x, d)


    k = x.length
    while k > 0 and not x[k - 1] # strip off leading zeros
      k--
    if minSize > k + 1 then k = minSize
    else k = k + 1
    y = new Array(k)
    if k < x.length then kk = k
    else kk = x.length

    for i in [0..kk - 1]
      y[i] = x[i]

    while i < k
      y[i++] = 0

    return y



  # is bigint x equal to integer y?
  # y must have less than bpe bits
  # @param x [BigInt]
  # @param y [Integer]
  # @return [true, false]
  @equalsInt: (x,y) ->
    if x[0] isnt y
      return false
    for i in [1..x.length - 1]
      if x[i] then return false
    return true


  # are bigints x and y equal?
  # this works even if x and y are different lengths and have arbitrarily
  # many leading zeros
  # @param x [BigInt]
  # @param y [BigInt]
  # @return [true, false]
  @equals: (x,y) ->
    if x.length < y.length then k = x.length else k = y.length
    for i in [0..k - 1]
      if x[i] isnt y[i]
        return false
    if x.length > y.length
      while i < x.length
        if x[i++] then return false
    else
      while i < y.length
        if y[i++] then return false

    return true



  # is the bigInt x equal to zero?
  # @param x [BigInt]
  # @return [true, false]
  @isZero: (x) ->
    for i in [0..x.length - 1]
      if x[i] then return false
    return true


  # convert a bigInt into a string in a given base, from base 2 up to base 95.
  # Base -1 prints the contents of the array representing the number.
  # @param x [BigInt]
  # @param base [Integer] base of the number
  # @return [string]
  @BigInt2str: (x, base = 10) ->
    s = ''
    if s6.length isnt x.length then s6 = @dup(x)
    else @_copy_(s6, x)

    if base is -1 # return the list of array contents
      i = x.length - 1
      while i > 0
        s += x[i--] + ','
        s += x[0]
    else # return the number in the given base
      while not @isZero(s6)
        t = @_divInt_(s6, base) # t=s6 % base; s6=floor(s6/base)
        s = digitsStr.substring(t, t + 1) + s

    if s.length == 0
      s = '0'

    return s








  # return a copy of x with at least n elements, adding leading zeros if needed.
  # @param x [BigInt]
  # @param n [Integer]
  @expand: (x, n) ->
    l = n
    l = x.length if x.length > n
    ans = @int2BigInt(0, l * bpe, 0)
    @_copy_(ans, x)
    return ans





  # ###########################################################
  # ##            Public arithmetic functions
  # ###########################################################



  # Return a new bigInt equal to (x mod n) for bigInts x and n.
  @mod: (x, n) ->
    ans = @dup x
    @_mod_(ans, n)
    @trim(ans, 1)



  # return (x+y) for bigInts x and y.
  # @param x [BigInt]
  # @param y [BigInt]
  # @return [BigInt] Sum of x and y.
  @add: (x, y) ->
    ans = @expand(x, @_expandBufferLength_(x, y))
    @_add_(ans, y)
    @trim(ans, 1)


  # return (x+n) where x is a bigInt and n is an integer.
  # @param x [BigInt]
  # @param n [Integer]
  @addInt: (x, n) ->
    ans = @expand(x, x.length + 1)
    @_addInt_(ans, n)
    @trim(ans, 1)


  # return x * y for bigInts x and y. This is faster when y < x.
  # @param x [BigInt]
  # @param y [BigInt]
  @mult: (x, y) ->
    ans = @expand(x, x.length + y.length)
    @_mult_(ans, y)
    @trim(ans, 1)


  # Returns (x**y mod n) where x,y,n are bigInts and ** is exponentiation.
  # 0**0=1. Faster for odd n.
  # @param x [BigInt]
  # @param y [BigInt]
  # @param n [BigInt]
  # @return [BigInt] x**y mod n
  @powMod: (x, y, n) ->
    ans = @expand(x, n.length)
    @_powMod_(ans, @trim(y, 2), @trim(n, 2), 0)
    # this should work without the trim, but doesn't
    @trim(ans, 1)


  # return (x-y) for bigInts x and y.  Negative answers will be 2s complement.
  # @param x [BigInt]
  # @param y [BigInt]
  @sub: (x,y) ->
    ans = @expand(x, @_expandBufferLength_(x, y))
    @_sub_(ans,y)
    @trim(ans, 1)



  # Returns (x**(-1) mod n) for bigInts x and n.  If no inverse exists,
  # it returns null.
  # @param x [BigInt]
  # @param n [BigInt]
  @inverseMod: (x, n) ->
    ans = @expand(x, n.length)
    s = @_inverseMod_(ans, n)
    return @trim(ans, 1) if s
    null


  # Returns (x*y mod n) for bigInts x,y,n.  For greater speed, assume y < x.
  # @param x [BigInt]
  # @param y [BigInt]
  # @param n [BigInt]
  @multMod: (x, y, n) ->
    ans = @expand(x, n.length)
    @_multMod_(ans, y, n)
    @trim(ans, 1)



  # is bigInt x negative?
  @negative: (x) ->
    (x[x.length - 1] >> (bpe - 1)) & 1



  # is x > y? (x and y both nonnegative)
  @greater: (x, y) ->
    if x.length < y.length then k = x.length else k = y.length
    i = x.length
    while i < y.length
      if y[i++]
        return false # y has more digits

    i = y.length
    while i < x.length
      if x[i++]
        return true  # x has more digits

    i = k - 1
    while i >= 0
      if (x[i] > y[i])
        return true
      else if x[i] < y[i]
        return false
      i--
    return false











  # ###########################################################
  # ##         Utility/Private arithmetic functions
  # ###########################################################









  # Do x = x * n where x is a bigInt and n is an integer.
  # x must be large enough to hold the result.
  # @param x [BigInt]
  # @param n [Integer]
  # @private
  @_multInt_: (x, n) ->
    if not n
      return
    k = x.length
    c = 0
    for i in [0..k - 1]
      c += x[i] * n
      b = 0
      if c < 0
        b = -(c >> bpe)
        c += b * radix

      x[i] = c & mask
      c= (c >> bpe) - b





  #
  # Do x = x - y for BigInts x and y.
  # x must be large enough to hold the answer.
  # negative answers will be 2s complement
  # @param x [BigInt]
  # @param y [BigInt]
  # @private
  @_sub_: (x, y) ->
    if x.length < y.length then k = x.length else k = y.length
    c = 0
    for i in [0..k - 1]
      c += x[i] - y[i]
      x[i] = c & mask
      c >>= bpe

    i = k
    while c and i < x.length
      c += x[i]
      x[i++] = c & mask
      c >>= bpe



  # do x = x + y for bigInts x and y.
  # x must be large enough to hold the answer.
  # @param x [BigInt]
  # @param y [BigInt]
  # @private
  @_add_: (x, y) ->
    if x.length < y.length then k = x.length else k = y.length
    c = 0
    for i in [0..k - 1]
      c += x[i] + y[i]
      x[i] = c & mask
      c >>= bpe

    i = k
    while c and  i < x.length
      c += x[i]
      x[i++] = c & mask
      c >>= bpe



  # do x = x+n where x is a bigInt and n is an integer.
  # x must be large enough to hold the result.
  # @param x [BigInt]
  # @param n [Integer]
  # @private
  @_addInt_: (x, n) ->
    x[0] += n
    k = x.length
    c = 0
    for i in [0..k - 1]
      c += x[i]
      b = 0
      if c < 0
        b = -(c >> bpe)
        c += b * radix

      x[i] = c & mask
      c = (c >> bpe) - b
      if not c
        return # stop carrying as soon as the carry is zero





  # do x=x*y for bigInts x and y.  This is faster when y<x.
  @_mult_: (x, y) ->
    if ss.length isnt 2 * x.length
      ss = new Array(2 * x.length)
    @_copyInt_(ss, 0)
    for i in [0..y.length - 1]
      if y[i]
        @_linCombShift_(ss, x, y[i], i)  # ss=1*ss+y[i]*(x<<(i*bpe))
    @_copy_(x, ss)


  # do x=x mod n for bigInts x and n.
  @_mod_: (x,n) ->
    if s4.length isnt x.length
      s4 = dup(x)
    else
      @_copy_(s4, x)
    if s5.length isnt x.length
      s5 = dup(x)
    @_divide_(s4, n, s5, x) # x = remainder of s4 / n


  # do x=x*y mod n for bigInts x,y,n.
  # for greater speed, assume y < x
  @_multMod_: (x,y,n) ->
    if s0.length isnt 2 * x.length
      s0 = new Array(2 * x.length)
    @_copyInt_(s0, 0)
    for i in [0..y.length - 1]
      if y[i]
        @_linCombShift_(s0, x, y[i], i) # s0=1*s0+y[i]*(x<<(i*bpe))
    @_mod_(s0, n)
    @_copy_(x, s0)



  # do x = floor(x/n) for bigInt x and integer n, and return the remainder
  # @param x [BigInt]
  # @param n [Integer]
  # @return [Integer]
  # @private
  @_divInt_: (x, n) ->
    r = 0
    i = x.length - 1
    while i >= 0
      s = r * radix + x[i]
      x[i] = Math.floor(s / n)
      r = s % n
      i--
    return r



  # divide x by y giving quotient q and remainder r.
  # (q=floor(x/y),  r=x mod y).  All 4 are bigints.
  # x must have at least one leading zero element.
  # y must be nonzero.
  # q and r must be arrays that are exactly the same length as x.
  # (Or q can have more). Must have x.length >= y.length >= 2.
  @_divide_: (x, y, q, r) ->
    @_copy_(r, x)
    ky = y.length
    while y[ky - 1] is 0
      ky-- # ky is number of elements in y, not including leading zeros

    # normalize: ensure the most significant element of y has highest bit set
    b = y[ky - 1]
    a = 0
    while b
      a++
      b >>= 1

    # a is how many bits to shift so that the high order
    # bit of y is leftmost in its array element
    a = bpe - a

    # multiply both by 1<<a now, then divide both by that at the end
    @_leftShift_(y, a)
    @_leftShift_(r, a)

    kx = r.length
    while r[kx - 1] is 0 and kx > ky
      kx--
      # kx is number of elements in normalized x, not including leading zeros

    @_copyInt_(q, 0) # q = 0
    while not greaterShift(y, r, kx - ky)
      @_subShift_(r, y, kx - ky)
      q[kx - ky]++


    i = kx
    while (i - 1) >= ky
      i--
      if r[i] is y[ky - 1]
        q[i - ky] = mask
      else
        q[i - ky] = Math.floor((r[i] * radix + r[i - 1]) / y[ky - 1])


      while true
        y2 = 0
        y2 = y[ky - 2] * q[i - ky] if ky > 1
        c = y2 >> bpe
        y2 = y2 & mask
        y1 = c + q[i - ky] * y[ky - 1]
        c = y1 >> bpe
        y1 = y1 & mask

        res = undefined
        if c is r[i]
          if y1 is r[i - 1]
            t = 0
            t = r[i - 2] if i > 1
            res = y2 > t
          else res = y1 > r[i - 1]
        else res = c > r[i]
        if res
          q[i - ky]--
        else
          break

      @_linCombShift_(r, y, -q[i - ky], i - ky)
      if negative(r)
        @_addShift_(r, y, i - ky)
        q[i - ky]--

    rightShift_(y, a)  # undo the normalization step
    rightShift_(r, a)  # undo the normalization step


  # do carries and borrows so each element of the bigInt x fits in bpe bits.
  @_carry_: (x) ->
    k = x.length
    c = 0
    for i in [0..k - 1]
      c += x[i]
      b = 0
      if c < 0
        b = -(c >> bpe)
        c += b * radix

      x[i] = c & mask
      c = (c >> bpe) - b




  # ###########################################################
  # ##                   Utility functions
  # ###########################################################


  # copy BigInt y to x. x must be an array at least as big as y (not counting
  # the leading zeros in y).
  # @param x [BigInt]
  # @param y [BigInt]
  # @private
  @_copy_: (x, y) ->
    if x.length < y.length then k = x.length
    else k = y.length
    for i in [0..k - 1]
      x[i] = y[i]
    return if k is x.length
    for i in [k..x.length - 1]
      x[i] = 0




  # copy integer y to BigInt x
  # @param x [BigInt]
  # @param n [Integer]
  # @private
  @_copyInt_: (x, n) ->
    c = n
    for i in [0..x.length - 1]
      x[i] = c & mask
      c >>= bpe


  # returns a duplicate of bigInt x
  # @param x [BigInt]
  # @return [BigInt]
  @dup: (x) ->
    buff = new Array(x.length)
    @_copy_(buff, x)
    return buff


  # return x with exactly k leading zero elements
  # @param x [BiInt]
  # @param k [Integer] the number of leading zeros
  @trim: (x, k) ->
    i = x.length
    while i > 0 and x[i - 1] is 0
      i = i - 1
    y = new Array(i + k)
    @_copy_(y, x)
    return y



  #
  # Find all primes up to integer n
  #
  # @param n [integer] upper limit for primes
  # @return [Array<integer>] an array of all primes less than integer n
  #
  @findPrimes: (n) ->
    s = new Array(n)
    for i in [0..n - 1]
      s[i] = 0
    s[0] = 2
    p = 0 # first p elements of s are primes, the rest are a sieve
    while s[p] < n  # s[p] is the pth prime
      i = s[p] * s[p]
      while i < n  # mark multiples of s[p]
        s[i] = 1
        i += s[p]
      p++
      s[p] = s[p - 1] + 1
      while s[p] < n and s[s[p]]
        s[p]++  # find next prime (where s[p] is 0)
    ans = new Array(p)
    for i in [0..p - 1]
      ans[i] = s[i]

    return ans



  #
  # Conducts a single round of Miller-Rabin base b,
  # consider x to be a possible prime?
  # @param x [BigInt]
  # @param b [integer] b < x
  # @return [true, false] returns true if x is possibly prime
  # @private
  @millerRabinInt: (x, b) ->
    if mr_x1.length isnt x.length
      mr_x1 = dup x
      mr_r = dup x
      mr_a = dup x

    @_copyInt_(mr_a, b)
    millerRabin(x, mr_a)


  # Based on a single round of Miller-Rabin base b
  # indicates x to be a possible prime number?
  # @param x [BigInt]
  # @param b [BigInt] b < x
  # @return [true, false]
  # @private
  @millerRabin: (x, b) ->
    if mr_x1.length isnt x.length
      mr_x1 = dup x
      mr_r = dup x
      mr_a = dup x

    @_copy_ mr_a, b
    @_copy_ mr_r, x
    @_copy_ mr_x1, x

    addInt_ mr_r, -1
    addInt_ mr_x1, -1

    # s is the highest power of two that divides mr_r
    k = 0
    for i in [0..mr_r.length - 1]
      for j in [1..mask - 1]
        if x[i] & j
          s = undefined
          s = k if k < mr_r.length + bpe
          i = mr_r.length
          j = mask
        else
          k++

    @_rightShift_(mr_r, s) if s?

    powMod_ mr_a, mr_r, x

    if not equalsInt(mr_a,1) and not equals(mr_a,mr_x1)
      j = 1
      while j <= s - 1 and not equals(mr_a, mr_x1)
        squareMod_(mr_a, x)
        if equalsInt(mr_a, 1)
          return false
        j++

      if not equals(mr_a, mr_x1)
        return false

    return true



  # do the linear combination x=a*x+b*y for bigInts x and y, and integers
  # a and b.  x must be large enough to hold the answer.
  @_linComb_: (x,y,a,b) ->
    if x.length < y.length then k = x.length else k = y.length
    kk = x.length
    c = 0
    for i in [0..k - 1]
      c += a * x[i] + b * y[i]
      x[i] = c & mask
      c >>= bpe

    i = k
    while i < kk
      c += a * x[i]
      x[i++]= c & mask
      c >>= bpe


  # do the linear combination x=a*x+b*(y<<(ys*bpe)) for bigInts x and y,
  # and integers a, b and ys. x must be large enough to hold the answer.
  @_linCombShift_: (x,y,b,ys) ->
    if x.length < ys + y.length then k = x.length else k = ys + y.length
    kk = x.length
    c = 0; i = ys
    while i < k
      c += x[i] + b * y[i - ys]
      x[i++] = c & mask
      c >>= bpe

    i = k
    while c and i < kk
      c += x[i]
      x[i++] = c & mask
      c >>= bpe




  # ############################################################
  # ##                 Generate random BigInt
  # ############################################################





  # return a k-bit true random prime using Maurer's algorithm.
  @randTruePrime: (k) ->
    ans = int2bigInt(0, k, 0)
    randTruePrime_(ans, k)
    @trim(ans, 1)


  # return a k-bit random probable prime with probability of error < 2^-80
  @randProbPrime: (k) ->
    # numbers from HAC table 4.3
    return randProbPrimeRounds(k, 2) if k >= 600
    return randProbPrimeRounds(k, 4) if k >= 550
    return randProbPrimeRounds(k, 5) if k >= 500
    return randProbPrimeRounds(k, 6) if k >= 400
    return randProbPrimeRounds(k, 7) if k >= 350
    return randProbPrimeRounds(k, 9) if k >= 300
    # numbers from HAC table 4.4
    return randProbPrimeRounds(k, 12) if k >= 250
    return randProbPrimeRounds(k, 15) if k >= 200
    return randProbPrimeRounds(k, 18) if k >= 150
    return randProbPrimeRounds(k, 27) if k >= 100
    # number from HAC remark 4.26 (only an estimate)
    randProbPrimeRounds(k, 40)



  # return a k-bit probable random prime using n rounds of
  # Miller Rabin (after trial division with small primes)
  @randProbPrimeRounds: (k, n) ->
    B = 30000  # B is largest prime to use in trial division
    ans = int2bigInt 0, k, 0

    # optimization: try larger and smaller B to find the best limit.
    if primes.length is 0
      primes = findPrimes(30000)  # check for divisibility by primes <=30000

    if rpprb.length isnt ans.length
      rpprb = dup ans

    while true # keep trying random values for ans until one appears to be prime

      # optimization: pick a random number times L=2*3*5*...*p, plus a
      # random element of the list of all numbers in [0,L) not divisible by any
      # prime up to p. This can reduce the amount of random number generation.

      @_randBigInt_(ans, k, 0) # ans = a random odd number to check
      ans[0] |= 1
      divisible = false

      # check ans for divisibility by small primes up to B
      i = 0
      while i < primes.length and primes[i] <= B
        if modInt(ans, primes[i]) is 0 and not equalsInt(ans,primes[i])
          divisible = true
          break
        i++

      # optimization: change millerRabin so the base can be bigger than the
      # number being checked, then eliminate the while here.
      # do n rounds of Miller Rabin, with random bases less than ans
      i = 0
      while i < n and not divisible
        @_randBigInt_(rpprb, k, 0)
        while not greater(ans, rpprb) # pick a random rpprb that's < ans
          randBigInt_ rpprb, k, 0
          if not millerRabin(ans, rpprb)
            divisible = true
        i++

      return ans if not divisible



  # generate a k-bit true random prime using Maurer's algorithm,
  # and put it into ans.  The bigInt ans must be large enough to hold it.
  @_randTruePrime_: (ans, k) ->
    primes = findPrimes 30000 if primes.length is 0
    # check for divisibility by primes <= 30000
    if pows.length is 0
      pows = new Array(512)
      for j in [0..511]
        pows[j] = Math.pow(2, j / 511.0 - 1.0)

    # c and m should be tuned for a particular machine and value of k,
    # to maximize performance/speed
    c = 0.1  # c=0.1 in HAC

    # generate this k-bit number by first recursively generating
    # a number that has between k/2 and k-m bits
    m = 20
    recLimit = 20  # stop recursion when k <=recLimit.  Must have recLimit >= 2

    if s_i2.length isnt ans.length
      s_i2  = dup ans
      s_R   = dup ans
      s_n1  = dup ans
      s_r2  = dup ans
      s_d   = dup ans
      s_x1  = dup ans
      s_x2  = dup ans
      s_b   = dup ans
      s_n   = dup ans
      s_i   = dup ans
      s_rm  = dup ans
      s_q   = dup ans
      s_a   = dup ans
      s_aa  = dup ans

    if k <= recLimit
      # generate small random primes by trial division up to its square root
      # pm is binary number with all ones, just over sqrt(2^k)
      pm = (1 << ((k + 2) >> 1)) - 1
      @_copyInt_ ans, 0
      dd = 1
      while dd
        dd = 0
        # random, k-bit, odd integer, with msb 1
        ans[0] = 1 | (1 << (k - 1)) | Math.floor(Math.random() * (1 << k))
        j = 1
        # trial division by all primes 3..sqrt(2^k)
        while j < primes.length and (primes[j] & pm) is primes[j]
          if 0 is (ans[0] % primes[j])
            dd = 1
            break
          j++

      @_carry_ ans
      return

    # try small primes up to B (or all the primes[] array
    # if the largest is less than B).
    B = c * k * k

    # generate this k-bit number by first recursively generating
    # a number that has between k/2 and k-m bits
    if k > 2 * m
      r = 1
      while k - k * r <= m
        r = pows[Math.floor(Math.random() * 512)]
    else
      r = 0.5

    # simulation suggests the more complex algorithm using r = 0.333 is only
    # slightly faster.
    recSize = Math.floor(r * k) + 1

    @_randTruePrime_ s_q, recSize
    @_copyInt_ s_i2, 0
    s_i2[Math.floor((k - 2) / bpe)] |= (1 << ((k - 2) % bpe))   # s_i2=2^(k-2)
    divide_(s_i2, s_q, s_i, s_rm)                # s_i=floor((2^(k-1))/(2q))

    z = bitSize(s_i)

    while true
      while true # generate z-bit numbers until one falls in the range [0,s_i-1]
        randBigInt_(s_R, z, 0)
        if greater(s_i, s_R)
          break
      # now s_R is in the range [0,s_i-1]
      @_addInt_(s_R, 1)  # now s_R is in the range [1,s_i]
      @_add_(s_R, s_i)   # now s_R is in the range [s_i+1,2*s_i]

      @_copy_(s_n, s_q)
      @_mult_(s_n, s_R)
      @_multInt_(s_n, 2)
      @_addInt_(s_n, 1)    # s_n=2*s_R*s_q+1

      @_copy_(s_r2, s_R)
      @_multInt_(s_r2, 2)  # s_r2=2*s_R

      # check s_n for divisibility by small primes up to B
      divisible = false
      j = 0
      while j < primes.length and primes[j] < B
        if modInt(s_n, primes[j]) is 0 and not equalsInt(s_n, primes[j])
          divisible = true
          break

      # if it passes small primes check, then try a single Miller-Rabin base 2
      if not divisible
        # this line represents 75% of the total runtime for _randTruePrime_
        if not millerRabinInt(s_n, 2)
          divisible = true

      if not divisible  # if it passes that test, continue checking s_n
        @_addInt_(s_n, -3)
        j = s_n.length - 1
        while s_n[j] is 0 and j > 0 # strip leading zeros
          zz = 0
          w = s_n[j]
          zz = 0
          w = s_n[j]
          while w?
            zz += bpe * j   # zz=number of bits in s_n, ignoring leading zeros
            # generate z-bit numbers until one falls in the range [0,s_n-1]
            while true
              @_randBigInt_(s_a, zz, 0)
              if greater(s_n, s_a)
                break
            # now s_a is in the range [0,s_n-1]
            @_addInt_(s_n, 3)  # now s_a is in the range [0,s_n-4]
            @_addInt_(s_a, 2)  # now s_a is in the range [2,s_n-2]
            @_copy_(s_b, s_a)
            @_copy_(s_n1, s_n)
            @_addInt_(s_n1, -1)
            @_powMod_(s_b, s_n1, s_n)   # s_b=s_a^(s_n-1) modulo s_n
            @_addInt_(s_b, -1)
            if isZero(s_b)
              copy_(s_b, s_a)
              powMod_(s_b, s_r2, s_n)
              addInt_(s_b, -1)
              copy_(s_aa, s_n)
              copy_(s_d, s_b)
              GCD_(s_d, s_n) # if s_b and s_n are relatively prime,
              # then s_n is prime too
              if equalsInt(s_d, 1)
                @_copy_ ans, s_aa
                return
                # if we've made it this far, then s_n is guaranteed
                # to be prime
            w >>= 1
            zz++
          j--


  # Returns an n-bit random BigInt (n >= 1).
  # If s is true, then the most significant of those n bits is set to 1.
  # @param n [Integer]
  # @param s [true, false]
  @randBigInt: (n, s) ->
    # numb of array elements to hold the BigInt with a leading 0 element
    a = Math.floor((n - 1) / bpe) + 2
    b = int2bigInt(0, 0, a)
    @_randBigInt_(b, n, s)
    return b


  # Set b to an n-bit random BigInt.  If s is true, then the most significant
  # of those n bits is set to 1.
  # Array b must be big enough to hold the result. Must have n >= 1
  @_randBigInt_: (b, n, s) ->
    for i in [0..b.length - 1]
      b[i] = 0
    # numb of array elements to hold the BigInt
    a = Math.floor((n - 1) / bpe) + 1
    for i in [0..a - 1]
      b[i] = Math.floor(Math.random() * (1 << (bpe - 1)))

    b[a - 1] &= (2 << ((n - 1) % bpe)) - 1
    if s
      b[a - 1] |= (1 << ((n - 1) % bpe))


  # Returns the greatest common divisor of bigInts x and y
  # (each with same number of elements).
  @GCD: (x, y) ->
    xc = dup(x)
    yc = dup(y)
    @_GCD_(xc, yc)
    return xc




  #
  # set x to the greatest common divisor of bigInts x and y
  # (each with same number of elements).
  # y is destroyed.
  #
  # @private
  @_GCD_: (x,y) ->

    if T.length isnt x.length
      T = dup(x)

    sing = 1
    while sing # while y has nonzero elements other than y[0]
      sing = false
      for i in [1..y.length - 1] # check if y has nonzero elements other than 0
        if y[i]
          sing = true
          break

        if not sing
          break # quit when y all zero elements except possibly y[0]

        # find most significant element of x
        i = x.length
        while not x[i] and i >= 0
          i--

        xp = x[i]; yp = y[i]
        A = 1; B = 0; C = 0; D = 1

        while (yp + C) and (yp + D)
          q = Math.floor((xp + A) / (yp + C))
          qp = Math.floor((xp + B) / (yp + D))
          if q isnt qp
            break
          # do (A,B,xp, C,D,yp) = (C,D,yp, A,B,xp) - q*(0,0,0, C,D,yp)
          t = A - q * C; A = C; C = t
          t = B - q * D; B = D; D = t
          t = xp - q * yp; xp = yp; yp = t

        if B
          @_copy_(T,x)
          @_linComb_(x, y, A, B) # x=A*x+B*y
          @_linComb_(y, T, D, C) # y=D*y+C*T
        else
          @_mod_(x, y)
          @_copy_(T, x)
          @_copy_(x, y)
          @_copy_(y, T)

    if y[0] is 0
      return

    t = @modInt(x, y[0])
    @_copyInt_(x, y[0])
    y[0] = t
    while y[0]
      x[0] %= y[0]
      t = x[0]
      x[0] = y[0]
      y[0] = t



  # do x=x**(-1) mod n, for bigInts x and n.
  # If no inverse exists, it sets x to zero and returns 0, else it returns 1.
  # The x array must be at least as large as the n array.
  @_inverseMod_: (x,n) ->
    k = 1 + 2 * Math.max(x.length, n.length)

    # if both inputs are even, then inverse doesn't exist
    if not x[0] & 1 and not n[0] & 1
      @_copyInt_(x, 0)
      return 0

    if eg_u.length isnt k
      eg_u = new Array(k)
      eg_v = new Array(k)
      eg_A = new Array(k)
      eg_B = new Array(k)
      eg_C = new Array(k)
      eg_D = new Array(k)


    @_copy_(eg_u, x)
    @_copy_(eg_v, n)
    @_copyInt_(eg_A, 1)
    @_copyInt_(eg_B, 0)
    @_copyInt_(eg_C, 0)
    @_copyInt_(eg_D, 1)
    while true
      while not eg_u[0] & 1 # while eg_u is even
        @_halve_(eg_u)
        if not eg_A[0] & 1 and not eg_B[0] & 1 # if eg_A==eg_B==0 mod 2
          halve_(eg_A)
          halve_(eg_B)
        else
          add_(eg_A,n);  halve_(eg_A)
          sub_(eg_B,x);  halve_(eg_B)

      while not eg_v[0] & 1 # while eg_v is even
        halve_(eg_v)
        if not eg_C[0] & 1 and not eg_D[0] & 1 # if eg_C==eg_D==0 mod 2
          halve_(eg_C)
          halve_(eg_D)
        else
          add_(eg_C,n);  halve_(eg_C)
          sub_(eg_D,x);  halve_(eg_D)

      if not greater(eg_v, eg_u) # eg_v <= eg_u
        sub_(eg_u, eg_v)
        sub_(eg_A, eg_C)
        sub_(eg_B, eg_D)
      else # eg_v > eg_u
        sub_(eg_v, eg_u)
        sub_(eg_C, eg_A)
        sub_(eg_D, eg_B)


      if equalsInt(eg_u, 0)
        while negative(eg_C) # make sure answer is nonnegative
          add_(eg_C,n)
          copy_(x,eg_C)

          if not equalsInt(eg_v,1) # if GCD_(x,n)!=1, then there is no inverse
            copyInt_(x, 0)
            return 0

        return 1



  # return x**(-1) mod n, for integers x and n.
  # Return 0 if there is no inverse.
  @inverseModInt: (x, n) ->
    a = 1; b = 0
    while true
      return a if x is 1
      return 0 if x is 0
      b -= a * Math.floor(n / x)
      n %= x
      # to avoid negatives, change this b to n-b, and each -= to +=
      return b if n is 1
      return 0 if n is 0
      a -= b * Math.floor(x / n)
      x %= n




  # Given positive bigInts x and y, change the bigints v, a, and b
  # to positive bigInts such that:
  #     v = GCD_(x,y) = a*x-b*y
  # The bigInts v, a, b, must have exactly as many elements as
  # the larger of x and y.
  @_eGCD_: (x, y, v, a, b) ->
    g = 0
    k = Math.max(x.length,y.length)
    if eg_u.length isnt k
      eg_u = new Array(k)
      eg_A = new Array(k)
      eg_B = new Array(k)
      eg_C = new Array(k)
      eg_D = new Array(k)

    while not x[0] & 1 and not y[0]& 1 # while x and y both even
      halve_(x)
      halve_(y)
      g++

    @_copy_(eg_u, x)
    @_copy_(v, y)
    @_copyInt_(eg_A, 1)
    @_copyInt_(eg_B, 0)
    @_copyInt_(eg_C, 0)
    @_copyInt_(eg_D, 1)
    while true
      while not eg_u[0] & 1 # while u is even
        halve_(eg_u)
        if not eg_A[0] & 1 and not eg_B[0] & 1 # if A==B==0 mod 2
          halve_(eg_A)
          halve_(eg_B)
        else
          add_(eg_A,y);  halve_(eg_A)
          sub_(eg_B,x);  halve_(eg_B)

      while not v[0] & 1 # while v is even
        halve_(v)
        if not eg_C[0] & 1 and not eg_D[0] & 1 # if C==D==0 mod 2
          halve_(eg_C)
          halve_(eg_D)
        else
          add_(eg_C,y);  halve_(eg_C)
          sub_(eg_D,x);  halve_(eg_D)

      if greater(v,eg_u) # v<=u
        sub_(eg_u, v)
        sub_(eg_A, eg_C)
        sub_(eg_B, eg_D)
      else # v>u
        sub_(v,eg_u)
        sub_(eg_C,eg_A)
        sub_(eg_D,eg_B)

      if equalsInt(eg_u, 0)
        while negative(eg_C) # make sure a (C) is nonnegative
          add_(eg_C, y)
          sub_(eg_D, x)

        multInt_(eg_D,-1) # make sure b (D) is nonnegative
        copy_(a, eg_C)
        copy_(b, eg_D)
        leftShift_(v, g)
        return




  # is (x << (shift*bpe)) > y?
  # x and y are nonnegative bigInts
  # shift is a nonnegative integer
  @greaterShift: (x, y, shift) ->
    kx = x.length
    ky = y.length
    if (kx + shift) < ky
      k = kx + shift
    else
      k = ky
    i = ky - 1 - shift
    while i < kx && i >= 0
      if x[i] > 0
        # if there are nonzeros in x to the left of the first column of y,
        # then x is bigger
        return 1
      i++

    i = kx - 1 + shift
    while i < ky
      if y[i] > 0
        # if there are nonzeros in y to the left of the first column of x,
        # then x is not bigger
        return 0
      i++
    i = k - 1
    while i >= shift
      if x[i - shift] > y[i]
        return 1
      else if x[i - shift] < y[i]
        return 0
      i--
    return 0







  #
  # Calculates which, x or y, is larger and adds 1 to the buffer length so
  # that a new appropriately large BigInt can be allocated.
  # @param x [BigInt]
  # @param y [BigInt]
  # @private
  @_expandBufferLength_: (x, y) ->
    if x.length > y.length
      return x.length + 1
    else
      return y.length + 1


exports.BigInt = BigInt




# Original code in JavaScript by Leemon Baird,
# www.leemon.com, 2000
#
# Original Leemon Baird disclaimer
#
# This file is public domain. You can use it for any purpose without restriction
# I do not guarantee that it is correct, so use it at your own risk.  If you use
# it for something interesting, I'd appreciate hearing about it.  If you find
# any bugs or make any improvements, I'd appreciate hearing about those too.
# It would also be nice if my name and URL were left in the comments.  But none
# of that is required.
#
# This code defines a bigInt library for arbitrary-precision integers.
# A bigInt is an array of integers storing the value in chunks of bpe bits,
# little endian (buff[0] is the least significant word).
# Negative bigInts are stored two's complement.  Almost all the functions treat
# bigInts as nonnegative.  The few that view them as two's complement say so
# in their comments.  Some functions assume their parameters have at least one
# leading zero element. Functions with an underscore at the end of the name put
# their answer into one of the arrays passed in, and have unpredictable behavior
# in case of overflow, so the caller must make sure the arrays are big enough to
# hold the answer.  But the average user should never have to call any of the
# underscored functions.  Each important underscored function has a wrapper
# function of the same name without the underscore that takes care of the
# details for you. For each underscored function where a parameter is modified,
# that same variable must not be used as another argument too.
# So, you cannot square x by doing
# multMod_(x,x,n).  You must use squareMod_(x,n) instead, or do y=dup(x);
# multMod_(x,y,n).
# Or simply use the multMod(x,x,n) function without the underscore, where
# such issues never arise, because non-underscored functions never change
# their parameters; they always allocate new memory for the answer that is
# returned.
#
# These functions are designed to avoid frequent dynamic memory allocation in
# the inner loop. For most functions, if it needs a BigInt as a local variable
# it will actually use a global, and will only allocate to it only when it's not
# the right size.  This ensures that when a function is called repeatedly with
# same-sized parameters, it only allocates memory on the first call.
#
# Note that for cryptographic purposes, the calls to Math.random() must
# be replaced with calls to a better pseudorandom number generator.
#
# In the following, "bigInt" means a bigInt with at least one leading zero
# element, and "integer" means a nonnegative integer less than radix.  In some
# cases, integer can be negative.  Negative bigInts are 2s complement.
#
# The following functions do not modify their inputs.
# Those returning a bigInt, string, or Array will dynamically allocate memory
# for that value. Those returning a boolean will return the integer 0 (false)
# or 1 (true). Those returning boolean or int will not allocate memory except
# possibly on the first time they're called with a given parameter size.
#
# bigInt  add(x,y)               //return (x+y) for bigInts x and y.
# bigInt  addInt(x,n)            //return (x+n) where x is a bigInt and n is an
#                                   integer.
# string  bigInt2str(x,base)     //return a string form of bigInt x in a given
#                                   base, with 2 <= base <= 95
# int     bitSize(x)             //return how many bits long the bigInt x is,
#                                   not counting leading zeros
# bigInt  dup(x)                 //return a copy of bigInt x
# boolean equals(x,y)            //is the bigInt x equal to the bigint y?
# boolean equalsInt(x,y)         //is bigint x equal to integer y?
# bigInt  expand(x,n)            //return a copy of x with at least n elements,
#                                   adding leading zeros if needed
# Array   findPrimes(n)          //return array of allprimes less than integer n
# bigInt  GCD(x,y)               //return greatest common divisor of bigInts x
#                                   and y (each with same number of elements).
# boolean greater(x,y)           //is x>y?  (x and y are nonnegative bigInts)
# boolean greaterShift(x,y,shift)//is (x <<(shift*bpe)) > y?
# bigInt  int2bigInt(t,n,m)      //return a bigInt equal to integer t, with at
#                                   least n bits and m array elements
# bigInt  inverseMod(x,n)        //return (x**(-1) mod n) for bigInts x and n.
#                                   If no inverse exists, it returns null
# int     inverseModInt(x,n)     //return x**(-1) mod n, for integers x and n.
#                                   Return 0 if there is no inverse
# boolean isZero(x)              //is the bigInt x equal to zero?
# boolean millerRabin(x,b)       //does one round of Miller-Rabin base integer b
#                      say that bigInt x is possibly prime? (b is bigInt, 1<b<x)
# boolean millerRabinInt(x,b)    //does one round of Miller-Rabin base integer b
#                      say that bigInt x is possibly prime? (b is int,    1<b<x)
# bigInt  mod(x,n)               //return a new bigInt equal to (x mod n) for
#                                   bigInts x and n.
# int     modInt(x,n)            //return x mod n for bigInt x and integer n.
# bigInt  mult(x,y)              //return x*y for bigInts x and y. This is
#                                   faster when y<x.
# bigInt  multMod(x,y,n)         //return (x*y mod n) for bigInts x,y,n.
#                                   For greater speed, let y<x.
# boolean negative(x)            //is bigInt x negative?
# bigInt  powMod(x,y,n)          //return (x**y mod n) where x,y,n are bigInts
#                           and ** is exponentiation.  0**0=1. Faster for odd n.
# bigInt  randBigInt(n,s)        //return an n-bit random BigInt (n>=1).
#                 If s=1, then the most significant of those n bits is set to 1.
# bigInt  randTruePrime(k)       //return a new, random, k-bit, true prime
#                                   bigInt using Maurer's algorithm.
# bigInt  randProbPrime(k)       //return a new, random, k-bit, probable prime
#                           bigInt (probability it's composite less than 2^-80).
# bigInt  str2bigInt(s,b,n,m)    //return a bigInt for number represented in
#                 string s in base b with at least n bits and m array elements
# bigInt  sub(x,y)               //return (x-y) for bigInts x and y.
#                     Negative answers will be 2s complement
# bigInt  trim(x,k)              //return a copy of x with exactly k leading
#                                   zero elements
#
#
# The following functions each have a non-underscored version, which most users
# should call instead. These functions each write to a single parameter, and the
# caller is responsible for ensuring the array passed in is large enough
# to hold the result.
#
# void    addInt_(x,n)        //do x=x+n where x is a bigInt and n is an integer
# void    add_(x,y)           //do x=x+y for bigInts x and y
# void    copy_(x,y)          //do x=y on bigInts x and y
# void    copyInt_(x,n)       //do x=n on bigInt x and integer n
# void    GCD_(x,y)           //set x to the greatest common divisor of bigInts
#               x and y, (y is destroyed).  (This never overflows its array).
# boolean inverseMod_(x,n)    //do x=x**(-1) mod n, for bigInts x and n.
#                               Returns 1 (0) if inverse does (doesn't) exist
# void    mod_(x,n)             //do x=x mod n for bigInts x and n.
#                                   (This never overflows its array).
# void    mult_(x,y)            //do x=x*y for bigInts x and y.
# void    multMod_(x,y,n)       //do x=x*y  mod n for bigInts x,y,n.
# void    powMod_(x,y,n)        //do x=x**y mod n, where x,y,n are bigInts
#                                 (n is odd) and ** is exponentiation.  0**0=1.
# void    randBigInt_(b,n,s)    //do b = an n-bit random BigInt. if s=1, then
#                             nth bit (most significant bit) is set to 1. n>=1.
# void    randTruePrime_(ans,k) //do ans = a random k-bit true random prime (not
#                                   just probable prime) with 1 in the msb.
# void    sub_(x,y)             //do x=x-y for bigInts x and y. Negative answers
#                                   will be 2s complement.
#
# The following functions do NOT have a non-underscored version.  They each
# write a bigInt result to one or more parameters.  The caller is responsible
# for ensuring the arrays passed in are large enough to hold the results.
#
# void addShift_(x,y,ys)       //do x=x+(y<<(ys*bpe))
# void carry_(x)               //do carries and borrows so each element of the
#                                 bigInt x fits in bpe bits.
# void divide_(x,y,q,r)        //divide x by y giving quotient q and remainder r
# int  divInt_(x,n)            //do x=floor(x/n) for bigInt x and integer n, and
#                         return the remainder. (This never overflows its array)
# int  eGCD_(x,y,d,a,b)        //sets a,b,d to positive bigInts such that
#                                 d = GCD_(x,y) = a*x-b*y
# void halve_(x)               //do x=floor(|x|/2)*sgn(x) for bigInt x in 2's
#                                 complement.  (This never overflows its array).
# void leftShift_(x,n)         //left shift bigInt x by n bits.  n<bpe.
# void linComb_(x,y,a,b)       //do x=a*x+b*y for bigInts x and y and ints a/b
# void linCombShift_(x,y,b,ys) //do x=x+b*(y<<(ys*bpe)) for bigInts x and y,
#                                 and integers b and ys
# void mont_(x,y,n,np)         //Montgomery multiplication (see comments where
#                                 the function is defined)
# void multInt_(x,n)          //do x=x*n where x is a bigInt and n is an integer
# void rightShift_(x,n)       //right shift bigInt x by n bits.  0 <= n < bpe.
#                               (This never overflows its array).
# void squareMod_(x,n)        //do x=x*x  mod n for bigInts x,n
# void subShift_(x,y,ys)      //do x=x-(y<<(ys*bpe)). Negative answers will be
#                               2s complement.
#
# The following functions are based on algorithms from the
# _Handbook of Applied Cryptography_ by B.Schneier
#
#    powMod_()           = algorithm 14.94, Montgomery exponentiation
#    eGCD_,inverseMod_() = algorithm 14.61, Binary extended GCD_
#    GCD_()              = algorothm 14.57, Lehmer's algorithm
#    mont_()             = algorithm 14.36, Montgomery multiplication
#    divide_()           = algorithm 14.20  Multiple-precision division
#    squareMod_()        = algorithm 14.16  Multiple-precision squaring
#    randTruePrime_()    = algorithm  4.62, Maurer's algorithm
#    millerRabin()       = algorithm  4.24, Miller-Rabin algorithm
#
# Profiling shows:
#     randTruePrime_() spends:
#         10% of its time in calls to powMod_()
#         85% of its time in calls to millerRabin()
#     millerRabin() spends:
#         99% of its time in calls to powMod_()   (always with a base of 2)
#     powMod_() spends:
#         94% of its time in calls to mont_()  (almost always with x==y)
#
# This suggests there are several ways to speed up this library slightly:
#     - convert powMod_ to use a Montgomery form of k-ary window
#       (or maybe a Montgomery form of sliding window)
#         -- this should especially focus on being fast when raising 2 to a
#            power mod n
#     - convert randTruePrime_() to use a minimum r of 1/3 instead of 1/2
#       with the appropriate change to the test
#     - tune the parameters in randTruePrime_(), including c, m, and recLimit
#     - speed up the single loop in mont_() that takes 95% of the runtime,
#       perhaps by reducing checking within the loop when all the parameters are
#       the same length.
#
#There are several ideas that look like they wouldn't help much at all:
#    - replacing trial division in randTruePrime_() with a sieve (that speeds up
#      something taking almost no time anyway)
#    - increase bpe from 15 to 30 (that would help if we had a 32*32->64
#      multiplier, but not with JavaScript's 32*32->32)
#    - speeding up mont_(x,y,n,np) when x==y by doing a non-modular,
#      non-Montgomery square followed by a Montgomery reduction.
#      The intermediate answer will be twice as long as x, so that
#      method would be slower.  This is unfortunate because the code currently
#      spends almost all of its time doing mont_(x,x,...),
#      both for randTruePrime_() and powMod_().  A faster method for Montgomery
#      squaring would have a large impact on the speed of randTruePrime_() and
#      powMod_().  HAC has a couple of poorly-worded sentences that seem to
#      imply it's faster to do a non-modular square followed by a single
#      Montgomery reduction, but that's obviously wrong.


