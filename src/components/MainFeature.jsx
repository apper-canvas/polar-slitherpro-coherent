import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-toastify'
import ApperIcon from './ApperIcon'
import gameStateService from '../services/api/gameStateService'
import snakeService from '../services/api/snakeService'
import foodService from '../services/api/foodService'

const GRID_SIZE = 20
const CELL_SIZE = 20
const INITIAL_SPEED = 150

const MainFeature = () => {
  // Game state
  const [gameState, setGameState] = useState({
    score: 0,
    level: 1,
    isPlaying: false,
    isPaused: false,
    isGameOver: false,
    highScore: 0
  })

  const [snake, setSnake] = useState([{ x: 10, y: 10 }])
  const [direction, setDirection] = useState('right')
  const [nextDirection, setNextDirection] = useState('right')
  const [food, setFood] = useState({ x: 15, y: 15, type: 'normal', points: 10 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [gameSpeed, setGameSpeed] = useState(INITIAL_SPEED)
  const [showGameOver, setShowGameOver] = useState(false)

  const gameLoopRef = useRef(null)
  const gameContainerRef = useRef(null)

  // Load initial game state
  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true)
      try {
        const [gameData, snakeData, foodData] = await Promise.all([
          gameStateService.getAll(),
          snakeService.getAll(),
          foodService.getAll()
        ])

        if (gameData?.length > 0) {
          setGameState(gameData[0])
        }
        if (snakeData?.length > 0) {
          setSnake(snakeData[0].segments || [{ x: 10, y: 10 }])
          setDirection(snakeData[0].direction || 'right')
          setNextDirection(snakeData[0].direction || 'right')
        }
        if (foodData?.length > 0) {
          setFood(foodData[0])
        }
      } catch (err) {
        setError(err.message)
        toast.error("Failed to load game data")
      } finally {
        setLoading(false)
      }
    }
    loadGameData()
  }, [])

  // Generate random food position
  const generateFood = useCallback(() => {
    let newFood
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
        type: Math.random() < 0.8 ? 'normal' : 'bonus',
        points: Math.random() < 0.8 ? 10 : 25
      }
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))
    
    return newFood
  }, [snake])

  // Move snake
  const moveSnake = useCallback(() => {
    if (!gameState.isPlaying || gameState.isPaused) return

    setDirection(nextDirection)

    setSnake(currentSnake => {
      const head = { ...currentSnake[0] }
      
      switch (nextDirection) {
        case 'up':
          head.y -= 1
          break
        case 'down':
          head.y += 1
          break
        case 'left':
          head.x -= 1
          break
        case 'right':
          head.x += 1
          break
        default:
          break
      }

      // Check wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        gameOver()
        return currentSnake
      }

      // Check self collision
      if (currentSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        gameOver()
        return currentSnake
      }

      const newSnake = [head, ...currentSnake]

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        const newScore = gameState.score + food.points
        const newLevel = Math.floor(newScore / 100) + 1
        const newSpeed = Math.max(50, INITIAL_SPEED - (newLevel * 10))

        setGameState(prev => ({
          ...prev,
          score: newScore,
          level: newLevel
        }))
        
        setGameSpeed(newSpeed)
        setFood(generateFood())
        
        toast.success(`+${food.points} points!`, {
          position: "top-center",
          autoClose: 1000
        })

        return newSnake
      }

      // Remove tail if no food eaten
      return newSnake.slice(0, -1)
    })
  }, [gameState.isPlaying, gameState.isPaused, gameState.score, nextDirection, food, generateFood])

  // Game loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused) {
      gameLoopRef.current = setInterval(moveSnake, gameSpeed)
    } else {
      clearInterval(gameLoopRef.current)
    }

    return () => clearInterval(gameLoopRef.current)
  }, [gameState.isPlaying, gameState.isPaused, gameSpeed, moveSnake])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameState.isPlaying) return

      const key = e.key.toLowerCase()
      
      if (key === ' ') {
        e.preventDefault()
        togglePause()
        return
      }

      let newDirection = nextDirection

      switch (key) {
        case 'arrowup':
        case 'w':
          if (direction !== 'down') newDirection = 'up'
          break
        case 'arrowdown':
        case 's':
          if (direction !== 'up') newDirection = 'down'
          break
        case 'arrowleft':
        case 'a':
          if (direction !== 'right') newDirection = 'left'
          break
        case 'arrowright':
        case 'd':
          if (direction !== 'left') newDirection = 'right'
          break
        default:
          return
      }

      e.preventDefault()
      setNextDirection(newDirection)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameState.isPlaying, direction, nextDirection])

  // Game functions
  const startGame = async () => {
    try {
      const newGameState = {
        ...gameState,
        isPlaying: true,
        isPaused: false,
        isGameOver: false,
        score: 0,
        level: 1
      }
      
      setGameState(newGameState)
      setSnake([{ x: 10, y: 10 }])
      setDirection('right')
      setNextDirection('right')
      setFood(generateFood())
      setGameSpeed(INITIAL_SPEED)
      setShowGameOver(false)
      
      await gameStateService.create(newGameState)
      toast.success("Game started!")
    } catch (err) {
      toast.error("Failed to start game")
    }
  }

  const togglePause = () => {
    setGameState(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }))
    
    toast.info(gameState.isPaused ? "Game resumed" : "Game paused")
  }

  const gameOver = async () => {
    try {
      const newHighScore = Math.max(gameState.highScore, gameState.score)
      const endGameState = {
        ...gameState,
        isPlaying: false,
        isPaused: false,
        isGameOver: true,
        highScore: newHighScore
      }
      
      setGameState(endGameState)
      setShowGameOver(true)
      
      await gameStateService.update(1, endGameState)
      
      if (gameState.score > gameState.highScore) {
        toast.success(`New high score: ${gameState.score}!`)
      } else {
        toast.error("Game Over!")
      }

      // Shake effect
      if (gameContainerRef.current) {
        gameContainerRef.current.classList.add('animate-shake')
        setTimeout(() => {
          gameContainerRef.current?.classList.remove('animate-shake')
        }, 500)
      }
    } catch (err) {
      toast.error("Failed to save game state")
    }
  }

  const resetGame = () => {
    setGameState({
      score: 0,
      level: 1,
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      highScore: gameState.highScore
    })
    setSnake([{ x: 10, y: 10 }])
    setDirection('right')
    setNextDirection('right')
    setFood({ x: 15, y: 15, type: 'normal', points: 10 })
    setGameSpeed(INITIAL_SPEED)
    setShowGameOver(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <motion.div
          className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-500 mb-4">
          <ApperIcon name="AlertCircle" className="w-12 h-12 mx-auto mb-2" />
          <p>Error loading game: {error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Game Area */}
        <div className="lg:col-span-2">
          <motion.div
            ref={gameContainerRef}
            className="glass-morphism rounded-2xl p-4 md:p-6 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Game Grid */}
            <div className="relative mx-auto" style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}>
              <div 
                className="absolute inset-0 border-2 border-surface-600 rounded-lg"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(30, 41, 59, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(30, 41, 59, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
                }}
              />

              {/* Snake */}
              <AnimatePresence>
                {snake.map((segment, index) => (
                  <motion.div
                    key={`${segment.x}-${segment.y}-${index}`}
                    className={`absolute rounded-md ${
                      index === 0 
                        ? 'bg-gradient-to-br from-primary to-primary-dark shadow-neon-green' 
                        : 'bg-gradient-to-br from-primary-dark to-primary'
                    }`}
                    style={{
                      left: segment.x * CELL_SIZE,
                      top: segment.y * CELL_SIZE,
                      width: CELL_SIZE - 1,
                      height: CELL_SIZE - 1
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    {index === 0 && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                          <div className="w-1 h-1 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Food */}
              <motion.div
                className={`absolute rounded-md ${
                  food.type === 'bonus' 
                    ? 'bg-gradient-to-br from-accent to-yellow-600 animate-glow' 
                    : 'bg-gradient-to-br from-accent to-orange-600'
                } shadow-lg`}
                style={{
                  left: food.x * CELL_SIZE,
                  top: food.y * CELL_SIZE,
                  width: CELL_SIZE - 1,
                  height: CELL_SIZE - 1
                }}
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: food.type === 'bonus' ? [0, 5, -5, 0] : 0
                }}
                transition={{ 
                  duration: 1, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <ApperIcon 
                    name={food.type === 'bonus' ? 'Star' : 'Apple'} 
                    className="w-3 h-3 text-white" 
                  />
                </div>
              </motion.div>

              {/* Pause overlay */}
              <AnimatePresence>
                {gameState.isPaused && (
                  <motion.div
                    className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div className="text-center">
                      <ApperIcon name="Pause" className="w-16 h-16 text-white mx-auto mb-2" />
                      <p className="text-white font-mono text-lg">PAUSED</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Game Controls - Mobile */}
            <div className="mt-6 lg:hidden">
              <div className="grid grid-cols-3 gap-2 max-w-48 mx-auto">
                <div></div>
                <button
                  onTouchStart={() => setNextDirection('up')}
                  className="p-3 bg-surface-700 hover:bg-surface-600 rounded-lg text-white transition-colors"
                  disabled={!gameState.isPlaying || direction === 'down'}
                >
                  <ApperIcon name="ChevronUp" className="w-6 h-6" />
                </button>
                <div></div>
                
                <button
                  onTouchStart={() => setNextDirection('left')}
                  className="p-3 bg-surface-700 hover:bg-surface-600 rounded-lg text-white transition-colors"
                  disabled={!gameState.isPlaying || direction === 'right'}
                >
                  <ApperIcon name="ChevronLeft" className="w-6 h-6" />
                </button>
                <button
                  onClick={togglePause}
                  className="p-3 bg-secondary hover:bg-secondary-dark rounded-lg text-white transition-colors"
                  disabled={!gameState.isPlaying}
                >
                  <ApperIcon name={gameState.isPaused ? "Play" : "Pause"} className="w-6 h-6" />
                </button>
                <button
                  onTouchStart={() => setNextDirection('right')}
                  className="p-3 bg-surface-700 hover:bg-surface-600 rounded-lg text-white transition-colors"
                  disabled={!gameState.isPlaying || direction === 'left'}
                >
                  <ApperIcon name="ChevronRight" className="w-6 h-6" />
                </button>
                
                <div></div>
                <button
                  onTouchStart={() => setNextDirection('down')}
                  className="p-3 bg-surface-700 hover:bg-surface-600 rounded-lg text-white transition-colors"
                  disabled={!gameState.isPlaying || direction === 'up'}
                >
                  <ApperIcon name="ChevronDown" className="w-6 h-6" />
                </button>
                <div></div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Score Panel */}
          <motion.div
            className="glass-morphism rounded-2xl p-4 md:p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold font-mono neon-text-green">
                  {gameState.score.toLocaleString()}
                </div>
                <p className="text-surface-400 text-sm font-mono">Current Score</p>
              </div>

              <div className="flex justify-between text-sm">
                <div>
                  <div className="text-lg font-mono text-surface-300">{gameState.level}</div>
                  <p className="text-surface-500 text-xs">Level</p>
                </div>
                <div>
                  <div className="text-lg font-mono text-surface-300">{gameState.highScore}</div>
                  <p className="text-surface-500 text-xs">High Score</p>
                </div>
                <div>
                  <div className="text-lg font-mono text-surface-300">{snake.length}</div>
                  <p className="text-surface-500 text-xs">Length</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Controls Panel */}
          <motion.div
            className="glass-morphism rounded-2xl p-4 md:p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-surface-50 mb-4">Game Controls</h3>
              
              <div className="space-y-3">
                {!gameState.isPlaying ? (
                  <button
                    onClick={startGame}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon-green group"
                  >
                    <ApperIcon name="Play" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-mono">Start Game</span>
                  </button>
                ) : (
                  <button
                    onClick={togglePause}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon-blue group"
                  >
                    <ApperIcon name={gameState.isPaused ? "Play" : "Pause"} className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-mono">{gameState.isPaused ? 'Resume' : 'Pause'}</span>
                  </button>
                )}

                <button
                  onClick={resetGame}
                  className="w-full flex items-center justify-center gap-3 bg-surface-700 hover:bg-surface-600 text-surface-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 group"
                >
                  <ApperIcon name="RotateCcw" className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                  <span className="font-mono">Reset</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="pt-4 border-t border-surface-700">
                <h4 className="text-sm font-semibold text-surface-300 mb-2">Instructions</h4>
                <div className="space-y-1 text-xs text-surface-500 font-mono">
                  <p>• Use arrow keys or WASD to move</p>
                  <p>• Spacebar to pause/resume</p>
                  <p>• Eat food to grow and score</p>
                  <p>• Avoid walls and yourself</p>
                  <p>• Golden food = bonus points!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {showGameOver && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="glass-morphism rounded-2xl p-6 md:p-8 max-w-md w-full text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <ApperIcon name="Skull" className="w-10 h-10 text-white" />
              </div>

              <h2 className="text-3xl font-bold text-surface-50 mb-2 font-mono">Game Over!</h2>
              
              <div className="space-y-2 mb-6">
                <p className="text-xl text-surface-300 font-mono">Final Score: {gameState.score}</p>
                <p className="text-lg text-surface-400 font-mono">Level Reached: {gameState.level}</p>
                {gameState.score === gameState.highScore && gameState.score > 0 && (
                  <p className="text-lg text-accent font-mono animate-pulse">🏆 New High Score!</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={startGame}
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  <ApperIcon name="RotateCcw" className="w-4 h-4" />
                  <span className="font-mono">Play Again</span>
                </button>
                <button
                  onClick={() => setShowGameOver(false)}
                  className="flex-1 bg-surface-700 hover:bg-surface-600 text-surface-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300"
                >
                  <span className="font-mono">Close</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MainFeature