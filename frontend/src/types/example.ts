export type ExampleItem = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
};

export type CreateExampleInput = {
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
};
