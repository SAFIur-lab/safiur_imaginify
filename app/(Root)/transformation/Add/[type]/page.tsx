import Header from '@/components/shared/Header';
import React from 'react';
import { transformationTypes } from '@/constant';
import TransformationForm from '@/components/shared/TransformationForm';
import { auth } from '@clerk/nextjs/server';
import { getUserById } from '@/lib/actions/user.action';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ type: string }>; // Update to reflect that params is a Promise
}

const AddTransformationPageType = async ({ params }: PageProps) => {
  const { type } = await params; // Await the params to resolve
  const { userId } = await auth();

  if (!userId) redirect('/sign-in');

  const transformation = transformationTypes[type as TransformationTypeKey];

  if (!transformation) {
    redirect('/error'); // Redirect if the transformation type is invalid
  }

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