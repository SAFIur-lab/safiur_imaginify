import Header from '@/components/shared/Header'
import React from 'react'
import { transformationTypes } from '@/constant'

const AddtransformationPageType = ( {params: {type} }:SearchParamProps ) => { 

   const transformation= transformationTypes[type]
  return (
   <Header 
    title={transformation.title}
    subtitle={transformation.subTitle}
    />
  )
}

export default AddtransformationPageType
