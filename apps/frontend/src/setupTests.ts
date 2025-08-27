import '@testing-library/jest-dom'
import { clearFetchCache } from './utils/fetchCache'

beforeEach(() => {
  clearFetchCache()
})
