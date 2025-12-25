import { Platform } from "react-native";
import * as SecureStore from 'expo-secure-store';

// Helper functions to handle web vs native storag
export function getStorageItem (key: string): string | null {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  }
  return SecureStore.getItem(key);
};

export function setStorageItem (key: string, value: string): void {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
  } else {
    SecureStore.setItem(key, value);
  }
};