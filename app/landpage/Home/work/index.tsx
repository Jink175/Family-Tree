'use client'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const Work = () => {
  const ref = useRef(null)
  const inView = useInView(ref)

  const TopAnimation = {
    initial: { y: '-100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '-100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }

  const bottomAnimation = {
    initial: { y: '100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }

  const services = [
    {
      icon: '/images/chooseus/chooseus-icon-1.svg',
      text: 'Designed for Family Tree platforms',
    },
    {
      icon: '/images/chooseus/chooseus-icon-2.svg',
      text: 'Kickstart your Family Tree website today',
    },
    {
      icon: '/images/chooseus/chooseus-icon-3.svg',
      text: 'Launch your graphy platform today',
    },
  ]

  return (
    <section className='' id='work'>
      <div className='container px-4 mx-auto lg:max-w-(--breakpoint-xl)'>
        <div ref={ref} className='grid grid-cols-12 items-center'>
          <motion.div
            {...bottomAnimation}
            className='lg:col-span-7 col-span-12'>
            <div className='flex flex-col gap-3'>
              <p className="text-white font-medium">
                Why choose <span className='text-[#2D6A4F]'>Family Tree</span>
              </p>
              <h2 className='sm:text-5xl text-3xl text-white lg:w-full md:w-70% font-medium'>
                Features of the Family Tree framer mobile application
              </h2>
            </div>
            <div className='grid md:grid-cols-2 gap-7 mt-11'>
              {services.map((service, index) => (
                <div key={index} className='flex items-center gap-5'>
                  <div className='p-3 bg-[#a2e8bc]/15 rounded-full'>
                    <Image
                      src={service.icon}
                      alt={`${service.text} icon`}
                      width={25}
                      height={25}
                    />
                  </div>
                  <p className='text-white font-medium'>{service.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div {...TopAnimation} className='lg:col-span-5 col-span-12'>
            <div className='2xl:-mr-40 mt-9 flex justify-center'>
              <Image
                src='/work.jpg'
                alt='image'
                width={400}
                height={225}
                className=' rounded-2xl'
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Work
