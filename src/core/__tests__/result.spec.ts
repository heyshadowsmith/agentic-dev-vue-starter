import { describe, expect, it } from 'vitest'
import { failure, success } from '../result'

describe('result', () => {
  it('wraps a value', () => {
    expect(success(3)).toStrictEqual({ ok: true, value: 3 })
  })

  it('wraps an error', () => {
    expect(failure('Not found')).toStrictEqual({ ok: false, error: 'Not found' })
  })
})
