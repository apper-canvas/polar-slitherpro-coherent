import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ApperIcon from '../components/ApperIcon'

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-neon-green"
          animate={{ 
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <ApperIcon name="AlertTriangle" className="w-12 h-12 text-white" />
        </motion.div>

        <motion.h1 
          className="text-6xl md:text-8xl font-bold font-mono neon-text-green mb-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          404
        </motion.h1>

        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-surface-50 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Game Over!
        </motion.h2>

        <motion.p 
          className="text-surface-400 mb-8 font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          The page you're looking for slithered away. Let's get you back to the game!
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-neon-green hover:shadow-neon-blue group"
          >
            <ApperIcon name="Home" className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-mono">Return to Game</span>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default NotFound