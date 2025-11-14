import React from 'react';
import { Image, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Paradero } from '@/services/paraderoService';

type Props = {
  paradero: Paradero;
  onPress: () => void;
};

export default function ParaderoMarker({ paradero, onPress }: Props) {
  return (
    <Marker
      coordinate={{
        latitude: paradero.coordenada_lat,
        longitude: paradero.coordenada_lng,
      }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
    >
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../assets/images/paradero.png')}
          style={{ width: 35, height: 35, resizeMode: 'contain' }}
        />
      </View>
    </Marker>
  );
}
