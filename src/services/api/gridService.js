import gridData from '../mockData/grid.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let grids = [...gridData]

const gridService = {
  async getAll() {
    await delay(200)
    return [...grids]
  },

  async getById(id) {
    await delay(150)
    const grid = grids.find(g => g.id === id)
    if (!grid) {
      throw new Error('Grid not found')
    }
    return { ...grid }
  },

  async create(gridData) {
    await delay(300)
    const newGrid = {
      id: Date.now(),
      ...gridData,
      createdAt: new Date().toISOString()
    }
    grids.push(newGrid)
    return { ...newGrid }
  },

  async update(id, updates) {
    await delay(250)
    const index = grids.findIndex(g => g.id === id)
    if (index === -1) {
      throw new Error('Grid not found')
    }
    
    grids[index] = {
      ...grids[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { ...grids[index] }
  },

  async delete(id) {
    await delay(200)
    const index = grids.findIndex(g => g.id === id)
    if (index === -1) {
      throw new Error('Grid not found')
    }
    
    const deleted = grids.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default gridService