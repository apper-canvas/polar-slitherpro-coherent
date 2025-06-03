import snakeData from '../mockData/snake.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let snakes = [...snakeData]

const snakeService = {
  async getAll() {
    await delay(200)
    return [...snakes]
  },

  async getById(id) {
    await delay(150)
    const snake = snakes.find(s => s.id === id)
    if (!snake) {
      throw new Error('Snake not found')
    }
    return { 
      ...snake,
      segments: snake.segments ? [...snake.segments] : []
    }
  },

  async create(snakeData) {
    await delay(300)
    const newSnake = {
      id: Date.now(),
      ...snakeData,
      segments: snakeData.segments ? [...snakeData.segments] : [],
      createdAt: new Date().toISOString()
    }
    snakes.push(newSnake)
    return { 
      ...newSnake,
      segments: [...newSnake.segments]
    }
  },

  async update(id, updates) {
    await delay(250)
    const index = snakes.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Snake not found')
    }
    
    snakes[index] = {
      ...snakes[index],
      ...updates,
      segments: updates.segments ? [...updates.segments] : snakes[index].segments,
      updatedAt: new Date().toISOString()
    }
    
    return { 
      ...snakes[index],
      segments: [...snakes[index].segments]
    }
  },

  async delete(id) {
    await delay(200)
    const index = snakes.findIndex(s => s.id === id)
    if (index === -1) {
      throw new Error('Snake not found')
    }
    
    const deleted = snakes.splice(index, 1)[0]
    return { 
      ...deleted,
      segments: deleted.segments ? [...deleted.segments] : []
    }
  }
}

export default snakeService