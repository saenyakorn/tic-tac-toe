export function deepClone(data: unknown) {
  return JSON.parse(JSON.stringify(data))
}
