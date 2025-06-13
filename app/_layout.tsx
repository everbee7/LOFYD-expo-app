import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import useAuthStore from '../store/authStore';
import Loading from '../components/common/Loading';

// Auth guard component
function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  const initialize = useAuthStore(state => state.initialize);
  const [isLoading, setIsLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Initialize auth store on first load
  useEffect(() => {
    const initAuth = async () => {
      await initialize();
      setIsLoading(false);
    };

    initAuth();
  }, [initialize]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    console.log('here', segments, inAuthGroup);
    if (!user && !inAuthGroup) {
      // User is not authenticated and not on auth screen, redirect to login
      router.replace('/(auth)/login');
    } else if (user && (inAuthGroup || segments.length as number === 0)) {
      // User is authenticated but on auth screen, redirect to home
      router.replace('/(tabs)/dashboard'); // Adjust this to your main screen
    }
  }, [user?.id, segments, isLoading, router]);

  if (isLoading) {
    return <Loading />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <StatusBar style="auto" />
      <AuthGuard>
        <Slot />
      </AuthGuard>
    </ThemeProvider>
  );
}