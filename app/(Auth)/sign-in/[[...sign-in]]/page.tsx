import { SignIn } from '@clerk/nextjs'
import React from 'react'

const signInPage = () => {
  return (
   <SignIn routing="hash"  />
  )
}

export default signInPage
