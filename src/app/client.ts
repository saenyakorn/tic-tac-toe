import { GameTableSchema } from '@/services/game/game.schema'
import axios from 'axios'

const httpClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const fetcher = {
  aiRespond: async (data: GameTableSchema) => {
    return await httpClient.post<GameTableSchema>('/game/ai/respond', data)
  },
  init: async () => {
    return await httpClient.get<GameTableSchema>('/game/init')
  },
}
