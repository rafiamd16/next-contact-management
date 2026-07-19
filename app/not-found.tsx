'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FaCompass, FaHome, FaTachometerAlt } from 'react-icons/fa'

const NotFound = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100'>
      <div className='max-w-2xl px-4 text-center'>
        {/* Error Code with Animated Icon */}
        <motion.div
          className='mb-6 flex items-center justify-center gap-4'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatDelay: 3,
            }}>
            <FaCompass className='text-6xl text-indigo-600' />
          </motion.div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.2,
              type: 'spring',
              stiffness: 300,
            }}
            className='text-8xl font-bold text-indigo-600'>
            404
          </motion.div>
        </motion.div>

        {/* Main Message */}
        <motion.h1
          className='mb-6 text-4xl font-bold text-gray-900 md:text-5xl'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}>
          Page Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          className='mb-10 text-xl text-gray-700'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}>
          It seems you&apos;ve gotten lost. The page you are looking for does not exist or has been
          moved.
        </motion.p>

        {/* Action Buttons with Icons */}
        <motion.div
          className='flex flex-col justify-center gap-4 sm:flex-row'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href='/'
              className='flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-8 py-3 font-medium text-white transition hover:bg-indigo-700'>
              <FaHome />
              back to home
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href='/dashboard'
              className='flex items-center justify-center gap-2 rounded-lg border border-indigo-600 px-8 py-3 font-medium text-indigo-600 transition hover:bg-indigo-50'>
              <FaTachometerAlt />
              To The Dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          className='dark: mx-auto mt-12 max-w-md rounded-xl border bg-card p-6 shadow-md dark:bg-neutral-900'
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ y: -5 }}>
          <motion.h3
            className='mb-3 flex items-center justify-center gap-2 font-semibold text-gray-900'
            animate={{
              color: ['#4F46E5', '#6366F1', '#4F46E5'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'reverse',
            }}>
            <FaCompass className='text-indigo-600' />
            Need Help?
          </motion.h3>
          <p className='mb-4 text-gray-600'>Try one of these:</p>
          <motion.ul
            className='space-y-2 text-left text-gray-600'
            initial='hidden'
            animate='visible'
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}>
            {[
              'Double-check the URL you typed',
              'Back to previous page',
              'Contact support if the problem persists.',
            ].map((text, index) => (
              <motion.li
                key={index}
                className='flex items-start gap-2'
                variants={{
                  hidden: { opacity: 0, x: -10 },
                  visible: { opacity: 1, x: 0 },
                }}>
                <motion.span
                  className='text-indigo-600'
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{
                    delay: index * 0.2 + 1,
                    duration: 0.3,
                  }}>
                  •
                </motion.span>
                {text}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
