import { StyleSheet } from "react-native";

/**
 * ================================================================
 * SHARED DESIGN TOKENS
 * ================================================================
 *
 * Keeping these values here makes the review screens easier to
 * maintain and keeps spacing/radius/shadows consistent.
 * ================================================================
 */

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 36,
};

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 999,
};

/**
 * ================================================================
 * SHADOWS
 * ================================================================
 */

const SHADOWS = {
  subtle: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  card: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 4,
  },

  elevated: {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 7,
  },
};

/**
 * ================================================================
 * STYLE FACTORY
 * ================================================================
 *
 * Pass true for dark mode:
 *
 * createStyles(true)
 *
 * Pass false for light mode:
 *
 * createStyles(false)
 * ================================================================
 */

export const createStyles = (isDark = false) => {
  /**
   * --------------------------------------------------------------
   * COLORS
   * --------------------------------------------------------------
   */

  const COLORS = {
    /**
     * Backgrounds
     */
    lightBackground: isDark ? "#0B0F14" : "#F7F8FA",

    lightSurface: isDark ? "#121820" : "#FFFFFF",

    lightSurfaceElevated: isDark ? "#181F28" : "#FFFFFF",

    lightSurfaceSoft: isDark ? "#1D252F" : "#F3F5F7",

    /**
     * Inputs
     */
    lightInput: isDark ? "#181F28" : "#F8F9FB",

    lightInputFocused: isDark ? "#1D252F" : "#FFFFFF",

    /**
     * Borders
     */
    lightBorder: isDark ? "#29323D" : "#E3E7EB",

    lightBorderStrong: isDark ? "#3A4551" : "#CDD3DA",

    /**
     * Typography
     */
    lightText: isDark ? "#F5F7FA" : "#111418",

    lightTextSecondary: isDark ? "#A7B0BC" : "#626C78",

    lightTextMuted: isDark ? "#8A95A2" : "#8B949F",

    /**
     * Dark equivalents.
     *
     * Kept here because other screens in the project may use
     * these names.
     */
    darkBackground: "#0B0F14",

    darkSurface: "#121820",

    darkSurfaceElevated: "#181F28",

    darkSurfaceSoft: "#1D252F",

    darkInput: "#181F28",

    darkBorder: "#29323D",

    darkBorderStrong: "#3A4551",

    darkText: "#F5F7FA",

    darkTextSecondary: "#A7B0BC",

    darkTextMuted: "#8A95A2",

    /**
     * Success / verification
     *
     * Green is intentionally restrained and only used for
     * positive/verified states.
     */
    accent: isDark ? "#22C55E" : "#16A34A",

    accentBright: "#22C55E",

    accentSoftLight: isDark ? "#163523" : "#EAF7EE",

    accentSoftDark: "#163523",

    /**
     * Error
     */
    danger: isDark ? "#EF4444" : "#DC2626",

    dangerSoftLight: isDark ? "#35191C" : "#FEF0F0",

    dangerSoftDark: "#35191C",

    /**
     * Warning
     */
    warning: isDark ? "#F59E0B" : "#D97706",

    warningSoftLight: isDark ? "#382B14" : "#FFF7E8",

    warningSoftDark: "#382B14",

    /**
     * Information
     */
    info: isDark ? "#38BDF8" : "#0284C7",

    infoSoftLight: isDark ? "#102E3A" : "#EAF6FC",

    infoSoftDark: "#102E3A",

    /**
     * Generic
     */
    white: "#FFFFFF",

    black: "#000000",

    transparent: "transparent",

    overlay: "rgba(0,0,0,0.35)",

    overlayStrong: "rgba(0,0,0,0.55)",
  };

  /**
   * ==============================================================
   * STYLES
   * ==============================================================
   */

  return StyleSheet.create({
    /* ============================================================
       ROOT / SAFE AREA
       ============================================================ */

    safeArea: {
      flex: 1,

      backgroundColor: COLORS.lightBackground,
    },

    reviewContainer: {
      flex: 1,

      backgroundColor: COLORS.lightBackground,
    },

    /* ============================================================
       HEADER
       ============================================================ */

    reviewHeader: {
      minHeight: 86,

      paddingHorizontal: SPACING.xl,

      /**
       * Space reserved for the back button and step badge.
       */
      paddingLeft: 64,
      paddingRight: 78,

      justifyContent: "center",

      position: "relative",
    },

    reviewHeaderText: {
      alignItems: "center",

      justifyContent: "center",
    },

    title: {
      fontSize: 27,

      lineHeight: 33,

      fontWeight: "800",

      color: COLORS.lightText,

      textAlign: "center",

      letterSpacing: -0.6,
    },

    reviewHeaderSubtitle: {
      marginTop: 5,

      fontSize: 13,

      lineHeight: 19,

      fontWeight: "500",

      color: COLORS.lightTextSecondary,

      textAlign: "center",
    },

    /* ============================================================
       BACK BUTTON
       ============================================================ */

    bckBtnCon: {
      position: "absolute",

      left: SPACING.lg,
      top: 21,

      width: 42,
      height: 42,

      borderRadius: 21,

      backgroundColor: COLORS.lightSurface,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      zIndex: 20,

      ...SHADOWS.subtle,
    },

    bckBtnIcon: {
      fontSize: 22,

      color: COLORS.lightText,
    },

    /* ============================================================
       STEP BADGE
       ============================================================ */

    reviewStepBadge: {
      position: "absolute",

      right: SPACING.lg,
      top: 20,

      minWidth: 43,

      paddingVertical: 7,
      paddingHorizontal: 9,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.lightSurface,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      ...SHADOWS.subtle,
    },

    reviewStepNumber: {
      fontSize: 11,

      lineHeight: 13,

      fontWeight: "800",

      color: COLORS.lightText,

      textAlign: "center",
    },

    reviewStepText: {
      marginTop: 1,

      fontSize: 8,

      lineHeight: 10,

      fontWeight: "700",

      color: COLORS.lightTextMuted,

      textAlign: "center",
    },

    /* ============================================================
       MAIN SCROLL CONTENT
       ============================================================ */

    reviewScrollContent: {
      paddingHorizontal: SPACING.lg,

      paddingTop: SPACING.lg,

      /**
       * Large bottom padding is necessary because the Continue /
       * Finish button is fixed to the bottom of the screen.
       */
      paddingBottom: 155,
    },

    /* ============================================================
       COURIER PROFILE CARD
       ============================================================ */

    profileReviewCard: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: SPACING.xxxl,

      ...SHADOWS.card,
    },

    reviewProfileImageWrapper: {
      width: 76,
      height: 76,

      borderRadius: 38,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 2,

      borderColor: COLORS.lightBorderStrong,

      alignItems: "center",
      justifyContent: "center",

      overflow: "hidden",
    },

    reviewProfileImage: {
      width: "100%",
      height: "100%",

      borderRadius: 38,

      resizeMode: "cover",
    },

    reviewProfilePlaceholder: {
      width: "100%",
      height: "100%",

      borderRadius: 38,

      backgroundColor: COLORS.lightSurfaceSoft,

      alignItems: "center",
      justifyContent: "center",
    },

    reviewProfileInitials: {
      fontSize: 23,

      fontWeight: "800",

      color: COLORS.lightText,
    },

    profileReviewInfo: {
      flex: 1,

      marginLeft: 14,

      minWidth: 0,
    },

    profileReviewName: {
      fontSize: 18,

      lineHeight: 23,

      fontWeight: "800",

      color: COLORS.lightText,

      letterSpacing: -0.25,
    },

    profileReviewRole: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 5,
    },

    profileReviewStatusDot: {
      width: 7,
      height: 7,

      borderRadius: 4,

      backgroundColor: COLORS.accent,

      marginRight: 6,
    },

    profileReviewRoleText: {
      fontSize: 11,

      lineHeight: 15,

      fontWeight: "600",

      color: COLORS.lightTextMuted,
    },

    transportBadge: {
      alignSelf: "flex-start",

      flexDirection: "row",

      alignItems: "center",

      marginTop: 9,

      paddingVertical: 6,

      paddingHorizontal: 9,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,
    },

    transportBadgeIcon: {
      fontSize: 13,

      color: COLORS.lightTextSecondary,
    },

    transportBadgeText: {
      marginLeft: 5,

      fontSize: 10,

      lineHeight: 13,

      fontWeight: "800",

      color: COLORS.lightTextSecondary,

      textTransform: "uppercase",

      letterSpacing: 0.4,
    },

    /* ============================================================
       GUARANTOR PROFILE CARD
       ============================================================ */

    guarantorProfileCard: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: SPACING.xxxl,

      ...SHADOWS.card,
    },

    guarantorAvatar: {
      width: 54,
      height: 54,

      borderRadius: 27,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorderStrong,

      alignItems: "center",
      justifyContent: "center",
    },

    guarantorAvatarText: {
      fontSize: 17,

      fontWeight: "800",

      color: COLORS.lightText,
    },

    guarantorProfileInfo: {
      flex: 1,

      marginLeft: 12,

      minWidth: 0,
    },

    guarantorProfileName: {
      fontSize: 14,

      lineHeight: 19,

      fontWeight: "800",

      color: COLORS.lightText,
    },

    guarantorProfileProfession: {
      marginTop: 3,

      fontSize: 11,

      lineHeight: 16,

      fontWeight: "500",

      color: COLORS.lightTextMuted,
    },

    guarantorStatusBadge: {
      flexDirection: "row",

      alignItems: "center",

      paddingVertical: 6,

      paddingHorizontal: 8,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,

      borderColor: isDark ? "#285A3A" : "#CBEBD5",
    },

    guarantorStatusIcon: {
      fontSize: 12,

      color: COLORS.accent,
    },

    guarantorStatusText: {
      marginLeft: 4,

      fontSize: 9,

      lineHeight: 12,

      fontWeight: "800",

      color: COLORS.accent,

      textTransform: "uppercase",
    },

    /* ============================================================
       SECTION
       ============================================================ */

    reviewSection: {
      marginBottom: SPACING.xxxl,
    },

    reviewSectionHeader: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 12,
    },

    reviewSectionIcon: {
      width: 40,
      height: 40,

      borderRadius: 13,

      backgroundColor: COLORS.lightSurface,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      ...SHADOWS.subtle,
    },

    reviewSectionIconGlyph: {
      fontSize: 19,

      color: COLORS.lightText,
    },

    reviewSectionHeading: {
      flex: 1,

      marginLeft: 11,

      minWidth: 0,
    },

    reviewSectionTitle: {
      fontSize: 16,

      lineHeight: 21,

      fontWeight: "800",

      color: COLORS.lightText,

      letterSpacing: -0.15,
    },

    reviewSectionDescription: {
      marginTop: 2,

      fontSize: 11,

      lineHeight: 17,

      fontWeight: "500",

      color: COLORS.lightTextMuted,
    },

    /* ============================================================
       INFORMATION CARD
       ============================================================ */

    reviewFieldsCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      paddingHorizontal: SPACING.lg,

      overflow: "hidden",

      ...SHADOWS.subtle,
    },

    /* ============================================================
       INFORMATION ROW
       ============================================================ */

    reviewField: {
      flexDirection: "row",

      alignItems: "center",

      minHeight: 66,

      paddingVertical: 13,

      borderBottomWidth: 1,

      borderBottomColor: COLORS.lightBorder,
    },

    reviewFieldLast: {
      borderBottomWidth: 0,
    },

    reviewFieldIconContainer: {
      width: 36,
      height: 36,

      borderRadius: 11,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    reviewFieldIcon: {
      fontSize: 16,

      color: COLORS.lightTextSecondary,
    },

    reviewFieldContent: {
      flex: 1,

      marginLeft: 11,

      minWidth: 0,
    },

    reviewFieldLabel: {
      fontSize: 10,

      lineHeight: 13,

      fontWeight: "700",

      color: COLORS.lightTextMuted,

      textTransform: "uppercase",

      letterSpacing: 0.55,
    },

    reviewFieldValue: {
      marginTop: 4,

      fontSize: 14,

      lineHeight: 20,

      fontWeight: "600",

      color: COLORS.lightText,
    },

    reviewFieldValueMissing: {
      color: COLORS.lightTextMuted,

      fontStyle: "italic",

      fontWeight: "500",
    },

    /* ============================================================
       VEHICLE PHOTO GALLERY
       ============================================================ */

    vehicleGalleryCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      padding: 12,

      overflow: "hidden",

      ...SHADOWS.subtle,
    },

    imageListContainer: {
      flexDirection: "row",

      flexWrap: "wrap",

      justifyContent: "space-between",
    },

    maxiImageWrapper: {
      width: "48.5%",

      height: 150,

      marginBottom: 10,

      borderRadius: RADIUS.lg,

      overflow: "hidden",

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      position: "relative",
    },

    maxiImages: {
      width: "100%",

      height: "100%",

      resizeMode: "cover",
    },

    imageNumberBadge: {
      position: "absolute",

      top: 8,
      left: 8,

      width: 26,
      height: 26,

      borderRadius: 13,

      backgroundColor: "rgba(17,20,24,0.82)",

      borderWidth: 1,

      borderColor: "rgba(255,255,255,0.18)",

      alignItems: "center",
      justifyContent: "center",
    },

    imageNumberText: {
      fontSize: 10,

      lineHeight: 13,

      fontWeight: "800",

      color: COLORS.white,
    },

    /* ============================================================
       DOCUMENT CARD
       ============================================================ */

    documentReviewCard: {
      marginTop: 12,

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      padding: 12,

      overflow: "hidden",

      ...SHADOWS.subtle,
    },

    documentReviewHeader: {
      flexDirection: "row",

      alignItems: "center",

      paddingHorizontal: 3,

      paddingVertical: 3,

      minHeight: 46,
    },

    documentReviewIcon: {
      width: 40,
      height: 40,

      borderRadius: 12,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    documentReviewIconGlyph: {
      fontSize: 18,

      color: COLORS.lightTextSecondary,
    },

    documentReviewTitleArea: {
      flex: 1,

      marginLeft: 10,

      minWidth: 0,
    },

    documentReviewTitle: {
      fontSize: 13,

      lineHeight: 18,

      fontWeight: "800",

      color: COLORS.lightText,
    },

    documentReviewSubtitle: {
      marginTop: 2,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: "500",

      color: COLORS.lightTextMuted,
    },

    documentVerifiedBadge: {
      flexDirection: "row",

      alignItems: "center",

      paddingVertical: 6,

      paddingHorizontal: 8,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,

      borderColor: isDark ? "#285A3A" : "#CBEBD5",

      flexShrink: 0,
    },

    documentVerifiedIcon: {
      fontSize: 13,

      color: COLORS.accent,
    },

    documentVerifiedText: {
      marginLeft: 4,

      fontSize: 9,

      lineHeight: 12,

      fontWeight: "800",

      color: COLORS.accent,

      textTransform: "uppercase",

      letterSpacing: 0.3,
    },

    reviewNinImage: {
      width: "100%",

      height: 205,

      borderRadius: RADIUS.lg,

      marginTop: 12,

      resizeMode: "cover",

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,
    },

    /* ============================================================
       ACCOUNT VERIFIED CARD
       ============================================================ */

    accountVerifiedCard: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 12,

      padding: 13,

      borderRadius: RADIUS.lg,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,

      borderColor: isDark ? "#285A3A" : "#CBEBD5",
    },

    accountVerifiedIcon: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: isDark ? "rgba(34,197,94,0.14)" : "rgba(22,163,74,0.10)",

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    accountVerifiedGlyph: {
      fontSize: 20,

      color: COLORS.accent,
    },

    accountVerifiedContent: {
      flex: 1,

      marginLeft: 10,

      minWidth: 0,
    },

    accountVerifiedTitle: {
      fontSize: 12,

      lineHeight: 16,

      fontWeight: "800",

      color: COLORS.accent,
    },

    accountVerifiedDescription: {
      marginTop: 3,

      fontSize: 10,

      lineHeight: 15,

      fontWeight: "500",

      color: isDark ? "#9ED0AA" : "#4C795A",
    },

    /* ============================================================
       COURIER REVIEW COMPLETION CARD
       ============================================================ */

    reviewCompleteCard: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginTop: 4,

      marginBottom: SPACING.lg,

      ...SHADOWS.card,
    },

    reviewCompleteIconContainer: {
      width: 52,
      height: 52,

      borderRadius: 17,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,

      borderColor: isDark ? "#285A3A" : "#CBEBD5",

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    reviewCompleteIcon: {
      fontSize: 25,

      color: COLORS.accent,
    },

    reviewCompleteContent: {
      flex: 1,

      marginLeft: 14,

      minWidth: 0,
    },

    reviewCompleteTitle: {
      fontSize: 15,

      lineHeight: 20,

      fontWeight: "800",

      color: COLORS.lightText,

      letterSpacing: -0.15,
    },

    reviewCompleteText: {
      marginTop: 5,

      fontSize: 11,

      lineHeight: 17,

      fontWeight: "500",

      color: COLORS.lightTextSecondary,
    },

    /* ============================================================
       FINAL GUARANTOR CONFIRMATION
       ============================================================ */

    finalConfirmationCard: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginTop: 4,

      ...SHADOWS.card,
    },

    finalConfirmationIcon: {
      width: 44,
      height: 44,

      borderRadius: 14,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      flexShrink: 0,
    },

    finalConfirmationGlyph: {
      fontSize: 21,

      color: COLORS.lightText,
    },

    finalConfirmationContent: {
      flex: 1,

      marginLeft: 12,

      minWidth: 0,
    },

    finalConfirmationTitle: {
      fontSize: 14,

      lineHeight: 19,

      fontWeight: "800",

      color: COLORS.lightText,
    },

    finalConfirmationText: {
      marginTop: 4,

      fontSize: 11,

      lineHeight: 17,

      fontWeight: "500",

      color: COLORS.lightTextSecondary,
    },

    /* ============================================================
       FIXED BOTTOM ACTION
       ============================================================ */

    reviewBottomAction: {
      position: "absolute",

      left: 0,
      right: 0,
      bottom: 0,

      paddingHorizontal: SPACING.lg,

      paddingTop: 10,

      paddingBottom: 18,

      backgroundColor: isDark
        ? "rgba(11,15,20,0.97)"
        : "rgba(247,248,250,0.97)",

      borderTopWidth: 1,

      borderTopColor: COLORS.lightBorder,

      zIndex: 50,
    },

    /* ============================================================
       MAIN CTA
       ============================================================ */

    nxtBtn: {
      minHeight: 64,

      backgroundColor: isDark ? "#171C23" : "#171A1F",

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: isDark ? "#303A46" : "#292E35",

      paddingHorizontal: 17,

      alignItems: "center",

      justifyContent: "center",

      ...SHADOWS.elevated,
    },

    nextButtonContent: {
      width: "100%",

      flexDirection: "row",

      alignItems: "center",
    },

    nextButtonCopy: {
      flex: 1,

      minWidth: 0,
    },

    nextButtonTitle: {
      fontSize: 15,

      lineHeight: 20,

      fontWeight: "800",

      color: COLORS.white,
    },

    nextButtonSubtitle: {
      marginTop: 3,

      fontSize: 10,

      lineHeight: 14,

      fontWeight: "500",

      color: isDark ? "#B3BCC8" : "#A8AFB8",
    },

    nextButtonIconContainer: {
      width: 42,
      height: 42,

      borderRadius: 13,

      backgroundColor: isDark ? "#222A33" : "#272C33",

      borderWidth: 1,

      borderColor: isDark ? "#3A4551" : "#3A414A",

      alignItems: "center",
      justifyContent: "center",

      marginLeft: 12,
    },

    nxtBtnIcon: {
      fontSize: 21,

      color: COLORS.white,
    },

    /* ============================================================
       SCROLL BOTTOM SPACER
       ============================================================ */

    reviewBottomSpacer: {
      height: 50,
    },
  });
};

/**
 * ================================================================
 * DEFAULT EXPORT
 * ================================================================
 *
 * This keeps compatibility with any older screen that still does:
 *
 * import styles from "./styles";
 *
 * New redesigned screens should use:
 *
 * const styles = useMemo(
 *   () => createStyles(isDark),
 *   [isDark]
 * );
 * ================================================================
 */

export default createStyles(false);
