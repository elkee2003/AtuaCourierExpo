// BottomContainer.tsx
import React from "react";
import { Pressable, Text, View } from "react-native";
import styles from "./styles";

const BottomContainer = ({
  isOnline,
  orders,
  stats,
  onRefresh,
  onToggleOnline,
  transportationType,
}) => {
  const batchJobs = orders.filter(
    (o) =>
      o.transportationType === "MICRO_BATCH" ||
      o.transportationType === "MOTO_BATCH",
  );

  const expressJobs = orders.filter(
    (o) =>
      o.transportationType === "MICRO_EXPRESS" ||
      o.transportationType === "MOTO_EXPRESS",
  );

  return (
    <View style={styles.wrapper}>
      {/* STATUS CARD */}
      <View style={styles.statusCard}>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              isOnline ? styles.dotOnline : styles.dotOffline,
            ]}
          />

          <View>
            <Text style={styles.statusTitle}>
              {isOnline ? "You're Online" : "You're Offline"}
            </Text>
            <Text style={styles.statusSubtitle}>
              {isOnline
                ? "Receiving delivery requests nearby"
                : "Go online to start receiving orders"}
            </Text>
          </View>
        </View>

        <Pressable
          style={isOnline ? styles.endBtn : styles.goBtn}
          onPress={onToggleOnline}
        >
          <Text style={styles.btnText}>
            {isOnline ? "Go Offline" : "Go Online"}
          </Text>
        </Pressable>
      </View>

      {/* LIVE STATS */}
      {isOnline && (
        <View style={styles.statsCard}>
          {/* TOTAL */}
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Available Jobs</Text>
          </View>

          <View style={styles.statDivider} />

          {/* NEARBY (for ALL types including MAXI) */}
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.nearby} </Text>
            <Text style={styles.statLabel}>Nearby Jobs</Text>
          </View>

          {/* ✅ ONLY show for NON-MAXI */}
          {transportationType !== "MAXI" && (
            <>
              <View style={styles.statDivider} />

              {/* BATCH */}
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{batchJobs.length}</Text>
                <Text style={styles.statLabel}>Batch Jobs</Text>
              </View>

              <View style={styles.statDivider} />

              {/* EXPRESS */}
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{expressJobs.length}</Text>
                <Text style={styles.statLabel}>Express Jobs</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* ACTIONS */}
      {isOnline && (
        <View style={styles.actionsRow}>
          <Pressable style={styles.refreshBtn} onPress={onRefresh}>
            <Text style={styles.refreshText}>Refresh Jobs</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default BottomContainer;
