import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/ui/toggle';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import React from 'react'

const WorkSpaceHeader = ({fileName}) => {
  return (
      <div className='flex justify-between p-[1.2rem] shadow-md dark:bg-black dark:text-white dark:shadow-lg dark:shadow-gray-800'>
        <div>
            <h1 className='text-4xl font-bold'>
            <Link href="/dashboard">📒 NoteAura</Link>
            </h1>
        </div>
        <div className="flex items-center">
          <h2 className='font-bold'>{fileName}</h2>
        </div>
        
        <div className='flex gap-5 justify-center'>
            <ModeToggle/>   
            <UserButton/>
        </div>
    </div>
  )
}

export default WorkSpaceHeader;