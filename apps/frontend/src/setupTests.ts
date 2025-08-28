import '@testing-library/jest-dom'
import { clearFetchCache } from './utils/fetchCache'
import { vi } from 'vitest'

beforeEach(() => {
  clearFetchCache()
})

// Prevent jsdom from attempting to fetch external images (causes AggregateError)
// Simulate successful image load when setting src in tests
Object.defineProperty(global.Image.prototype, 'src', {
  configurable: true,
  set(this: HTMLImageElement, _src: string) {
    // Trigger onload asynchronously to mimic browser behavior
    setTimeout(() => {
      if (typeof this.onload === 'function') {
        this.onload(new (window as any).Event('load'))
      }
    }, 0)
  },
})

// Optional: silence scrollTo in jsdom
if (!window.scrollTo) {
  ; (window as any).scrollTo = vi.fn()
}
