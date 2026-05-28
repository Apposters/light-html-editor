type Listener = (...args: unknown[]) => void

export class EventEmitter {
  private map = new Map<string, Set<Listener>>()

  on(event: string, listener: Listener): () => void {
    if (!this.map.has(event)) this.map.set(event, new Set())
    this.map.get(event)!.add(listener)
    return () => this.off(event, listener)
  }

  off(event: string, listener: Listener): void {
    this.map.get(event)?.delete(listener)
  }

  emit(event: string, ...args: unknown[]): void {
    this.map.get(event)?.forEach(l => l(...args))
  }

  destroy(): void {
    this.map.clear()
  }
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout> | undefined
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}
