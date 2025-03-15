import { SignUp} from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='flex items-center justify-center h-screen bg-gradient-to-r from-purple-600 to-purple-900'>
            <SignUp />  
        </div>
    )
}