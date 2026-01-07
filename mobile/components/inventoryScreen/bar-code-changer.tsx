import { View, Text, Pressable, useColorScheme, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { BottomSheetTextInput } from '@gorhom/bottom-sheet'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme'
import { router } from 'expo-router'

interface BarCodeChangerProps {
    barcodeInput: string;
    setBarcodeInput: (value: string) => void;
    isSaving: boolean;
    onSave: () => void;
    onCancel: () => void;
}

const BarCodeChanger = ({
    barcodeInput,
    setBarcodeInput,
    isSaving,
    onSave,
    onCancel
}: BarCodeChangerProps) => {
    const colorScheme = useColorScheme()
    const tintColor = Colors[colorScheme ?? 'light'].tint;
    const [isScanning, setIsScanning] = useState(false)

    const handleScanPress = () => {
        console.log("scanning")
    };

  return (
    <View className="gap-3 w-full">
        {isScanning ? <>
        
        </>: <>
            <View className='flex flex-row w-full gap-2'>
                <BottomSheetTextInput
                    className="bg-background border border-border rounded-lg px-4 py-1 text-lg text-foreground font-mono flex-1"
                    placeholder="Scan or enter barcode"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].icon}
                    value={barcodeInput}
                    onChangeText={setBarcodeInput}
                    autoFocus
                    keyboardType="numeric"
                    selectTextOnFocus
                />
                <Pressable 
                    className="w-11 h-11 rounded-xl items-center justify-center bg-secondary ml-auto" 
                    onPress={handleScanPress}
                    >
                    <Ionicons size={24} name="qr-code" color={tintColor} />
                </Pressable>
            </View>
            <View className="flex-row gap-3">
                <Pressable 
                    className={`flex-1 bg-primary py-3 rounded-xl items-center justify-center ${isSaving ? 'opacity-70' : ''}`}
                    onPress={onSave}
                    disabled={isSaving}
                >
                    {isSaving ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Text className="text-primary-foreground font-bold">Save Changes</Text>
                    )}
                </Pressable>
                <Pressable 
                    className="flex-1 bg-secondary py-3 rounded-xl items-center justify-center"
                    onPress={onCancel}
                    disabled={isSaving}
                >
                    <Text className="text-foreground font-semibold">Cancel</Text>
                </Pressable>
            </View>
        </>}
    </View>
  )
}

export default BarCodeChanger