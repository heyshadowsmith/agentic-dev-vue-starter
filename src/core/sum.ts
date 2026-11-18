export const sum = (values: readonly number[]): number => {
  if (values.length <= 1) return values[0] ?? 0
  const middle = Math.floor(values.length / 2)
  return sum(values.slice(0, middle)) + sum(values.slice(middle))
}
