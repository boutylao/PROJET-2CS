// src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8098', // ou l'URL de votre backend
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteurs pour gérer les erreurs globalement
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Gérer les erreurs HTTP
      return Promise.reject(error.response.data)
    }
    return Promise.reject(error)
  }
)

export default api