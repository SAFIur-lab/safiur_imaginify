import Header from '@/components/shared/Header'
import React from 'react'
import { transformationTypes } from '@/constant'
import TransformationForm from '@/components/shared/TransformationForm'

const AddtransformationPageType = ( {params: {type} }:SearchParamProps ) => { 

   const transformation= transformationTypes[type]
  return (
   <>
   <Header 
    title={transformation.title}
    subtitle={transformation.subTitle}
    />

    <TransformationForm />
   
   </>
   
  )
}

export default AddtransformationPageType
