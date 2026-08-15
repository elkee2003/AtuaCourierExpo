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
      {/* =====================================================
          STATUS CARD
      ===================================================== */}
      <View style={styles.statusCard}>
        {/* STATUS INFORMATION */}
        <View style={styles.statusIdentity}>
          {/* Status indicator */}
          <View
            style={[
              styles.statusIndicator,
              isOnline
                ? styles.statusIndicatorOnline
                : styles.statusIndicatorOffline,
            ]}
          />

          {/* Status text */}
          <View style={styles.statusContent}>
            <View style={styles.statusTitleRow}>
              <Text style={styles.statusTitle}>
                {isOnline ? "You're Online" : "You're Offline"}
              </Text>

              <View
                style={[
                  styles.statusBadge,
                  isOnline
                    ? styles.statusBadgeOnline
                    : styles.statusBadgeOffline,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isOnline
                      ? styles.statusBadgeTextOnline
                      : styles.statusBadgeTextOffline,
                  ]}
                >
                  {isOnline ? "ACTIVE" : "OFFLINE"}
                </Text>
              </View>
            </View>

            <Text style={styles.statusSubtitle}>
              {isOnline
                ? "Receiving delivery requests nearby"
                : "Go online to start receiving orders"}
            </Text>
          </View>
        </View>

        {/* =================================================
            APPROVAL WARNING
        ================================================= */}
        {!isApproved && (
          <View style={styles.warningContainer}>
            <View style={styles.warningIconContainer}>
              <Text style={styles.warningIcon}>!</Text>
            </View>

            <Text style={styles.warningText}>
              Your account is under review. You'll be able to go online once
              your account has been approved.
            </Text>
          </View>
        )}

        {/* =================================================
            ONLINE / OFFLINE BUTTON
            Still INSIDE the black status card
        ================================================= */}
        <Pressable
          style={[
            styles.onlineButton,
            isOnline ? styles.onlineButtonOffline : styles.onlineButtonOnline,
            !isApproved && styles.disabledButton,
          ]}
          onPress={onToggleOnline}
          disabled={!isApproved}
        >
          <View
            style={[
              styles.onlineButtonIndicator,
              isOnline
                ? styles.onlineButtonIndicatorOffline
                : styles.onlineButtonIndicatorOnline,
            ]}
          />

          <Text style={styles.onlineButtonText}>
            {!isApproved
              ? "Approval Required"
              : isOnline
                ? "Go Offline"
                : "Go Online"}
          </Text>
        </Pressable>
      </View>

      {/* =====================================================
          LIVE JOB STATS
      ===================================================== */}
      {isOnline && (
        <View style={styles.statsCard}>
          {/* AVAILABLE / MAXI */}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>

            <Text style={styles.statLabel}>
              {isMaxi ? "Maxi Jobs" : "Available"}
            </Text>
          </View>

          <View style={styles.statDivider} />

          {/* NEARBY */}
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.nearby}</Text>

            <Text style={styles.statLabel}>Nearby</Text>
          </View>

          {/* MICRO / MOTO ONLY */}
          {!isMaxi && (
            <>
              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.batch}</Text>

                <Text style={styles.statLabel}>Batch</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.express}</Text>

                <Text style={styles.statLabel}>Express</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* =====================================================
          REFRESH JOBS
      ===================================================== */}
      {isOnline && (
        <Pressable style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshIcon}>↻</Text>

          <Text style={styles.refreshText}>Refresh Jobs</Text>
        </Pressable>
      )}
    </View>
  );
};

export default BottomContainer;
