export function deepClone<T>(data: T): T {
  return JSON.parse(JSON.stringify(data))
}
