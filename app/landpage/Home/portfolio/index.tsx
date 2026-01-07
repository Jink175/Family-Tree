'use client'
import Image from 'next/image'
import { portfolioData } from '@/app/landpage/api/data'
import { motion } from 'framer-motion'

const Portfolio = () => {
  return (
    <section className='pt-12' id='portfolio'>
      <div className='container px-4 sm:px-6'>
        <div className='grid lg:grid-cols-2 items-center gap-20'>
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.6 }}
            className='lg:-ml-32'>
            <Image
              src='/portfolio.jpg'
              alt='Crypto Portfolio'
              width={780}
              height={700}
              className='rounded-4xl'
            />
          </motion.div>

          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: '100%', opacity: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='flex flex-col gap-4'>
              <p className='text-white font-medium'>
                Family Tree landing page <span className='text-[#2D6A4F]'>template</span>
              </p>
              <h2 className='text-white sm:text-5xl text-3xl mb-4 font-medium'>
                Create your ancestor portfolio today
              </h2>
            </div>
            <p className='text-muted/60 text-lg'>
              Graphy has a variety of features that make it the best place
              to start designing.
            </p>

            <table className='w-full sm:w-[80%] mt-10'>
              <tbody>
                {portfolioData.map((item, index) => (
                  <tr key={index} className='border-b border-border'>
                    <td className='py-5'>
                      <div className='bg-[#a2e8bc]/20 p-3 rounded-full w-fit'>
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={24}
                          height={24}
                        />
                      </div>
                    </td>
                    <td className='py-5'>
                      <h3 className='text-muted text-xl ml-5'>
                        {item.title}
                      </h3>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Portfolio
