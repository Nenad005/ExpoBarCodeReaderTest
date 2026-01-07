import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import { Stack, router } from 'expo-router';
import React, { useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, View, LayoutChangeEvent, Dimensions } from 'react-native';

const SCAN_SIZE = 288; // 18rem (w-72) equivalent

const barcodeScannerSettings = {
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
};

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<string | null>(null);
  const [layout, setLayout] = useState<{ width: number; height: number } | null>(null);
  const isScanning = useRef(false);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  const handleBarCodeScanned = ({ data, bounds, cornerPoints }: BarcodeScanningResult) => {
    if (isScanning.current || !layout) return;

    const { width: layoutWidth, height: layoutHeight } = layout;
    
    // Calculate the scanning window bounds (centered)
    const minX = (layoutWidth - SCAN_SIZE) / 2;
    const maxX = minX + SCAN_SIZE;
    const minY = (layoutHeight - SCAN_SIZE) / 2;
    const maxY = minY + SCAN_SIZE;

    // Use cornerPoints if available, otherwise use bounds
    let barcodeX: number;
    let barcodeY: number;

    if (cornerPoints && cornerPoints.length >= 4) {
      // Calculate center from corner points (these are in view coordinates)
      const sumX = cornerPoints.reduce((sum, p) => sum + p.x, 0);
      const sumY = cornerPoints.reduce((sum, p) => sum + p.y, 0);
      barcodeX = sumX / cornerPoints.length;
      barcodeY = sumY / cornerPoints.length;
    } else {
      // Fallback to bounds (may need scaling)
      const barcodeWidth = bounds.size.width;
      const barcodeHeight = bounds.size.height;
      barcodeX = bounds.origin.x + barcodeWidth / 2;
      barcodeY = bounds.origin.y + barcodeHeight / 2;
    }

    // Check if the barcode center is within the scanning window
    const isInside = 
      barcodeX >= minX && 
      barcodeX <= maxX && 
      barcodeY >= minY && 
      barcodeY <= maxY;

    if (!isInside) return;

    isScanning.current = true;
    setScanned(true);
    setData(data);
    
    setTimeout(() => {
      router.replace({
        pathname: '/(tabs)/inventory',
        params: { scanned: data },
      });
    }, 200);
  };

  return (
    <View className="flex-1 bg-transparent">
      <Stack.Screen options={{ title: 'Scan Barcode' }} />

      {!permission ? (
        <Text className="text-foreground p-4">Requesting camera permission...</Text>
      ) : !permission.granted ? (
        <View className="p-4">
          <Text className="text-foreground">Camera permission is required to scan barcodes.</Text>
          <Pressable
            onPress={requestPermission}
            className="mt-4 py-3 px-6 rounded-lg items-center bg-card shadow-md"
          >
            <Text className="font-semibold text-foreground">Grant permission</Text>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1" onLayout={onLayout}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={barcodeScannerSettings as any}
          />

          {/* Overlay for scanning area */}
          <View className="absolute inset-0 flex-col z-10 pointer-events-none">
            <View className="flex-1 bg-black/60" />
            <View className="flex-row" style={{ height: SCAN_SIZE }}>
              <View className="flex-1 bg-black/60" />
              <View 
                className="border border-white/20 bg-transparent rounded-lg relative"
                style={{ width: SCAN_SIZE, height: SCAN_SIZE }}
              >
                 <View className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-emerald-500 -ml-[2px] -mt-[2px] rounded-tl-sm" />
                 <View className="absolute top-0 right-0 w-8 h-8 border-r-4 border-t-4 border-emerald-500 -mr-[2px] -mt-[2px] rounded-tr-sm" />
                 <View className="absolute bottom-0 left-0 w-8 h-8 border-l-4 border-b-4 border-emerald-500 -ml-[2px] -mb-[2px] rounded-bl-sm" />
                 <View className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-emerald-500 -mr-[2px] -mb-[2px] rounded-br-sm" />
              </View>
              <View className="flex-1 bg-black/60" />
            </View>
            <View className="flex-1 bg-black/60" />
          </View>

          <View className="absolute left-0 right-0 top-12 items-center z-20" pointerEvents="none">
            <View className="bg-black/70 py-2.5 px-4 rounded-lg">
              <Text className="text-white text-base font-semibold">
                {scanned ? `Scanned: ${data}` : 'Point the camera at a barcode'}
              </Text>
            </View>
          </View>

          {scanned && (
            <View className="absolute bottom-10 left-0 right-0 items-center z-20">
              <Pressable
                onPress={() => {
                  setScanned(false);
                  setData(null);
                }}
                className="py-3 px-6 rounded-lg items-center bg-card shadow-md"
              >
                <Text className="font-semibold text-foreground">Scan again</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}
    </View>
  );
}
