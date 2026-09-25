import React from "react";
import { Pressable, Text, View } from "react-native";
import styles from "./styles";

const BottomContainer = ({
  isOnline,
  isApproved,
  isBlocked,
  stats,
  onRefresh,
  onToggleOnline,
  transportationType,
}) => {
  // ============================================================
  // TRANSPORTATION TYPE
  // ============================================================
  //
  // MAXI continues to use the existing Maxi job / bidding flow.
  //
  // MICRO and MOTO use the marketplace flow.
  //
  // The parent Courier Home is responsible for filtering:
  //
  // MICRO -> 5 km from pickup
  // MOTO  -> 10 km from pickup
  //
  // BottomContainer does not perform radius calculations.
  // ============================================================

  const isMaxi = transportationType === "MAXI";

  const isMicro =
    transportationType === "MICRO" ||
    transportationType === "MICRO_EXPRESS" ||
    transportationType === "MICRO_BATCH";

  const isMoto =
    transportationType === "MOTO" ||
    transportationType === "MOTO_EXPRESS" ||
    transportationType === "MOTO_BATCH";

  const isMicroOrMoto = isMicro || isMoto;

  /*
  ============================================================
  STATUS
  ============================================================
  */

  const statusTitle = isBlocked
    ? "Account Blocked"
    : isOnline
      ? "You're Online"
      : "You're Offline";

  const statusBadge = isBlocked ? "BLOCKED" : isOnline ? "ACTIVE" : "OFFLINE";

  const statusSubtitle = isBlocked
    ? "Your account has been blocked. You cannot receive delivery requests."
    : isOnline
      ? isMaxi
        ? "Receiving Maxi jobs nearby"
        : "Marketplace deliveries are visible nearby"
      : "Go online to view available deliveries";

  /*
  ============================================================
  BUTTON STATE
  ============================================================
  */

  const buttonDisabled = !isApproved || isBlocked;

  const buttonText = isBlocked
    ? "Account Blocked"
    : !isApproved
      ? "Approval Required"
      : isOnline
        ? "Go Offline"
        : "Go Online";

  /*
  ============================================================
  RENDER
  ============================================================
  */

  return (
    <View style={styles.wrapper}>
      {/* =====================================================
          STATUS CARD
      ===================================================== */}

      <View style={styles.statusCard}>
        {/* =================================================
            STATUS INFORMATION
        ================================================= */}

        <View style={styles.statusIdentity}>
          {/* STATUS INDICATOR */}

          <View
            style={[
              styles.statusIndicator,
              isBlocked
                ? styles.statusIndicatorBlocked
                : isOnline
                  ? styles.statusIndicatorOnline
                  : styles.statusIndicatorOffline,
            ]}
          />

          {/* STATUS CONTENT */}

          <View style={styles.statusContent}>
            <View style={styles.statusTitleRow}>
              {/* TITLE */}

              <Text style={styles.statusTitle}>{statusTitle}</Text>

              {/* BADGE */}

              <View
                style={[
                  styles.statusBadge,
                  isBlocked
                    ? styles.statusBadgeBlocked
                    : isOnline
                      ? styles.statusBadgeOnline
                      : styles.statusBadgeOffline,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isBlocked
                      ? styles.statusBadgeTextBlocked
                      : isOnline
                        ? styles.statusBadgeTextOnline
                        : styles.statusBadgeTextOffline,
                  ]}
                >
                  {statusBadge}
                </Text>
              </View>
            </View>

            {/* SUBTITLE */}

            <Text style={styles.statusSubtitle}>{statusSubtitle}</Text>
          </View>
        </View>

        {/* =================================================
            BLOCKED WARNING
        ================================================= */}

        {isBlocked && (
          <View style={styles.warningContainer}>
            <View style={styles.warningIconContainer}>
              <Text style={styles.warningIcon}>!</Text>
            </View>

            <Text style={styles.warningText}>
              Your account has been blocked. Please contact Atua support for
              assistance.
            </Text>
          </View>
        )}

        {/* =================================================
            APPROVAL WARNING
        ================================================= */}

        {!isBlocked && !isApproved && (
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
        ================================================= */}

        <Pressable
          style={[
            styles.onlineButton,

            /*
            --------------------------------------------------
            BLOCKED
            --------------------------------------------------
            */

            isBlocked
              ? styles.disabledButton
              : /*
              ------------------------------------------------
              ONLINE
              ------------------------------------------------
              */

                isOnline
                ? styles.onlineButtonOffline
                : /*
                ------------------------------------------------
                OFFLINE / GO ONLINE
                ------------------------------------------------
                */

                  styles.onlineButtonOnline,

            /*
            --------------------------------------------------
            UNAPPROVED
            --------------------------------------------------
            */

            !isApproved && styles.disabledButton,
          ]}
          onPress={onToggleOnline}
          disabled={buttonDisabled}
        >
          {/* BUTTON INDICATOR */}

          <View
            style={[
              styles.onlineButtonIndicator,

              isBlocked
                ? styles.onlineButtonIndicatorBlocked
                : isOnline
                  ? styles.onlineButtonIndicatorOffline
                  : styles.onlineButtonIndicatorOnline,
            ]}
          />

          {/* BUTTON TEXT */}

          <Text style={styles.onlineButtonText}>{buttonText}</Text>
        </Pressable>
      </View>

      {/* =====================================================
          LIVE JOB / MARKETPLACE STATS
      ===================================================== */}

      {isOnline && !isBlocked && (
        <View style={styles.statsCard}>
          {/* =================================================
              TOTAL AVAILABLE
          ================================================= */}

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.total ?? 0}</Text>

            <Text style={styles.statLabel}>
              {isMaxi ? "Maxi Jobs" : "Available"}
            </Text>
          </View>

          {/* DIVIDER */}

          <View style={styles.statDivider} />

          {/* =================================================
              NEARBY
          ================================================= */}

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats?.nearby ?? 0}</Text>

            <Text style={styles.statLabel}>Nearby</Text>
          </View>

          {/* =================================================
              MICRO / MOTO ONLY
          ================================================= */}

          {isMicroOrMoto && (
            <>
              {/* DIVIDER */}

              <View style={styles.statDivider} />

              {/* BATCH */}

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.batch ?? 0}</Text>

                <Text style={styles.statLabel}>Batch</Text>
              </View>

              {/* DIVIDER */}

              <View style={styles.statDivider} />

              {/* EXPRESS */}

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.express ?? 0}</Text>

                <Text style={styles.statLabel}>Express</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* =====================================================
          REFRESH JOBS / DELIVERIES
      ===================================================== */}

      {isOnline && !isBlocked && (
        <Pressable
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={!onRefresh}
        >
          <Text style={styles.refreshIcon}>↻</Text>

          <Text style={styles.refreshText}>
            {isMaxi ? "Refresh Jobs" : "Refresh Deliveries"}
          </Text>
        </Pressable>
      )}
    </View>
  );
};

export default BottomContainer;
