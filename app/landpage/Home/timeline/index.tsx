'use client'
import Image from 'next/image'
import { timelineData } from '@/app/landpage/api/data'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'

const TimeLine = () => {
  const ref = useRef(null)
  const inView = useInView(ref)

  const TopAnimation = {
    initial: { y: '-100%', opacity: 0 },
    animate: inView ? { y: 0, opacity: 1 } : { y: '-100%', opacity: 0 },
    transition: { duration: 0.6, delay: 0.4 },
  }
  return (
    <section className='md:pt-40 pt-9' id='development'>
      <div className='container lg:px-16 px-4'>
        <div className='text-center'>
          <motion.div
            whileInView={{ y: 0, opacity: 1 }}
            initial={{ y: '-100%', opacity: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='flex flex-col gap-4'>
              <p className='text-white font-medium'>
                We deliver <span className='text-[#2D6A4F]'>best solution</span>
              </p>
              <h2 className='text-white sm:text-5xl text-3xl font-medium lg:w-80% mx-auto mb-20'>
                One application with multiple options to give you freedom of designing
              </h2>
            </div>
          </motion.div>
          <motion.div
            whileInView={{ scale: 1, opacity: 1 }}
            initial={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.6 }}>
            <div className='md:block hidden relative'>
              <div>
                <Image
                  src='/timeline.jpg'
                  alt='image'
                  width={600}
                  height={400}
                  className='w-50% mx-auto rounded-4xl'
                />
              </div>
              <div className='absolute lg:top-40 top-36 -left-20 w-72 flex items-center gap-6'>
                <div className='text-right'>
                  <h3 className='text-muted text-2xl mb-3'>Designing</h3>
                  <p className='text-lg text-muted/60'>
                    Edit your images to make them clearer and sharper
                  </p>
                </div>
                <div className='bg-[#a2e8bc]/15 backdrop-blur-xs px-6 py-2 h-fit rounded-full'>
                  <Image
                    src='/images/solution/solution-icon-1.svg'
                    alt='Planning'
                    width={44}
                    height={44}
                    className='w-16 h-16 '
                  />
                </div>
              </div>
              <div className='absolute lg:top-40 top-36 -right-20 w-72 flex items-center gap-6'>
                <div className='bg-[#a2e8bc]/15 backdrop-blur-xs p-6 h-fit rounded-full'>
                  <Image
                    src='/images/solution/solution-icon-2.svg'
                    alt='Refinement'
                    width={44}
                    height={44}
                  />
                </div>
                <div className='text-left'>
                  <h3 className='text-muted text-2xl mb-3'>Unique</h3>
                  <p className='text-lg text-muted/60'>
                  Add textured backgrounds & frame your images in unique ways
                  </p>
                </div>
              </div>
              <div className='absolute lg:bottom-48 bottom-36 -left-20 w-72 flex items-center gap-6'>
                <div className='text-right'>
                  <h3 className='text-muted text-2xl mb-3'>Collaboration</h3>
                  <p className='text-lg text-muted/60'>
                  Grant access based on Edit or View-only levels
                  </p>
                </div>
                <div className='bg-[#a2e8bc]/15 backdrop-blur-xs px-6 py-2 h-fit rounded-full'>
                  <Image
                    src='/images/solution/solution-icon-3.svg'
                    alt='Prototype'
                    width={44}
                    height={44}
                    className='w-16 h-16 '
                  />
                </div>
              </div>
              <div className='absolute lg:bottom-48 bottom-36 -right-20 w-72 flex items-center gap-6'>
                <div className='bg-[#a2e8bc]/15 backdrop-blur-xs px-6 py-2 h-fit rounded-full'>
                  <Image
                    src='/images/solution/solution-icon-4.svg'
                    alt='Scale and support'
                    width={44}
                    height={44}
                    className='w-16 h-16'
                  />
                </div>
                <div className='text-left'>
                  <h3 className='text-muted text-nowrap text-2xl mb-3'>
                    Access
                  </h3>
                  <p className='text-lg text-muted/60'>
                    Access your designs from any device
                  </p>
                </div>
              </div>
            </div>
            <div className='grid sm:grid-cols-2 gap-8 md:hidden'>
              {timelineData.map((item, index) => (
                <div key={index} className='flex items-center gap-6'>
                  <div className='bg-[#a2e8bc]/15 p-6 rounded-full'>
                    <Image
                      src={item.icon}
                      alt={item.title}
                      width={44}
                      height={44}
                    />
                  </div>
                  <div className='text-start'>
                    <h4 className='text-2xl text-muted mb-2'>{item.title}</h4>
                    <p className='text-muted/60 text-lg'>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default TimeLine
