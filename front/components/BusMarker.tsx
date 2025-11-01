import React from 'react';
import { Image, View } from 'react-native';
import { Marker } from 'react-native-maps';

type Props = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  onPress: () => void;
};

export default function BusMarker({ coordinate, onPress }: Props) {
  return (
    <Marker
      coordinate={coordinate}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      centerOffset={{ x: 0, y: 0 }}
    >
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <Image
          source={require('../assets/images/bus.png')}
          style={{ width: 45, height: 45, resizeMode: 'contain' }}
        />
      </View>
    </Marker>
  );
}