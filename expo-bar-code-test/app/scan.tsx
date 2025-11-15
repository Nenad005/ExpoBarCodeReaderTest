import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, router } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const colorScheme = useColorScheme();

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setData(data);
    
    // Navigate back to inventory with scanned data
    setTimeout(() => {
      router.replace({
        pathname: '/(tabs)/inventory',
        params: { scanned: data },
      });
    }, 1000);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Scan Barcode' }} />

      {!permission ? (
        <ThemedText>Requesting camera permission...</ThemedText>
      ) : !permission.granted ? (
        <View style={styles.infoContainer}>
          <ThemedText>Camera permission is required to scan barcodes.</ThemedText>
          <TouchableOpacity
            onPress={requestPermission}
            style={[styles.button, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff' }]}
          >
            <ThemedText type="defaultSemiBold">Grant permission</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.scannerContainer}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: [
                'qr',
                'ean13',
                'ean8',
                'code128',
                'code39',
                'code93',
                'codabar',
                'upc_a',
                'upc_e',
                'pdf417',
                'aztec',
                'datamatrix',
                'itf14',
              ],
            }}
          />

          <View style={styles.overlay} pointerEvents="none">
            <View style={styles.overlayTextContainer}>
              <ThemedText lightColor="#fff" darkColor="#fff" style={styles.overlayText}>
                {scanned ? `Scanned: ${data}` : 'Point the camera at a barcode'}
              </ThemedText>
            </View>
          </View>

          {scanned && (
            <View style={styles.controls}>
              <TouchableOpacity
                onPress={() => {
                  setScanned(false);
                  setData(null);
                }}
                style={[styles.button, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff' }]}
              >
                <ThemedText type="defaultSemiBold">Scan again</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scannerContainer: {
    flex: 1,
  },
  infoContainer: {
    padding: 16,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 32,
    alignItems: 'center',
  },
  overlayTextContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  overlayText: {
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
