import { describe, expect, it } from 'vitest'
import { defaultValues, fillTemplate, parseVariables } from '../variables'

describe('parseVariables', () => {
  it('finds a simple variable', () => {
    expect(parseVariables('Hello {{name}}!')).toStrictEqual([{ name: 'name', defaultValue: '' }])
  })

  it('allows spaces inside the braces', () => {
    expect(parseVariables('Hello {{  name  }}!')).toStrictEqual([
      { name: 'name', defaultValue: '' },
    ])
  })

  it('reads a default value and trims it', () => {
    expect(parseVariables('Write in {{ tone | friendly and short }}.')).toStrictEqual([
      { name: 'tone', defaultValue: 'friendly and short' },
    ])
  })

  it('accepts an empty default', () => {
    expect(parseVariables('{{tone|}}')).toStrictEqual([{ name: 'tone', defaultValue: '' }])
  })

  it('lists a repeated variable once, in order of first use', () => {
    expect(parseVariables('{{b}} {{a}} {{b}} {{a}}')).toStrictEqual([
      { name: 'b', defaultValue: '' },
      { name: 'a', defaultValue: '' },
    ])
  })

  it('keeps the first default of a repeated variable', () => {
    expect(parseVariables('{{lang|Go}} {{lang|Rust}}')).toStrictEqual([
      { name: 'lang', defaultValue: 'Go' },
    ])
  })

  it('takes a later default when the first use has none', () => {
    expect(parseVariables('{{lang}} {{lang|Rust}}')).toStrictEqual([
      { name: 'lang', defaultValue: 'Rust' },
    ])
  })

  it('accepts letters, digits, underscores and hyphens in names', () => {
    expect(parseVariables('{{file_name-2}} {{X}}')).toStrictEqual([
      { name: 'file_name-2', defaultValue: '' },
      { name: 'X', defaultValue: '' },
    ])
  })

  it('ignores names with spaces or other characters', () => {
    expect(parseVariables('{{first name}} {{a.b}} {{$x}} {{}} {{ }}')).toStrictEqual([])
  })

  it('ignores unclosed braces', () => {
    expect(parseVariables('{{name} and {{other and {name}}')).toStrictEqual([])
  })

  it('finds a valid variable after an unclosed one', () => {
    expect(parseVariables('{{broken {{ok}}')).toStrictEqual([{ name: 'ok', defaultValue: '' }])
  })

  it('returns nothing for text without variables', () => {
    expect(parseVariables('Plain text')).toStrictEqual([])
  })
})

describe('defaultValues', () => {
  it('maps each name to its default', () => {
    expect(
      defaultValues([
        { name: 'a', defaultValue: 'x' },
        { name: 'b', defaultValue: '' },
      ]),
    ).toStrictEqual({ a: 'x', b: '' })
  })
})

describe('fillTemplate', () => {
  it('replaces a variable with its value', () => {
    expect(fillTemplate('Hello {{name}}!', { name: 'Ada' })).toBe('Hello Ada!')
  })

  it('replaces every occurrence of a repeated variable with one value', () => {
    expect(fillTemplate('{{ x }} + {{x}} = {{x|1}}', { x: '2' })).toBe('2 + 2 = 2')
  })

  it('uses the default when no value is given', () => {
    expect(fillTemplate('Tone: {{tone|calm}}', {})).toBe('Tone: calm')
  })

  it('uses the shared default at every occurrence', () => {
    expect(fillTemplate('{{lang}} and {{lang|Rust}}', {})).toBe('Rust and Rust')
  })

  it('uses an empty value when the person clears the field', () => {
    expect(fillTemplate('[{{tone|calm}}]', { tone: '' })).toBe('[]')
  })

  it('replaces a variable without a value or default with nothing', () => {
    expect(fillTemplate('[{{name}}]', {})).toBe('[]')
  })

  it('leaves invalid names and unclosed braces as they are', () => {
    expect(fillTemplate('{{first name}} {{name} {{ok}}', { ok: 'yes' })).toBe(
      '{{first name}} {{name} yes',
    )
  })

  it('does not treat dollar signs in values as replacement patterns', () => {
    expect(fillTemplate('{{price}}', { price: '$& $1' })).toBe('$& $1')
  })
})
