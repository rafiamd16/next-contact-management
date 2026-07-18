'use client'

import { motion } from 'framer-motion'

const ContainerAnimate = ({ children }: { children: React.ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  )
}

export default ContainerAnimate
