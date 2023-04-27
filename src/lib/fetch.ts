import axios from 'axios'
const basicUrl = 'http://localhost:7000/api'

export default class Fetch<T> {

  url: string;
  constructor(url: string) {
    this.url = url;
  }

  get(query: string): Promise<T[]> {
    return axios.get(`${basicUrl}/${this.url}?${query}`).then(response => response.data)
  }
  getById(id: number): Promise<T> {
    return axios.get(`${basicUrl}/${this.url}/${id}`).then(response => response.data)
  }

  post(data: T | null): Promise<T> {
    return axios.post(`${basicUrl}/${this.url}`, data).then(response => response.data)
  }

  put(id: number, data: T | null): Promise<T> {
    return axios.post(`${basicUrl}/${this.url}/${id}`, data).then(response => response.data)
  }

  delete(id: number): Promise<void> {
    return axios.delete(`${basicUrl}/${this.url}/${id}`).then(response => response.data)
  }
}
