import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { Link } from "expo-router";
import { useState } from 'react';
import { Button, Platform, StyleSheet } from 'react-native';
import AppModal from '../../components/Modals/AppModal';
import ModalBusInfo from '../../components/Modals/ModalBusInfo';

export default function HomeScreen() {
  const [open, setOpen] = useState(false);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Prueba</ThemedText>
        <HelloWave />
      </ThemedView>
      
      {/* 
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Historial de Viajes</ThemedText>
        <HistorialViajes />
      </ThemedView>
       */}
    <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
    </ThemedView>
    {/* <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Ir a Cliente</ThemedText>
      {/*<Link href="/(cliente)/MenuPrincipal/ClienteMenuPrincipal">
        <ThemedText type="defaultSemiBold" style={{ color: 'blue' }}>
          Ir al menú principal del cliente
        </ThemedText>
      </Link>
    </ThemedView>*/}
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Ver forms de alerta de conductor</ThemedText>
      <Link href="/(conductor)/EnviarReporteDesvio/EnviarReporteDesvio">
        <ThemedText type="defaultSemiBold" style={{ color: 'blue' }}>
          Forms de desvío
        </ThemedText>
      </Link>
    </ThemedView>
      <Button title='Show Modal' onPress={ () => setOpen(true)}/>
      <AppModal visible={open} onClose={() => setOpen(false)}>
        <ModalBusInfo onClose={() => setOpen(false)} />
      </AppModal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
