import { SignUp } from '@clerk/nextjs'
import React from 'react'

const signUpPage = () => {
  return (
    <SignUp routing="hash"  />  
  )
}

export default signUpPage
