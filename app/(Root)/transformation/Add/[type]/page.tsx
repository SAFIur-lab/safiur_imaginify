import Header from '@/components/shared/Header';
import React from 'react';
import { transformationTypes } from '@/constant';
import TransformationForm from '@/components/shared/TransformationForm';
import { useEffect, useState } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { useAuth } from '@clerk/nextjs';
import { getUserById } from '@/lib/actions/user.action';

interface PageProps {
  params: { type: keyof typeof transformationTypes };
}
const AddTransformationPageType = ({ params }: PageProps) => {
  const { type } = params;
  const router = useRouter() as NextRouter;
  interface User {
    _id: string;
    creditBalance: number;
    // Add other user properties if needed
  }
  
  const [user, setUser] = useState<User | null>(null);
  const [transformation, setTransformation] = useState<typeof transformationTypes[keyof typeof transformationTypes] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { userId } = await useAuth();

      if (!userId) {
        router.push('/sign-in');
        return;
      }

      const transformation = transformationTypes[type as TransformationTypeKey];

      if (!transformation) {
        router.push('/error'); // Redirect if the transformation type is invalid
        return;
      }

      const user = await getUserById(userId);
      setUser(user);
      setTransformation(transformation);
      fetchData();
    };

    fetchData();
  }, [type, router]);

  if (!user || !transformation) {
    return <div>Loading...</div>;
  }

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