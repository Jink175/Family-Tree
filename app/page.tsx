'use client'
import React from 'react'
import Hero from '@/app/landpage/Home/Hero'
import Work from '@/app/landpage/Home/work'
import TimeLine from '@/app/landpage/Home/timeline'
import Portfolio from '@/app/landpage/Home/portfolio'
import Upgrade from '@/app/landpage/Home/upgrade'
import Perks from '@/app/landpage/Home/perks'
import { Metadata } from 'next'
import BrandLogo from '@/app/landpage/Home/BrandLogo'
import GlobalReach from '@/app/landpage/Home/GlobalReach'
import Faq from '@/app/landpage/Home/Faq'


export default function TestPage() {
  
  return (
    <main className='bg-black max-w-7xl mx-auto px-4 py-8'>
      <Hero />
      <Work />
      <GlobalReach/>
      <TimeLine />
      <Portfolio />
      <Upgrade />
      <Perks />
      <Faq/>
    </main>
  )

}
