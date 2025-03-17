import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/toggle';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react'

const WorkSpaceHeader = ({fileName}) => {
  return (
      <div className='flex flex-col items-center gap-4 sm:flex-row justify-between p-3 sm:p-[1.2rem] shadow-md dark:bg-black dark:text-white dark:shadow-lg dark:shadow-gray-800'>
          <div>
              <h1 className='text-2xl sm:text-4xl font-bold'>
              <Link href="/dashboard">📒 NoteAura</Link>
              </h1>
          </div>
          <div className="flex items-center mt-2 sm:mt-0">
            <h2 className='font-bold text-sm sm:text-base truncate max-w-[150px] sm:max-w-[300px]'>{fileName}</h2>
          </div>
        
        <div className='flex gap-3 sm:gap-5 justify-center mt-2 sm:mt-0'>
            <ModeToggle/>   
            <UserButton/>
        </div>
    </div>
  )
}

export default WorkSpaceHeader;