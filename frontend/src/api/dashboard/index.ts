import { axiosClient } from '../../lib/http';

export type HelloResponse = { message: string };

export const helloApi = {
  getHello: async () => {
    const res = await axiosClient.get<HelloResponse>('/hello');
    return res.data;
  },
};
