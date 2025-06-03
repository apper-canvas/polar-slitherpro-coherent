import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MainFeature from '../components/MainFeature'
import ApperIcon from '../components/ApperIcon'

const Home = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20"></div>
        <div 
          className="w-full h-full" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '30px 30px'
          }}
        ></div>
      </div>

      {/* Header */}
      <motion.header 
        className="relative z-10 p-4 md:p-8"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <motion.div 
              className="flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-neon-green">
                <ApperIcon name="Gamepad2" className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold font-mono neon-text-green text-surface-50">
                  SlitherPro
                </h1>
                <p className="text-sm md:text-base text-surface-400 font-mono">
                  Modern Snake Gaming
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-4"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <div className="glass-morphism px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2 text-surface-300">
                  <ApperIcon name="Trophy" className="w-4 h-4 text-accent" />
                  <span className="font-mono text-sm">High Score: 0</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 px-4 md:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <MainFeature />
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 mt-auto p-4 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="glass-morphism rounded-xl p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-surface-300">
                <div className="flex items-center gap-2">
                  <ApperIcon name="Keyboard" className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-mono">Arrow Keys / WASD</span>
                </div>
                <div className="flex items-center gap-2">
                  <ApperIcon name="Pause" className="w-4 h-4" />
                  <span className="text-xs md:text-sm font-mono">Space to Pause</span>
                </div>
              </div>
              <p className="text-xs md:text-sm text-surface-400 font-mono">
                © 2024 SlitherPro. Built with modern web technologies.
              </p>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Home