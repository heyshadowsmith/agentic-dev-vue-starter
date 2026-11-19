export interface TreeNode<T> {
  readonly value: string
  readonly children?: readonly T[]
}

export const findNode = <T extends TreeNode<T>>(
  nodes: readonly T[],
  value: string | null,
): T | undefined =>
  nodes.reduce<T | undefined>(
    (found, node) => found ?? (node.value === value ? node : findNode(node.children ?? [], value)),
    undefined,
  )
