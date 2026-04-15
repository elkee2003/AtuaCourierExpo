import React from "react";
import { Pressable, Text, View } from "react-native";
import styles from "./styles";

const BottomContainer = ({
  isOnline,
  isApproved,
  stats,
  onRefresh,
  onToggleOnline,
  transportationType,
}) => {
  const isMaxi = transportationType === "MAXI";

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

            {!isApproved && (
              <Text style={styles.warningText}>
                Your account is under review. You'll be able to go online once
                approved.
              </Text>
            )}
          </View>
        </View>

        <Pressable
          style={[
            isOnline ? styles.endBtn : styles.goBtn,
            !isApproved && styles.disabledBtn,
          ]}
          onPress={onToggleOnline}
          disabled={!isApproved}
        >
          <Text style={styles.btnText}>
            {!isApproved
              ? "Approval Required"
              : isOnline
                ? "Go Offline"
                : "Go Online"}
          </Text>
        </Pressable>
      </View>

      {/* 🔥 LIVE STATS */}
      {isOnline && (
        <View style={styles.statsCard}>
          {/* TOTAL */}
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>
              {isMaxi ? "Maxi Jobs" : "Available Jobs"}
            </Text>
          </View>

          <View style={styles.statDivider} />

          {/* NEARBY */}
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.nearby}</Text>
            <Text style={styles.statLabel}>Nearby Jobs</Text>
          </View>

          {/* 🔹 ONLY FOR MICRO / MOTO */}
          {!isMaxi && (
            <>
              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.batch}</Text>
                <Text style={styles.statLabel}>Batch Jobs</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{stats.express}</Text>
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
