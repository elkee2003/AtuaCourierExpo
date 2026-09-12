import { StyleSheet } from "react-native";

/**
 * ================================================================
 * ATUA TERMS & CONDITIONS
 * ================================================================
 *
 * Theme-aware stylesheet for the Terms and Conditions screen.
 *
 * The design intentionally matches the Privacy Policy screen so
 * both legal pages feel like part of the same Atua application.
 * ================================================================
 */

/**
 * ================================================================
 * SPACING
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

/**
 * ================================================================
 * RADII
 * ================================================================
 */

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
};

/**
 * ================================================================
 * STYLE FACTORY
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
     * Main backgrounds
     */
    background: isDark ? "#0B0F14" : "#F7F8FA",

    surface: isDark ? "#121820" : "#FFFFFF",

    surfaceElevated: isDark ? "#181F28" : "#FFFFFF",

    surfaceSoft: isDark ? "#1D252F" : "#F3F5F7",

    /**
     * Borders
     */
    border: isDark ? "#29323D" : "#E3E7EB",

    borderStrong: isDark ? "#3A4551" : "#CDD3DA",

    /**
     * Text
     */
    text: isDark ? "#F5F7FA" : "#111418",

    textSecondary: isDark ? "#A7B0BC" : "#626C78",

    textMuted: isDark ? "#8A95A2" : "#8B949F",

    /**
     * Restrained green.
     *
     * Used only for positive/confirmation states.
     */
    accent: isDark ? "#22C55E" : "#16A34A",

    accentSoft: isDark ? "#163523" : "#EAF7EE",

    accentBorder: isDark ? "#285A3A" : "#CBEBD5",

    /**
     * Warning
     */
    warning: isDark ? "#F59E0B" : "#D97706",

    warningSoft: isDark ? "#382B14" : "#FFF7E8",

    warningBorder: isDark ? "#6B4C1B" : "#F1D9A5",

    /**
     * Generic
     */
    white: "#FFFFFF",

    black: "#000000",
  };

  return StyleSheet.create({
    /* ============================================================
       ROOT
       ============================================================ */

    safeArea: {
      flex: 1,

      backgroundColor: COLORS.background,
    },

    container: {
      flex: 1,

      backgroundColor: COLORS.background,
    },

    /* ============================================================
       HEADER
       ============================================================ */

    headerContainer: {
      minHeight: 88,

      paddingHorizontal: SPACING.lg,

      flexDirection: "row",

      alignItems: "center",

      backgroundColor: COLORS.background,
    },

    backButton: {
      width: 42,
      height: 42,

      borderRadius: 21,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.border,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,

      ...SHADOWS.subtle,
    },

    backIcon: {
      fontSize: 20,

      color: COLORS.text,
    },

    headerTextContainer: {
      flex: 1,

      marginLeft: 14,

      paddingRight: 4,

      minWidth: 0,
    },

    header: {
      fontSize: 25,

      lineHeight: 31,

      fontWeight: "800",

      color: COLORS.text,

      letterSpacing: -0.5,
    },

    headerSubtitle: {
      marginTop: 3,

      fontSize: 11,

      lineHeight: 17,

      fontWeight: "500",

      color: COLORS.textMuted,
    },

    /* ============================================================
       SCROLL CONTENT
       ============================================================ */

    scrollContent: {
      paddingHorizontal: SPACING.lg,

      paddingTop: 4,

      paddingBottom: 40,
    },

    /* ============================================================
       INTRO CARD
       ============================================================ */

    introCard: {
      flexDirection: "row",

      alignItems: "center",

      backgroundColor: COLORS.surface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.border,

      padding: SPACING.lg,

      marginBottom: SPACING.xxxl,

      ...SHADOWS.card,
    },

    introIconContainer: {
      width: 48,
      height: 48,

      borderRadius: 15,

      backgroundColor: COLORS.surfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.border,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,
    },

    introIcon: {
      fontSize: 21,

      color: COLORS.text,
    },

    introContent: {
      flex: 1,

      marginLeft: 13,

      minWidth: 0,
    },

    introTitle: {
      fontSize: 15,

      lineHeight: 20,

      fontWeight: "800",

      color: COLORS.text,
    },

    introText: {
      marginTop: 4,

      fontSize: 11,

      lineHeight: 17,

      fontWeight: "500",

      color: COLORS.textSecondary,
    },

    /* ============================================================
       POLICY / TERMS SECTION
       ============================================================ */

    policySection: {
      marginBottom: SPACING.xxxl,
    },

    sectionHeading: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 12,
    },

    sectionNumber: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.border,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,

      ...SHADOWS.subtle,
    },

    sectionNumberText: {
      fontSize: 10,

      lineHeight: 13,

      fontWeight: "800",

      color: COLORS.textSecondary,

      letterSpacing: 0.3,
    },

    subHeader: {
      flex: 1,

      marginLeft: 11,

      fontSize: 16,

      lineHeight: 21,

      fontWeight: "800",

      color: COLORS.text,

      letterSpacing: -0.15,
    },

    /* ============================================================
       SECTION CONTENT CARD
       ============================================================ */

    sectionContent: {
      backgroundColor: COLORS.surface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,

      borderColor: COLORS.border,

      paddingHorizontal: SPACING.lg,

      paddingVertical: SPACING.lg,

      ...SHADOWS.subtle,
    },

    /* ============================================================
       BODY TEXT
       ============================================================ */

    txt: {
      fontSize: 13,

      lineHeight: 21,

      fontWeight: "500",

      color: COLORS.textSecondary,
    },

    pointer: {
      fontWeight: "800",

      color: COLORS.text,
    },

    /* ============================================================
       BULLETS
       ============================================================ */

    bulletRow: {
      flexDirection: "row",

      alignItems: "flex-start",

      marginTop: 12,

      paddingRight: 2,
    },

    bullet: {
      width: 20,

      paddingTop: 8,

      alignItems: "center",

      flexShrink: 0,
    },

    bulletDot: {
      width: 5,
      height: 5,

      borderRadius: 3,

      backgroundColor: COLORS.textSecondary,
    },

    /* ============================================================
       SUBSECTIONS
       ============================================================ */

    termsSubsection: {
      marginTop: 18,

      paddingTop: 15,

      borderTopWidth: 1,

      borderTopColor: COLORS.border,
    },

    termsSubsectionHeader: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 4,
    },

    termsSubsectionIndicator: {
      width: 4,
      height: 18,

      borderRadius: 2,

      backgroundColor: COLORS.text,

      marginRight: 9,
    },

    txtSubBold: {
      fontSize: 13,

      lineHeight: 18,

      fontWeight: "800",

      color: COLORS.text,
    },

    termsSubsectionContent: {
      paddingLeft: 4,
    },

    /* ============================================================
       PROHIBITED ITEMS NOTICE
       ============================================================ */

    prohibitedNotice: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 14,

      padding: 12,

      borderRadius: RADIUS.lg,

      backgroundColor: COLORS.warningSoft,

      borderWidth: 1,

      borderColor: COLORS.warningBorder,
    },

    prohibitedIconContainer: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.warningBorder,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,
    },

    prohibitedIcon: {
      fontSize: 17,

      color: COLORS.warning,
    },

    prohibitedNoticeText: {
      flex: 1,

      marginLeft: 10,

      fontSize: 10,

      lineHeight: 16,

      fontWeight: "600",

      color: isDark ? "#D7C39B" : "#765D2E",
    },

    /* ============================================================
       GOVERNING LAW
       ============================================================ */

    governingLawCard: {
      flexDirection: "row",

      alignItems: "center",

      marginBottom: 14,

      padding: 12,

      borderRadius: RADIUS.lg,

      backgroundColor: COLORS.surfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.border,
    },

    governingLawIconContainer: {
      width: 40,
      height: 40,

      borderRadius: 12,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.border,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,
    },

    governingLawIcon: {
      fontSize: 18,

      color: COLORS.textSecondary,
    },

    governingLawContent: {
      flex: 1,

      marginLeft: 10,
    },

    governingLawLabel: {
      fontSize: 9,

      lineHeight: 12,

      fontWeight: "800",

      color: COLORS.textMuted,

      textTransform: "uppercase",

      letterSpacing: 0.6,
    },

    governingLawTitle: {
      marginTop: 3,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: "800",

      color: COLORS.text,
    },

    /* ============================================================
       CONTACT SUPPORT
       ============================================================ */

    supportCard: {
      flexDirection: "row",

      alignItems: "center",

      minHeight: 68,

      marginTop: 12,

      paddingHorizontal: 12,

      borderRadius: RADIUS.lg,

      backgroundColor: COLORS.surfaceSoft,

      borderWidth: 1,

      borderColor: COLORS.border,
    },

    supportIconContainer: {
      width: 40,
      height: 40,

      borderRadius: 12,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.border,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,
    },

    emailIcon: {
      fontSize: 17,

      color: COLORS.text,
    },

    phoneIcon: {
      fontSize: 17,

      color: COLORS.text,
    },

    supportTextContainer: {
      flex: 1,

      marginLeft: 11,

      minWidth: 0,
    },

    supportLabel: {
      fontSize: 9,

      lineHeight: 12,

      fontWeight: "800",

      color: COLORS.textMuted,

      textTransform: "uppercase",

      letterSpacing: 0.6,
    },

    supportEmail: {
      marginTop: 3,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: "700",

      color: COLORS.text,
    },

    supportPhone: {
      marginTop: 3,

      fontSize: 13,

      lineHeight: 18,

      fontWeight: "700",

      color: COLORS.text,
    },

    copyIconContainer: {
      width: 34,
      height: 34,

      borderRadius: 10,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.border,

      alignItems: "center",

      justifyContent: "center",

      marginLeft: 8,

      flexShrink: 0,
    },

    copyIcon: {
      fontSize: 15,

      color: COLORS.textSecondary,
    },

    /* ============================================================
       FOOTER
       ============================================================ */

    footer: {
      flexDirection: "row",

      alignItems: "center",

      marginTop: 2,

      padding: SPACING.lg,

      borderRadius: RADIUS.xl,

      backgroundColor: COLORS.surface,

      borderWidth: 1,

      borderColor: COLORS.border,
    },

    footerIconContainer: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: COLORS.accentSoft,

      borderWidth: 1,

      borderColor: COLORS.accentBorder,

      alignItems: "center",

      justifyContent: "center",

      flexShrink: 0,
    },

    footerIcon: {
      fontSize: 17,

      color: COLORS.accent,
    },

    footerText: {
      flex: 1,

      marginLeft: 11,

      fontSize: 10,

      lineHeight: 16,

      fontWeight: "500",

      color: COLORS.textMuted,
    },

    /* ============================================================
       BOTTOM SPACING
       ============================================================ */

    bottomSpacer: {
      height: 20,
    },
  });
};

/**
 * ================================================================
 * DEFAULT EXPORT
 * ================================================================
 */

export default createStyles(false);
