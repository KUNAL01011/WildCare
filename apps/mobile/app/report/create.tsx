import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../src/constants/colors";
import { Button } from "../../src/components/ui/Button";
import { Card } from "../../src/components/ui/Card";
import {
  checkCameraPermission,
  checkLocationPermission,
  showPermissionBlockedAlert,
} from "../../src/utils/permissions";
import { useLocation } from "../../src/hooks/useLocation";
import { useCreateReport } from "../../src/hooks/useCreateReport";

export default function CreateReportScreen() {
  const params = useLocalSearchParams<{ photoUris?: string }>();

  // Parse photos passed from camera screen
  const [photoUris, setPhotoUris] = useState<string[]>(() => {
    if (params.photoUris) {
      try {
        return JSON.parse(params.photoUris);
      } catch {
        return [];
      }
    }
    return [];
  });

  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const {
    location,
    isLoading: locationLoading,
    captureLocation,
  } = useLocation();
  const { upload, isUploading } = useCreateReport();

  // ── On mount: check permissions ───────────────────────
  useEffect(() => {
    (async () => {
      const cam = await checkCameraPermission();
      const loc = await checkLocationPermission();

      if (cam === "blocked") {
        showPermissionBlockedAlert("camera");
      }
      if (loc === "blocked") {
        showPermissionBlockedAlert("location");
      }

      setPermissionsChecked(true);

      // If no photos yet, go straight to camera
      if (photoUris.length === 0 && cam === "granted") {
        router.push("/report/camera");
      }
    })();
  }, []);

  // ── Capture location when photos are ready ────────────
  useEffect(() => {
    if (photoUris.length > 0 && !location && !locationLoading) {
      captureLocation();
    }
  }, [photoUris.length]);

  // ── Remove a photo ────────────────────────────────────
  const removePhoto = useCallback((uri: string) => {
    setPhotoUris(prev => prev.filter(u => u !== uri));
  }, []);

  // ── Submit ────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (photoUris.length === 0) {
      Alert.alert("Photos required", "Please add at least one photo.");
      return;
    }

    let coords = location;
    if (!coords) {
      coords = await captureLocation();
      if (!coords) {
        Alert.alert(
          "Location required",
          "WildCare needs your location to create a report."
        );
        return;
      }
    }

    try {
      const report = await upload({
        photoUris,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      // Navigate to review screen
      router.replace(`/report/analyzing/${report.reportId}`);
    } catch (err: any) {
      Alert.alert(
        "Upload failed",
        err?.message ?? "Could not create report. Please try again."
      );
    }
  }, [photoUris, location]);

  if (!permissionsChecked) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Checking permissions…</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Section: Photos ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Incident Photos</Text>
            <Text style={styles.sectionSub}>{photoUris.length} / 3 added</Text>
          </View>

          {/* Photo grid */}
          {photoUris.length > 0 ? (
            <View style={styles.photoGrid}>
              {photoUris.map(uri => (
                <View key={uri} style={styles.photoCell}>
                  <Image source={{ uri }} style={styles.photo} />
                  <TouchableOpacity
                    style={styles.photoRemove}
                    onPress={() => removePhoto(uri)}
                  >
                    <Ionicons name="close-circle" size={22} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add more slot */}
              {photoUris.length < 3 && (
                <TouchableOpacity
                  style={styles.addSlot}
                  onPress={() => router.push("/report/camera")}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="camera-outline"
                    size={28}
                    color={COLORS.primaryMuted}
                  />
                  <Text style={styles.addSlotText}>Add more</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.cameraPrompt}
              onPress={() => router.push("/report/camera")}
              activeOpacity={0.85}
            >
              <Ionicons
                name="camera-outline"
                size={40}
                color={COLORS.primaryMuted}
              />
              <Text style={styles.cameraPromptTitle}>Take Incident Photos</Text>
              <Text style={styles.cameraPromptSub}>
                At least one photo is required
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Section: Location ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Incident Location</Text>

          <Card style={styles.locationCard}>
            <View style={styles.locationRow}>
              <View style={styles.locationIcon}>
                <Ionicons
                  name="location"
                  size={20}
                  color={location ? COLORS.primary : COLORS.textMuted}
                />
              </View>

              <View style={styles.locationContent}>
                {locationLoading ? (
                  <View style={styles.locationLoadingRow}>
                    <ActivityIndicator size="small" color={COLORS.primary} />
                    <Text style={styles.locationLoadingText}>
                      Getting GPS location…
                    </Text>
                  </View>
                ) : location ? (
                  <>
                    <Text style={styles.locationFound}>Location captured</Text>
                    <Text style={styles.locationCoords}>
                      {location.latitude.toFixed(5)},{" "}
                      {location.longitude.toFixed(5)}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.locationMissing}>
                    Location not yet captured
                  </Text>
                )}
              </View>

              {!locationLoading && (
                <TouchableOpacity
                  onPress={captureLocation}
                  style={styles.retryBtn}
                >
                  <Ionicons
                    name="refresh-outline"
                    size={20}
                    color={COLORS.primaryMuted}
                  />
                </TouchableOpacity>
              )}
            </View>
          </Card>
        </View>

        {/* ── Section: What happens next ── */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>What happens next?</Text>
          <View style={styles.infoSteps}>
            {[
              { icon: "🤖", text: "AI analyzes your photos" },
              { icon: "✏️", text: "You review and confirm details" },
              { icon: "📞", text: "Contact a nearby responder" },
            ].map(({ icon, text }) => (
              <View key={text} style={styles.infoStep}>
                <Text style={styles.infoStepIcon}>{icon}</Text>
                <Text style={styles.infoStepText}>{text}</Text>
              </View>
            ))}
          </View>
        </Card>
      </ScrollView>

      {/* ── Fixed footer ── */}
      <View style={styles.footer}>
        <Button
          label={
            isUploading
              ? "Uploading…"
              : photoUris.length === 0
                ? "Add photos to continue"
                : "Submit for AI Analysis"
          }
          onPress={handleSubmit}
          loading={isUploading}
          disabled={photoUris.length === 0}
          fullWidth
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingBottom: 16,
    gap: 24,
  },

  // Section
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  sectionSub: {
    fontSize: 13,
    color: COLORS.textMuted,
  },

  // Camera prompt
  cameraPrompt: {
    height: 160,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    gap: 8,
  },
  cameraPromptTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  cameraPromptSub: {
    fontSize: 12,
    color: COLORS.textMuted,
  },

  // Photo grid
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  photoCell: {
    width: 100,
    height: 100,
    borderRadius: 10,
    overflow: "visible",
    position: "relative",
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 10,
    resizeMode: "cover",
  },
  photoRemove: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0,0,0,0.65)",
    borderRadius: 11,
  },
  addSlot: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceAlt,
    gap: 4,
  },
  addSlotText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  // Location card
  locationCard: {
    padding: 14,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  locationContent: {
    flex: 1,
    gap: 2,
  },
  locationLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationLoadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  locationFound: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  locationCoords: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontFamily: "monospace",
  },
  locationMissing: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  retryBtn: {
    padding: 6,
  },

  // Info card
  infoCard: {
    gap: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  infoSteps: {
    gap: 10,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoStepIcon: {
    fontSize: 20,
    width: 28,
    textAlign: "center",
  },
  infoStepText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    flex: 1,
  },

  // Footer
  footer: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
});
