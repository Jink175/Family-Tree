import { perksData } from '@/app/landpage/api/data'
import Image from 'next/image'

const Perks = () => {
  return (
    <section className='pb-28 relative'>
      <div className='container px-4 relative z-0'> {/* z-0 thấp hơn image */}
        <div className='text-center relative'>
          <div className='flex flex-col gap-4'>
            <p className="text-muted text-base relative">
              Always By <span className='text-[#2D6A4F]'>your side</span>
            </p>
            <h2 className='text-white sm:text-5xl text-3xl font-medium'>
              Benefits of Using a Genealogy Generator!
            </h2>
          </div>

          {/* Perks cards */}
          <div className='mt-16 border border-border grid lg:grid-cols-3 sm:grid-cols-2 py-16 gap-10 px-20 rounded-3xl sm:bg-black bg-[#2d6a4f] lg:bg-bottom bg-center bg-no-repeat relative z-0'>
            <Image
            src='/images/perks/perk-bg.png'
            alt='perks-bg'
            width={1000}
            height={100}
            className='absolute top-25 left-0 w-500 h-full object-cover object-center z-100'
          />
            {perksData.map((item, index) => (
              <div
                key={index}
                className='text-center flex items-center justify-end flex-col'>
                <div className='bg-[#a2e8bc]/25 backdrop-blur-xs p-4 rounded-full w-fit'>
                  <Image
                    src={item.icon}
                    alt={item.title}
                    width={44}
                    height={44}
                  />
                </div>
                <h3 className={`text-white text-28 mb-4 ${item.space}`}>
                  {item.title}
                </h3>
                <div
                  className='text-muted/60'
                  dangerouslySetInnerHTML={{ __html: item.text }}
                />
              </div>
            ))}
          </div>

          {/* Background image đè lên */}
          
        </div>
      </div>

      {/* Decorative circle */}
      <div className='bg-linear-to-br from-tealGreen to-charcoalGray sm:w-50 w-96 z-0 sm:h-50 h-96 rounded-full sm:-bottom-80 bottom-0 blur-400 absolute sm:-left-48 opacity-60'></div>
    </section>
  )
}

export default Perks
