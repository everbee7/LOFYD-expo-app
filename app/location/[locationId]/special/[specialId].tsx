import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function SpecialRedirectScreen() {
  const { locationId, specialId } = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {

    const params: any = { id: locationId, specialId: specialId };
    if (locationId && specialId) {
      router.replace({ pathname: "/location/[id]", params });
    }   
    
  }, [locationId,specialId]);

  return null; // Or a loading spinner while redirecting
}
