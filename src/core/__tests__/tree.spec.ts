import { describe, expect, it } from 'vitest'
import { findNode } from '../tree'

interface Node {
  value: string
  children?: Node[]
}

const leaf: Node = { value: 'src/core/a.ts' }
const nodes: Node[] = [
  { value: 'src', children: [{ value: 'src/core', children: [leaf] }] },
  { value: 'README.md' },
]

describe('findNode', () => {
  it('finds a top-level node', () => {
    expect(findNode(nodes, 'README.md')).toStrictEqual({ value: 'README.md' })
  })

  it('finds a nested node', () => {
    expect(findNode(nodes, 'src/core/a.ts')).toBe(leaf)
  })

  it('gives undefined for an unknown value', () => {
    expect(findNode(nodes, 'missing')).toBeUndefined()
  })

  it('gives undefined for no selection', () => {
    expect(findNode(nodes, null)).toBeUndefined()
  })
})
