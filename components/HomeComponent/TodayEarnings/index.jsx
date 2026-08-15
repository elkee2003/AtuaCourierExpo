import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

import styles from "./styles";

/*
==========================================================
TODAY'S EARNINGS
==========================================================

This component is responsible only for displaying
Today's Earnings.

The actual calculation is handled by HomeMain.

HomeMain passes:

- earnings
- deliveryCount
- loading

No `todayEarnings` field is required in the Courier
schema.

Data flow:

HomeMain
   │
   ├── calculates today's earnings
   ├── calculates today's delivery count
   │
   ▼
TodayEarnings
   │
   ├── displays earnings
   ├── displays delivery count
   └── navigates to Wallet
==========================================================
*/

const TodayEarnings = ({
  earnings = 0,
  deliveryCount = 0,
  loading = false,
}) => {
  /*
  ========================================================
  FORMAT EARNINGS
  ========================================================
  */

  const formattedEarnings = Number(earnings || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  /*
  ========================================================
  DELIVERY LABEL
  ========================================================
  */

  const deliveryLabel =
    deliveryCount === 1
      ? "1 delivery today"
      : `${deliveryCount} deliveries today`;

  /*
  ========================================================
  OPEN WALLET
  ========================================================
  */

  const handlePress = () => {
    router.push("/wallet");
  };

  /*
  ========================================================
  LOADING STATE
  ========================================================
  */

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.leftSection}>
            <Text style={styles.label}>Today's Earnings</Text>

            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#111827" />

              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  /*
  ========================================================
  MAIN CARD
  ========================================================
  */

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.82}
        onPress={handlePress}
      >
        {/* =================================================
            LEFT SECTION
        ================================================= */}

        <View style={styles.leftSection}>
          <Text style={styles.label}>Today's Earnings</Text>

          <View style={styles.amountRow}>
            <Text style={styles.currency}>₦</Text>

            <Text style={styles.amount} numberOfLines={1} adjustsFontSizeToFit>
              {formattedEarnings}
            </Text>
          </View>

          <Text style={styles.meta}>{deliveryLabel}</Text>
        </View>

        {/* =================================================
            RIGHT SECTION
        ================================================= */}

        <View style={styles.rightSection}>
          <View style={styles.arrowCircle}>
            <Ionicons name="chevron-forward" size={17} color="#111827" />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default TodayEarnings;
