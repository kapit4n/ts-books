import axios from 'axios'
const basicUrl = 'http://localhost:7000/api'

export default class Fetch<T> {
  get(uri: string): Promise<T[]> {
    return axios.get(`${basicUrl}/${uri}`).then(response => response.data)
  }

  post(uri: string, data: T | null): Promise<T> {
    return axios.post(`${basicUrl}/${uri}`, data).then(response => response.data)
  }
}