import type { CreateExampleInput, ExampleItem } from '../../types/example';
import { exampleMockDb } from '../../mocks/exampleDb';

// REST-style API connector (temporarily backed by a local mock DB)
export const exampleApi = {
  async list(): Promise<ExampleItem[]> {
    // In real implementation: return (await axiosClient.get('/examples')).data
    return exampleMockDb.listAll();
  },
  async create(input: CreateExampleInput): Promise<ExampleItem> {
    // In real implementation: return (await axiosClient.post('/examples', input)).data
    return exampleMockDb.create(input);
  },
};
