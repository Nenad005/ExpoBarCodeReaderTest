import React, { createContext, useContext, useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, Easing, SharedValue } from 'react-native-reanimated';

const AnimationContext = createContext<SharedValue<number> | null>(null);

export const AnimationProvider = ({ children }: { children: React.ReactNode }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.bezier(0, 0, 0.2, 1) }),
      -1,
      false
    );
  }, []);

  return (
    <AnimationContext.Provider value={progress}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useSyncedPulse = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useSyncedPulse must be used within an AnimationProvider');
  }
  return context;
};
