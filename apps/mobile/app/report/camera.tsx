import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native';
import { useState, useRef, useCallback } from 'react';
import { CameraView, CameraType } from 'expo-camera';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const MAX_PHOTOS = 3;

export type CapturedPhoto = {
  uri: string;
  width: number;
  height: number;
};

export default function CameraScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('auto');

  // ── Capture ──────────────────────────────────────────
  const capture = useCallback(async () => {
    if (!cameraRef.current) return;
    if (photos.length >= MAX_PHOTOS) {
      Alert.alert(
        'Maximum photos reached',
        `You can add up to ${MAX_PHOTOS} photos per report.`
      );
      return;
    }

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        skipProcessing: false,
      });

      if (photo) {
        setPhotos((prev) => [
          ...prev,
          { uri: photo.uri, width: photo.width, height: photo.height },
        ]);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  }, [photos.length]);

  // ── Remove photo ─────────────────────────────────────
  const removePhoto = useCallback((uri: string) => {
    setPhotos((prev) => prev.filter((p) => p.uri !== uri));
  }, []);

  // ── Flip camera ──────────────────────────────────────
  const flipCamera = useCallback(() => {
    setFacing((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  // ── Toggle flash ─────────────────────────────────────
  const cycleFlash = useCallback(() => {
    setFlash((prev) =>
      prev === 'off' ? 'on' : prev === 'on' ? 'auto' : 'off'
    );
  }, []);

  const flashIcon =
    flash === 'on'
      ? 'flash'
      : flash === 'auto'
      ? 'flash-outline'
      : 'flash-off-outline';

  // ── Continue ─────────────────────────────────────────
  const handleContinue = useCallback(() => {
    if (photos.length === 0) {
      Alert.alert(
        'No photos',
        'Please capture at least one photo of the incident.'
      );
      return;
    }

    // Pass photos to create screen via router params
    // We store URIs as JSON string (router params are strings)
    router.replace({
      pathname: '/report/create',
      params: { photoUris: JSON.stringify(photos.map((p) => p.uri)) },
    });
  }, [photos]);

  // ── Close ─────────────────────────────────────────────
  const handleClose = useCallback(() => {
    if (photos.length > 0) {
      Alert.alert(
        'Discard photos?',
        'Going back will discard your captured photos.',
        [
          { text: 'Keep shooting', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  }, [photos.length]);

  return (
    <View style={styles.container}>
      {/* ── Camera preview ── */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash}
      >
        {/* Top controls */}
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={handleClose}
          >
            <Ionicons name="close" size={26} color="#fff" />
          </TouchableOpacity>

          <View style={styles.topCenter}>
            <Text style={styles.photoCount}>
              {photos.length} / {MAX_PHOTOS}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={cycleFlash}
          >
            <Ionicons name={flashIcon} size={24} color="#fff" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Bottom controls */}
        <View style={styles.bottomBar}>
          {/* Photo strip */}
          {photos.length > 0 && (
            <FlatList
              data={photos}
              keyExtractor={(item) => item.uri}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.strip}
              renderItem={({ item }) => (
                <View style={styles.thumbWrapper}>
                  <Image
                    source={{ uri: item.uri }}
                    style={styles.thumb}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removePhoto(item.uri)}
                    hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
                  >
                    <Ionicons
                      name="close-circle"
                      size={20}
                      color="#fff"
                    />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}

          {/* Shutter row */}
          <View style={styles.shutterRow}>
            {/* Flip */}
            <TouchableOpacity
              style={styles.sideBtn}
              onPress={flipCamera}
            >
              <Ionicons
                name="camera-reverse-outline"
                size={28}
                color="#fff"
              />
            </TouchableOpacity>

            {/* Shutter */}
            <TouchableOpacity
              style={[
                styles.shutter,
                (isCapturing ||
                  photos.length >= MAX_PHOTOS) &&
                  styles.shutterDisabled,
              ]}
              onPress={capture}
              disabled={isCapturing || photos.length >= MAX_PHOTOS}
              activeOpacity={0.8}
            >
              <View style={styles.shutterInner} />
            </TouchableOpacity>

            {/* Continue */}
            <TouchableOpacity
              style={[
                styles.sideBtn,
                photos.length === 0 && styles.sideBtnDisabled,
              ]}
              onPress={handleContinue}
              disabled={photos.length === 0}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={28}
                color={
                  photos.length > 0 ? COLORS.accent : 'rgba(255,255,255,0.3)'
                }
              />
            </TouchableOpacity>
          </View>

          {/* Hint */}
          <Text style={styles.hint}>
            {photos.length === 0
              ? 'Capture at least one photo of the animal'
              : photos.length < MAX_PHOTOS
              ? `Add more photos or tap ✓ to continue`
              : 'Maximum photos captured — tap ✓ to continue'}
          </Text>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  iconBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    alignItems: 'center',
  },
  photoCount: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  // Bottom bar
  bottomBar: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingTop: 12,
    paddingBottom: 40,
    gap: 16,
  },

  // Strip
  strip: {
    paddingHorizontal: 16,
    gap: 10,
  },
  thumbWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.accent,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
  },

  // Shutter row
  shutterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  sideBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sideBtnDisabled: {
    opacity: 0.3,
  },
  shutter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterDisabled: {
    opacity: 0.4,
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
  },

  // Hint
  hint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});