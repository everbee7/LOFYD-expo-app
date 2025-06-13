import React from 'react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <ThemeProvider>
        <StatusBar style="auto" />
        <Slot />
      </ThemeProvider>
    </>
  );
}