import { CameraView, useCameraPermissions } from 'expo-camera';
import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [data, setData] = useState<string | null>(null);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    setData(data);
    
    setTimeout(() => {
      router.replace({
        pathname: '/(tabs)/inventory',
        params: { scanned: data },
      });
    }, 1000);
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
        <View className="flex-1">
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

          {/* Overlay for scanning area */}
          <View className="absolute inset-0 flex-col z-10 pointer-events-none">
            <View className="flex-1 bg-black/60" />
            <View className="flex-row h-72">
              <View className="flex-1 bg-black/60" />
              <View className="w-72 border border-white/20 bg-transparent rounded-lg relative">
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
