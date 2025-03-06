import React from 'react'
import Sidebar from "@/components/shared/sidebar";
import MobileNav from '@/components/shared/MobileNav';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="root">
      <Sidebar />
      <MobileNav />
        <div className='root-containe'>
            <div className='wrapper'>
                {children}

            </div>
        </div>
    </main>
  )
}

export default Layout