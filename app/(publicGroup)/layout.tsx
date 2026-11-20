import { Navbar } from '@/components/shared/navbar';
import { getUserProfile } from '@/service/getUserProfile'
import { connection } from 'next/server';


export default async function PublicGroupLayout({children} : {children : React.ReactNode}) {
    await connection();
    const user = await getUserProfile();

  return (
    <div>
        <Navbar user={user}/>
        {children}
    </div>
  )
}
