import { router, useLocalSearchParams } from 'expo-router';
import ModalBusInfo, { ModalBackdrop } from '../../components/Modals/ModalBusInfo';

export default function BusInfoScreen() {
  const { title = 'Bus', stop = 'Paradero B', capacity = '11', max = '20' } =
    useLocalSearchParams<{ title?: string; stop?: string; capacity?: string; max?: string }>();

  const close = () => router.back();

  return (
    <ModalBackdrop onPressBackdrop={close}>
      <ModalBusInfo
        title={String(title)}
        stop={String(stop)}
        capacity={Number(capacity)}
        max={Number(max)}
        onClose={close}
      />
    </ModalBackdrop>
  );
}