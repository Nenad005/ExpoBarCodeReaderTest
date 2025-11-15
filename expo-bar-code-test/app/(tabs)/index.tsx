  import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Welcome</ThemedText>
      </View>
      
      <View style={styles.content}>
        <ThemedText type="subtitle">Inventory Management System</ThemedText>
        <ThemedText style={styles.description}>
          Use the Inventory tab to manage your products and scan barcodes.
        </ThemedText>
        
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7' }]}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>0</ThemedText>
            <ThemedText style={styles.statLabel}>Total Items</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7' }]}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>0</ThemedText>
            <ThemedText style={styles.statLabel}>On Shelf</ThemedText>
          </View>
          <View style={[styles.statCard, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#F2F2F7' }]}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>0</ThemedText>
            <ThemedText style={styles.statLabel}>In Storage</ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
});