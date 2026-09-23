import { View, Text } from "react-native";
import { COLORS } from "../../../src/constants/colors";

export default function TrackingScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <Text style={{ fontSize: 18, color: COLORS.textPrimary }}>
        Response Tracking — Step 8
      </Text>
    </View>
  );
}
