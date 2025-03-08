import Header from '@/components/shared/Header';
import React from 'react';
import { transformationTypes } from '@/constant';
import TransformationForm from '@/components/shared/TransformationForm';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/actions/user.action';
import { redirect } from 'next/navigation';

// Define the expected params type
interface PageProps {
  params: {
    type: TransformationTypeKey;
  };
}

const AddTransformationPageType = async ({ params }: PageProps) => {
  const { type } = params;
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const transformation = transformationTypes[type];
  const user = await getUserById(userId);

  return (
    <>
      <Header title={transformation.title} subtitle={transformation.subTitle} />
      <TransformationForm
        action="Add"
        userId={user._id}
        type={transformation.type as TransformationTypeKey}
        creditBalance={user.creditBalance}
      />
    </>
  );
};

export default AddTransformationPageType;
