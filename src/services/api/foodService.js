import foodData from '../mockData/food.json'

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

let foods = [...foodData]

const foodService = {
  async getAll() {
    await delay(200)
    return [...foods]
  },

  async getById(id) {
    await delay(150)
    const food = foods.find(f => f.id === id)
    if (!food) {
      throw new Error('Food not found')
    }
    return { ...food }
  },

  async create(foodData) {
    await delay(300)
    const newFood = {
      id: Date.now(),
      ...foodData,
      createdAt: new Date().toISOString()
    }
    foods.push(newFood)
    return { ...newFood }
  },

  async update(id, updates) {
    await delay(250)
    const index = foods.findIndex(f => f.id === id)
    if (index === -1) {
      throw new Error('Food not found')
    }
    
    foods[index] = {
      ...foods[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    return { ...foods[index] }
  },

  async delete(id) {
    await delay(200)
    const index = foods.findIndex(f => f.id === id)
    if (index === -1) {
      throw new Error('Food not found')
    }
    
    const deleted = foods.splice(index, 1)[0]
    return { ...deleted }
  }
}

export default foodService