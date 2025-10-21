import { axiosClient } from '../../lib/http'

export type HelloResponse = { message: string }

export const dashboardApi = {
  getHello: async () => {
    const res = await axiosClient.get<HelloResponse>('/hello')
    return res.data
  },
}

// For backward compatibility naming
export const helloApi = {
  getHello: async () => {
    const res = await axiosClient.get<HelloResponse>('/hello')
    return res.data
  },
}
