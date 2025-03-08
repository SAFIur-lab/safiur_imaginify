import Header from '@/components/shared/Header'
import React from 'react'
import { transformationTypes } from '@/constant'
import TransformationForm from '@/components/shared/TransformationForm'
import { auth } from '@clerk/nextjs/server'
import { getUserById } from '@/lib/actions/user.action'
import { redirect } from 'next/navigation'

const AddtransformationPageType = async ( {params: {type} }:SearchParamProps ) => { 
  const { userId } = await auth(); 
   const transformation= transformationTypes[type]
   if(!userId) redirect('/sign-in')
   const user = await getUserById(userId);
  return (
   <>
   <Header 
    title={transformation.title}
    subtitle={transformation.subTitle}
    />

    <TransformationForm 
          action="Add"
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
          />
   
   </>
   
  )
}

export default AddtransformationPageType
