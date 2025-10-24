// Temporary in-memory mock DB for the Example page
// Note: This lives outside the api/ folder to keep API layer clean.
import type { CreateExampleInput, ExampleItem } from '../types/example'

let seq = 3
let items: ExampleItem[] = [
  { id: '1', name: '홍길동', email: 'hong@example.com', status: 'ACTIVE', createdAt: new Date().toISOString() },
  { id: '2', name: '김철수', email: 'chulsoo@example.com', status: 'INACTIVE', createdAt: new Date().toISOString() },
]

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

export type ListParams = { page: number; size: number }

export const exampleMockDb = {
  async list({ page, size }: ListParams) {
    await delay(300)
    const start = page * size
    const end = start + size
    const slice = items.slice(start, end)
    return {
      items: slice,
      total: items.length,
      page,
      size,
    }
  },
  async listAll(): Promise<ExampleItem[]> {
    await delay(300)
    return [...items]
  },
  async create(input: CreateExampleInput) {
    await delay(300)
    const now = new Date().toISOString()
    const newItem: ExampleItem = {
      id: String(seq++),
      name: input.name.trim(),
      email: input.email.trim(),
      status: input.status,
      createdAt: now,
    }
    items = [newItem, ...items]
    return newItem
  },
}
