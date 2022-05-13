

export async function timeoutOnPromise<T>(promise: Promise<T>, timeout: number, timeoutRunner: () => any): Promise<T> {
  const timer = setTimeout(timeoutRunner, timeout)
  const res = await promise
  clearTimeout(timer)
  return res
}
