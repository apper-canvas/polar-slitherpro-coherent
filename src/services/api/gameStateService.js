import gameStateData from '../mockData/gameState.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let gameStates = [...gameStateData]

const gameStateService = {
  async getAll() {
    await delay(200)
    return [...gameStates]
  },

  async getById(id) {
    await delay(150)
    const gameState = gameStates.find(state => state.id === id)
    if (!gameState) {
      throw new Error('Game state not found')
    }
    return { ...gameState }
  },

  async create(gameStateData) {
    await delay(300)
    const newGameState = {
      id: Date.now(),
      ...gameStateData,
      createdAt: new Date().toISOString()
    }
    gameStates.push(newGameState)
    return { ...newGameState }
  },

  async update(id, updates) {
    await delay(250)
    const index = gameStates.findIndex(state => state.id === id)
    if (index === -1) {
      throw new Error('Game state not found')
    }
    
    gameStates[index] = {
      ...gameStates[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { ...gameStates[index] }
  },

  async delete(id) {
    await delay(200)
    const index = gameStates.findIndex(state => state.id === id)
    if (index === -1) {
      throw new Error('Game state not found')
    }
    
    const deleted = gameStates.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default gameStateService