

describe 'Random module', () ->

  it 'can instantiate and initialize Random number generator', () ->
    { Random } = require 'Random'
    rand = new Random()
    num = rand.nextByte()
    expect(Random).toBeDefined()
    expect(rand).toBeDefined()
    expect(num).toBeGreaterThan(0)
