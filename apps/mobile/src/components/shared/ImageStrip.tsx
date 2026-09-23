import {
  View,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Text,
} from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const { width: SCREEN_W } = Dimensions.get('window');

type Props = {
  images: { url: string }[];
};

export function ImageStrip({ images }: Props) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  if (!images.length) return null;

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
      >
        {images.map((img, i) => (
          <TouchableOpacity
            key={img.url}
            onPress={() => setModalIndex(i)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: img.url }} style={styles.thumb} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lightbox modal */}
      <Modal
        visible={modalIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setModalIndex(null)}
      >
        <View style={styles.modalBg}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setModalIndex(null)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>

          {modalIndex !== null && (
            <>
              <Image
                source={{ uri: images[modalIndex].url }}
                style={styles.fullImg}
                resizeMode="contain"
              />
              <Text style={styles.counter}>
                {modalIndex + 1} / {images.length}
              </Text>

              {/* Prev / Next */}
              <View style={styles.navRow}>
                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    modalIndex === 0 && styles.navBtnDisabled,
                  ]}
                  onPress={() =>
                    setModalIndex((i) =>
                      i !== null ? Math.max(0, i - 1) : 0
                    )
                  }
                  disabled={modalIndex === 0}
                >
                  <Ionicons
                    name="chevron-back"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navBtn,
                    modalIndex === images.length - 1 &&
                      styles.navBtnDisabled,
                  ]}
                  onPress={() =>
                    setModalIndex((i) =>
                      i !== null
                        ? Math.min(images.length - 1, i + 1)
                        : 0
                    )
                  }
                  disabled={modalIndex === images.length - 1}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  strip: {
    paddingHorizontal: 20,
    gap: 10,
  },
  thumb: {
    width: 120,
    height: 120,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 56,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImg: {
    width: SCREEN_W,
    height: SCREEN_W,
  },
  counter: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 16,
  },
  navRow: {
    flexDirection: 'row',
    gap: 40,
    marginTop: 24,
  },
  navBtn: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
  },
  navBtnDisabled: {
    opacity: 0.2,
  },
});