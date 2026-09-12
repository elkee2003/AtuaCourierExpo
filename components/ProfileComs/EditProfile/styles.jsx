import { StyleSheet } from "react-native";

/**
 * ================================================================
 * ATUA COURIER PROFILE — SHARED DESIGN SYSTEM
 * ================================================================
 *
 * Used by:
 *
 * 1. EditProfile
 * 2. BankDetails
 * 3. ReviewCourierCom
 * 4. NextEditProfile
 * 5. ReviewGuarantorCom
 *
 * DESIGN DIRECTION
 * ----------------------------------------------------------------
 *
 * LIGHT MODE
 * - Clean white/light background
 * - White elevated cards
 * - Soft gray input surfaces
 * - Dark premium typography
 * - Dark premium CTA buttons
 * - Green reserved primarily for success/verification
 *
 * DARK MODE
 * - Deep charcoal background
 * - Elevated charcoal cards
 * - Light typography
 * - Clearly visible input surfaces
 * - Dark premium CTA buttons with white text
 * - Green reserved primarily for success/verification
 *
 * IMPORTANT
 * ----------------------------------------------------------------
 * Every screen that supports the full theme should call:
 *
 * const styles = useMemo(
 *   () => createStyles(isDark),
 *   [isDark]
 * );
 *
 * TextInput text and placeholder colours are still supplied directly
 * by the individual components because React Native TextInput has
 * native rendering behaviour.
 * ================================================================
 */

/* =================================================================
   DESIGN TOKENS
   ================================================================= */

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

/* =================================================================
   THEME FACTORY
   ================================================================= */

/**
 * Creates the entire shared stylesheet for the active theme.
 *
 * We intentionally keep the existing COLOR names used by the
 * components so the five screens remain compatible with the same
 * style keys.
 */
export const createStyles = (isDark = false) => {
  /*
   * Dynamic colour palette.
   *
   * The "light..." names are retained for compatibility with the
   * original stylesheet. Their values are now selected according
   * to the active theme.
   */
  const COLORS = {
    /* --------------------------------------------------------------
       SURFACES
       -------------------------------------------------------------- */

    lightBackground: isDark ? "#0B0F14" : "#F7F8FA",

    lightSurface: isDark ? "#121820" : "#FFFFFF",

    lightSurfaceElevated: isDark ? "#181F28" : "#FFFFFF",

    lightSurfaceSoft: isDark ? "#1D252F" : "#F3F5F7",

    /* --------------------------------------------------------------
       INPUTS
       -------------------------------------------------------------- */

    lightInput: isDark ? "#181F28" : "#F8F9FB",

    lightInputFocused: isDark ? "#1D252F" : "#FFFFFF",

    /* --------------------------------------------------------------
       BORDERS
       -------------------------------------------------------------- */

    lightBorder: isDark ? "#29323D" : "#E3E7EB",

    lightBorderStrong: isDark ? "#3A4551" : "#CDD3DA",

    /* --------------------------------------------------------------
       TYPOGRAPHY
       -------------------------------------------------------------- */

    lightText: isDark ? "#F5F7FA" : "#111418",

    lightTextSecondary: isDark ? "#A7B0BC" : "#626C78",

    lightTextMuted: isDark ? "#8A95A2" : "#8B949F",

    /* --------------------------------------------------------------
       DARK MODE ALIASES
       --------------------------------------------------------------

       These remain available for compatibility with any component
       that may reference them directly.
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

    /* --------------------------------------------------------------
       SUCCESS / BRAND
       -------------------------------------------------------------- */

    accent: isDark ? "#22C55E" : "#16A34A",

    accentBright: "#22C55E",

    accentSoftLight: isDark ? "#163523" : "#EAF7EE",

    accentSoftDark: "#163523",

    /* --------------------------------------------------------------
       ERROR
       -------------------------------------------------------------- */

    danger: isDark ? "#EF4444" : "#DC2626",

    dangerSoftLight: isDark ? "#35191C" : "#FEF0F0",

    dangerSoftDark: "#35191C",

    /* --------------------------------------------------------------
       WARNING
       -------------------------------------------------------------- */

    warning: isDark ? "#F59E0B" : "#D97706",

    warningSoftLight: isDark ? "#382B14" : "#FFF7E8",

    warningSoftDark: "#382B14",

    /* --------------------------------------------------------------
       INFORMATION
       -------------------------------------------------------------- */

    info: isDark ? "#38BDF8" : "#0284C7",

    infoSoftLight: isDark ? "#102E3A" : "#EAF6FC",

    infoSoftDark: "#102E3A",

    /* --------------------------------------------------------------
       BASIC
       -------------------------------------------------------------- */

    white: "#FFFFFF",
    black: "#000000",

    transparent: "transparent",

    overlay: "rgba(0,0,0,0.35)",
    overlayStrong: "rgba(0,0,0,0.55)",
  };

  /* =================================================================
     STYLES
     ================================================================= */

  return StyleSheet.create({
    /* ===============================================================
       SAFE AREA / BASE CONTAINERS
       =============================================================== */

    safeArea: {
      flex: 1,
      backgroundColor: COLORS.lightBackground,
    },

    container: {
      flex: 1,
      backgroundColor: COLORS.lightBackground,
      paddingTop: 30,
    },

    reviewContainer: {
      flex: 1,
      backgroundColor: COLORS.lightBackground,
      paddingTop: 30,
    },

    keyboardContainer: {
      flex: 1,
      backgroundColor: COLORS.lightBackground,
    },

    /* ===============================================================
       PAGE HEADER
       =============================================================== */

    pageHeader: {
      minHeight: 78,

      paddingHorizontal: SPACING.xl,
      paddingLeft: 64,
      paddingRight: 64,

      justifyContent: "center",

      position: "relative",
    },

    pageHeaderText: {
      alignItems: "center",
    },

    title: {
      fontSize: 27,
      lineHeight: 34,

      fontWeight: "800",

      color: COLORS.lightText,

      textAlign: "center",

      letterSpacing: -0.6,
    },

    pageSubtitle: {
      marginTop: 5,

      fontSize: 13,
      lineHeight: 19,

      color: COLORS.lightTextSecondary,

      textAlign: "center",
    },

    reviewHeader: {
      minHeight: 86,

      paddingHorizontal: SPACING.xl,
      paddingLeft: 64,
      paddingRight: 78,

      justifyContent: "center",

      position: "relative",
    },

    reviewHeaderText: {
      alignItems: "center",
    },

    reviewHeaderSubtitle: {
      marginTop: 5,

      fontSize: 13,
      lineHeight: 19,

      color: COLORS.lightTextSecondary,

      textAlign: "center",
    },

    /* ===============================================================
       BACK BUTTON
       =============================================================== */

    bckBtnCon: {
      position: "absolute",

      left: 18,
      top: 18,

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

    /* ===============================================================
       SIGN OUT
       =============================================================== */

    signoutBtn: {
      position: "absolute",

      right: 18,
      top: 18,

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

    signoutIcon: {
      fontSize: 20,
      color: COLORS.danger,
    },

    signoutTxt: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.danger,
    },

    /* ===============================================================
       STEP BADGES
       =============================================================== */

    stepBadge: {
      flexDirection: "row",
      alignItems: "center",

      alignSelf: "center",

      marginTop: 12,

      paddingVertical: 7,
      paddingHorizontal: 11,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.lightSurface,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      ...SHADOWS.subtle,
    },

    stepBadgeNumber: {
      fontSize: 11,
      fontWeight: "800",
      color: COLORS.accent,
    },

    stepBadgeText: {
      marginLeft: 6,

      fontSize: 11,
      fontWeight: "700",

      color: COLORS.lightTextSecondary,
    },

    finalStepBadge: {
      position: "absolute",

      right: 18,
      top: 20,

      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 7,
      paddingHorizontal: 10,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,
      borderColor: isDark ? "#285A3A" : "#CBEBD5",
    },

    finalStepIcon: {
      fontSize: 13,
      color: COLORS.accent,
    },

    finalStepText: {
      marginLeft: 5,

      fontSize: 10,
      fontWeight: "800",

      color: COLORS.accent,

      textTransform: "uppercase",
      letterSpacing: 0.5,
    },

    reviewStepBadge: {
      position: "absolute",

      right: 18,
      top: 20,

      paddingVertical: 7,
      paddingHorizontal: 10,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.lightSurface,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",

      ...SHADOWS.subtle,
    },

    reviewStepNumber: {
      fontSize: 11,
      fontWeight: "800",
      color: COLORS.lightText,
    },

    reviewStepText: {
      marginTop: 1,

      fontSize: 9,
      fontWeight: "700",

      color: COLORS.lightTextMuted,
    },

    /* ===============================================================
       SCROLL CONTENT
       =============================================================== */

    editScrollContent: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: 135,
    },

    reviewScrollContent: {
      paddingHorizontal: SPACING.lg,
      paddingTop: SPACING.lg,
      paddingBottom: 155,
    },

    formBottomSpacer: {
      height: 30,
    },

    reviewBottomSpacer: {
      height: 50,
    },

    /* ===============================================================
       PROFILE PHOTO
       =============================================================== */

    profilePicWrapper: {
      alignItems: "center",
      justifyContent: "center",

      marginVertical: SPACING.lg,
    },

    profilePicContainer: {
      width: 138,
      height: 138,

      borderRadius: 69,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 3,
      borderColor: COLORS.lightBorderStrong,

      alignItems: "center",
      justifyContent: "center",

      position: "relative",

      ...SHADOWS.elevated,
    },

    img: {
      width: "100%",
      height: "100%",

      borderRadius: 69,

      resizeMode: "cover",
    },

    placeholderContainer: {
      width: "100%",
      height: "100%",

      borderRadius: 69,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: COLORS.lightSurfaceSoft,
    },

    profilePlaceholderIcon: {
      fontSize: 46,
      color: COLORS.lightTextMuted,
    },

    addPhotoText: {
      marginTop: 10,

      fontSize: 13,
      fontWeight: "600",

      color: COLORS.lightTextSecondary,
    },

    cameraIconContainer: {
      position: "absolute",

      bottom: 1,
      right: 1,

      width: 38,
      height: 38,

      borderRadius: 19,

      backgroundColor: COLORS.lightText,

      borderWidth: 3,
      borderColor: COLORS.lightSurface,

      alignItems: "center",
      justifyContent: "center",

      ...SHADOWS.subtle,
    },

    cameraIcon: {
      fontSize: 18,
      color: COLORS.white,
    },

    /* ===============================================================
       PROFILE CARD
       =============================================================== */

    profileCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: SPACING.xl,

      ...SHADOWS.card,
    },

    profileCardCopy: {
      flex: 1,
      marginLeft: SPACING.lg,
    },

    profileCardTitle: {
      fontSize: 17,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    profileCardDescription: {
      marginTop: 5,

      fontSize: 12,
      lineHeight: 18,

      color: COLORS.lightTextSecondary,
    },

    changePhotoButton: {
      marginTop: 12,

      flexDirection: "row",
      alignItems: "center",
      alignSelf: "flex-start",

      paddingVertical: 8,
      paddingHorizontal: 11,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,
    },

    changePhotoText: {
      marginLeft: 6,

      fontSize: 11,
      fontWeight: "700",

      color: COLORS.lightText,
    },

    changePhotoIcon: {
      fontSize: 14,
      color: COLORS.lightTextSecondary,
    },

    /* ===============================================================
       FORM SECTIONS
       =============================================================== */

    formSection: {
      marginBottom: SPACING.xxl,
    },

    formSectionHeader: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom: 12,
    },

    formSectionIcon: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: COLORS.lightSurface,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      ...SHADOWS.subtle,
    },

    formSectionIconGlyph: {
      fontSize: 19,
      color: COLORS.lightText,
    },

    formSectionHeaderText: {
      flex: 1,
      marginLeft: 11,
    },

    formSectionTitle: {
      fontSize: 16,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    formSectionDescription: {
      marginTop: 2,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextMuted,
    },

    formCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      ...SHADOWS.subtle,
    },

    /* ===============================================================
       FORM FIELDS
       =============================================================== */

    fieldWrapper: {
      marginBottom: 16,
    },

    fieldLabelRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",

      marginBottom: 7,
    },

    fieldLabel: {
      fontSize: 12,
      fontWeight: "700",

      color: COLORS.lightTextSecondary,

      letterSpacing: 0.2,
    },

    fieldHint: {
      fontSize: 10,
      color: COLORS.lightTextMuted,
    },

    input: {
      minHeight: 52,

      marginBottom: 0,

      backgroundColor: COLORS.lightInput,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      paddingHorizontal: 15,
      paddingVertical: 13,

      borderRadius: RADIUS.md,

      fontSize: 15,

      color: COLORS.lightText,

      includeFontPadding: false,
    },

    inputLast: {
      minHeight: 52,

      marginTop: 0,

      backgroundColor: COLORS.lightInput,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      paddingHorizontal: 15,
      paddingVertical: 13,

      borderRadius: RADIUS.md,

      fontSize: 15,

      color: COLORS.lightText,

      includeFontPadding: false,
    },

    multilineInput: {
      minHeight: 110,

      textAlignVertical: "top",

      paddingTop: 14,
    },

    /* ===============================================================
       DOCUMENT CARD
       =============================================================== */

    documentCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginTop: 5,

      ...SHADOWS.subtle,
    },

    documentCardHeader: {
      flexDirection: "row",
      alignItems: "center",
    },

    documentIconContainer: {
      width: 42,
      height: 42,

      borderRadius: 13,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",
    },

    documentIcon: {
      fontSize: 20,
      color: COLORS.lightText,
    },

    documentHeaderCopy: {
      flex: 1,
      marginLeft: 11,
    },

    documentTitle: {
      fontSize: 14,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    documentDescription: {
      marginTop: 3,

      fontSize: 11,
      lineHeight: 16,

      color: COLORS.lightTextMuted,
    },

    replaceIcon: {
      fontSize: 19,
      color: COLORS.lightTextSecondary,
    },

    removeIcon: {
      fontSize: 19,
      color: COLORS.danger,
    },

    uploadIconContainer: {
      width: 52,
      height: 52,

      borderRadius: 16,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      marginBottom: 10,
    },

    uploadIcon: {
      fontSize: 23,
      color: COLORS.lightText,
    },

    uploadAction: {
      minHeight: 100,

      marginTop: 16,

      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: COLORS.lightBorderStrong,

      borderRadius: RADIUS.lg,

      backgroundColor: COLORS.lightSurfaceSoft,

      alignItems: "center",
      justifyContent: "center",
    },

    uploadActionText: {
      marginTop: 8,

      fontSize: 13,
      fontWeight: "700",

      color: COLORS.lightText,
    },

    uploadActionIcon: {
      fontSize: 21,
      color: COLORS.lightTextSecondary,
    },

    documentImageWrapper: {
      marginTop: 14,

      borderRadius: RADIUS.lg,

      overflow: "hidden",

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,
    },

    documentAddedBadge: {
      position: "absolute",

      top: 10,
      right: 10,

      zIndex: 5,

      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 6,
      paddingHorizontal: 9,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,
      borderColor: isDark ? "#285A3A" : "#CBEBD5",
    },

    documentAddedIcon: {
      fontSize: 13,
      color: COLORS.accent,
    },

    documentAddedText: {
      marginLeft: 4,

      fontSize: 10,
      fontWeight: "800",

      color: COLORS.accent,
    },

    /* ===============================================================
       SECURITY CARD
       =============================================================== */

    securityCard: {
      flexDirection: "row",
      alignItems: "flex-start",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginTop: 5,
      marginBottom: SPACING.xxl,

      ...SHADOWS.subtle,
    },

    securityIconContainer: {
      width: 40,
      height: 40,

      borderRadius: 12,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",
    },

    securityIcon: {
      fontSize: 18,
      color: COLORS.lightText,
    },

    securityContent: {
      flex: 1,
      marginLeft: 12,
    },

    securityTitle: {
      fontSize: 13,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    securityText: {
      marginTop: 5,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextMuted,
    },

    /* ===============================================================
       ERROR
       =============================================================== */

    /* ===============================================================
        FIXED VALIDATION ERROR
        ===============================================================

        The Continue button is absolutely positioned at the bottom
        of the screen.

        Therefore, the validation error also needs to be positioned
        explicitly so it cannot disappear underneath the button.
        =============================================================== */

    fixedErrorArea: {
      position: "absolute",

      left: 0,
      right: 0,

      /*
       * Keep the error directly above the Continue button.
       *
       * The Continue button has:
       * - paddingTop: 10
       * - paddingBottom: 18
       * - plus the actual button height
       *
       * 88 is enough to reserve that area while still keeping
       * the error visually close to the CTA.
       */
      bottom: 88,

      paddingHorizontal: SPACING.lg,
      paddingTop: 6,
      paddingBottom: 4,

      backgroundColor: isDark
        ? "rgba(11,15,20,0.98)"
        : "rgba(247,248,250,0.98)",

      /*
       * The error must sit above the ScrollView but below nothing
       * important. The Continue button itself can remain at zIndex 50.
       */
      zIndex: 60,

      elevation: 10,
    },

    errorContainer: {
      flexDirection: "row",
      alignItems: "flex-start",

      backgroundColor: isDark ? "#35191C" : "#FEF0F0",

      borderWidth: 1,

      borderColor: isDark ? "#653037" : "#F5CACA",

      borderRadius: RADIUS.md,

      paddingVertical: 10,
      paddingHorizontal: 10,

      /*
       * Prevent the error card from becoming too close to the
       * Continue button.
       */
      marginBottom: 2,
    },

    errorIconContainer: {
      width: 28,
      height: 28,

      borderRadius: 10,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: isDark ? "rgba(239,68,68,0.12)" : "rgba(220,38,38,0.08)",
    },

    errorIcon: {
      fontSize: 17,

      color: isDark ? "#EF4444" : "#DC2626",
    },

    error: {
      flex: 1,

      marginLeft: 8,

      color: isDark ? "#EF4444" : "#DC2626",

      fontSize: 12,
      lineHeight: 18,

      fontWeight: "600",
    },

    /* ===============================================================
       FORM INTRO CARD
       =============================================================== */

    formIntroCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: SPACING.xxl,

      ...SHADOWS.card,
    },

    formIntroIconContainer: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",
    },

    formIntroIcon: {
      fontSize: 22,
      color: COLORS.lightText,
    },

    formIntroContent: {
      flex: 1,
      marginLeft: 12,
    },

    formIntroTitle: {
      fontSize: 15,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    formIntroText: {
      marginTop: 4,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextSecondary,
    },

    /* ===============================================================
       REVIEW INTRO
       =============================================================== */

    reviewIntroCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: SPACING.xxl,

      ...SHADOWS.card,
    },

    reviewIntroIconContainer: {
      width: 46,
      height: 46,

      borderRadius: 14,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",
    },

    reviewIntroIcon: {
      fontSize: 22,
      color: COLORS.lightText,
    },

    reviewIntroContent: {
      flex: 1,
      marginLeft: 12,
    },

    reviewIntroTitle: {
      fontSize: 15,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    reviewIntroText: {
      marginTop: 4,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextSecondary,
    },

    /* ===============================================================
       COMPLETION CARD
       =============================================================== */

    completionCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: SPACING.lg,

      ...SHADOWS.card,
    },

    completionIconContainer: {
      width: 50,
      height: 50,

      borderRadius: 16,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,
      borderColor: isDark ? "#285A3A" : "#CBEBD5",

      alignItems: "center",
      justifyContent: "center",
    },

    completionIcon: {
      fontSize: 24,
      color: COLORS.accent,
    },

    completionContent: {
      flex: 1,
      marginLeft: 13,
    },

    completionTitle: {
      fontSize: 15,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    completionText: {
      marginTop: 4,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextSecondary,
    },
    reviewCompleteCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginTop: 4,
      marginBottom: SPACING.xxl,

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
    },

    reviewCompleteIcon: {
      fontSize: 25,
      color: COLORS.accent,
    },

    reviewCompleteContent: {
      flex: 1,
      marginLeft: 14,
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

    /* ===============================================================
       REVIEW PROFILE CARD
       =============================================================== */

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
      width: 76,
      height: 76,

      borderRadius: 38,

      resizeMode: "cover",
    },

    reviewProfilePlaceholder: {
      width: "100%",
      height: "100%",

      borderRadius: 38,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: COLORS.lightSurfaceSoft,
    },

    reviewProfileInitials: {
      fontSize: 23,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    profileReviewInfo: {
      flex: 1,
      marginLeft: 14,
    },

    profileReviewName: {
      fontSize: 18,
      fontWeight: "800",

      color: COLORS.lightText,

      letterSpacing: -0.2,
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
      fontWeight: "800",

      color: COLORS.lightTextSecondary,

      textTransform: "uppercase",
      letterSpacing: 0.4,
    },

    /* ===============================================================
       REVIEW SECTIONS
       =============================================================== */

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
    },

    reviewSectionTitle: {
      fontSize: 16,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    reviewSectionDescription: {
      marginTop: 2,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextMuted,
    },

    /* ===============================================================
       REVIEW FIELDS
       =============================================================== */

    reviewFieldsCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      paddingHorizontal: SPACING.lg,

      ...SHADOWS.subtle,
    },

    reviewField: {
      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 15,

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
    },

    reviewFieldIcon: {
      fontSize: 16,
      color: COLORS.lightTextSecondary,
    },

    reviewFieldContent: {
      flex: 1,
      marginLeft: 11,
    },

    reviewFieldLabel: {
      fontSize: 10,
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

    /* ===============================================================
       VEHICLE GALLERY
       =============================================================== */

    vehicleGalleryCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: 12,

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
    },

    maxiImages: {
      width: "100%",
      height: "100%",

      borderRadius: RADIUS.lg,

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
      fontWeight: "800",

      color: COLORS.white,
    },

    /* ===============================================================
       DOCUMENT REVIEW
       =============================================================== */

    documentReviewCard: {
      marginTop: 12,

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: 12,

      ...SHADOWS.subtle,
    },

    documentReviewHeader: {
      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 3,
      paddingVertical: 3,
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
    },

    documentReviewIconGlyph: {
      fontSize: 18,
      color: COLORS.lightTextSecondary,
    },

    documentReviewTitleArea: {
      flex: 1,
      marginLeft: 10,
    },

    documentReviewTitle: {
      fontSize: 13,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    documentReviewSubtitle: {
      marginTop: 2,

      fontSize: 10,
      lineHeight: 15,

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
    },

    documentVerifiedIcon: {
      fontSize: 13,
      color: COLORS.accent,
    },

    documentVerifiedText: {
      marginLeft: 4,

      fontSize: 9,
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
    },

    /* ===============================================================
       ACCOUNT VERIFICATION
       =============================================================== */

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
    },

    accountVerifiedGlyph: {
      fontSize: 20,
      color: COLORS.accent,
    },

    accountVerifiedContent: {
      flex: 1,
      marginLeft: 10,
    },

    accountVerifiedTitle: {
      fontSize: 12,
      fontWeight: "800",

      color: COLORS.accent,
    },

    accountVerifiedDescription: {
      marginTop: 3,

      fontSize: 10,
      lineHeight: 15,

      color: isDark ? "#9ED0AA" : "#4C795A",
    },

    /* ===============================================================
       GUARANTOR PROFILE
       =============================================================== */

    guarantorProfileCard: {
      flexDirection: "row",
      alignItems: "center",

      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      padding: SPACING.lg,

      marginBottom: 12,

      ...SHADOWS.subtle,
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
    },

    guarantorProfileName: {
      fontSize: 14,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    guarantorProfileProfession: {
      marginTop: 3,

      fontSize: 11,

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
      fontWeight: "800",

      color: COLORS.accent,

      textTransform: "uppercase",
    },

    /* ===============================================================
       FINAL CONFIRMATION
       =============================================================== */

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
    },

    finalConfirmationGlyph: {
      fontSize: 21,
      color: COLORS.lightText,
    },

    finalConfirmationContent: {
      flex: 1,
      marginLeft: 12,
    },

    finalConfirmationTitle: {
      fontSize: 14,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    finalConfirmationText: {
      marginTop: 4,

      fontSize: 11,
      lineHeight: 17,

      color: COLORS.lightTextSecondary,
    },

    /* ===============================================================
       BOTTOM ACTION AREA
       =============================================================== */

    bottomAction: {
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

    /* ===============================================================
       CONTINUE BUTTON
       =============================================================== */

    nxtBtn: {
      minHeight: 64,

      backgroundColor: isDark ? "#171C23" : "#171A1F",

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: isDark ? "#303A46" : "#292E35",

      paddingHorizontal: 17,

      marginTop: 8,

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
      marginLeft: 12,
    },

    nextButtonTitle: {
      fontSize: 15,
      fontWeight: "800",

      color: COLORS.white,
    },

    nextButtonSubtitle: {
      marginTop: 3,

      fontSize: 10,

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
    },

    nxtBtnIcon: {
      fontSize: 21,
      color: COLORS.white,
    },

    /* ===============================================================
       SAVE BUTTON
       =============================================================== */

    saveBtn: {
      minHeight: 66,

      backgroundColor: isDark ? "#171C23" : "#171A1F",

      borderRadius: RADIUS.xl,

      borderWidth: 1,
      borderColor: isDark ? "#303A46" : "#292E35",

      paddingHorizontal: 15,

      alignItems: "center",
      justifyContent: "center",

      ...SHADOWS.elevated,
    },

    saveBtnDisabled: {
      opacity: 0.72,
    },

    saveButtonContent: {
      width: "100%",

      flexDirection: "row",
      alignItems: "center",
    },

    saveButtonIconContainer: {
      width: 43,
      height: 43,

      borderRadius: 14,

      backgroundColor: COLORS.accent,

      alignItems: "center",
      justifyContent: "center",
    },

    saveButtonIcon: {
      fontSize: 20,
      color: COLORS.white,
    },

    saveButtonTextContainer: {
      flex: 1,
      marginLeft: 12,
    },

    saveBtnTxt: {
      fontSize: 15,
      fontWeight: "800",

      color: COLORS.white,
    },

    saveButtonSubtitle: {
      marginTop: 3,

      fontSize: 10,

      color: isDark ? "#B3BCC8" : "#A8AFB8",
    },

    saveProgressText: {
      marginTop: 3,

      fontSize: 10,

      color: isDark ? "#CDD4DC" : "#C2C7CE",
    },

    saveArrowIcon: {
      fontSize: 23,

      color: isDark ? "#CDD4DC" : "#C4C9CF",

      marginLeft: 8,
    },

    /* ===============================================================
       BANK DETAILS
       =============================================================== */

    bankContainer: {
      zIndex: 3000,
    },

    bankFieldGroup: {
      marginBottom: 18,
    },

    bankFieldLabelRow: {
      flexDirection: "row",
      alignItems: "center",

      marginBottom: 8,
    },

    bankFieldLabelContent: {
      flex: 1,
    },

    bankFieldIconContainer: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: COLORS.lightSurfaceSoft,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      alignItems: "center",
      justifyContent: "center",

      marginRight: 10,
    },

    bankFieldIcon: {
      fontSize: 18,
      color: COLORS.lightTextSecondary,
    },

    bankFieldLabel: {
      fontSize: 12,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    bankFieldDescription: {
      marginTop: 2,

      fontSize: 10,
      lineHeight: 15,

      color: COLORS.lightTextMuted,
    },

    selectedIndicator: {
      flexDirection: "row",
      alignItems: "center",

      paddingVertical: 5,
      paddingHorizontal: 8,

      borderRadius: RADIUS.pill,

      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,
      borderColor: isDark ? "#285A3A" : "#CBEBD5",
    },

    selectedIndicatorText: {
      marginLeft: 4,

      fontSize: 9,
      fontWeight: "800",

      color: COLORS.accent,

      textTransform: "uppercase",
    },

    autocompleteContainer: {
      zIndex: 1000,

      backgroundColor: "transparent",

      borderWidth: 0,

      borderRadius: 0,

      overflow: "visible",
    },

    inputContainerStyle: {
      backgroundColor: "transparent",
      borderWidth: 0,
    },

    autocompleteInput: {
      minHeight: 52,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      borderRadius: RADIUS.md,

      paddingHorizontal: 14,
      paddingVertical: 13,

      fontSize: 15,

      color: COLORS.lightText,

      backgroundColor: COLORS.lightInput,

      marginBottom: 0,

      includeFontPadding: false,
    },

    autocompleteList: {
      borderWidth: 1,

      borderColor: COLORS.lightBorder,

      borderRadius: RADIUS.md,

      marginTop: 6,

      backgroundColor: COLORS.lightSurface,

      overflow: "hidden",

      ...SHADOWS.elevated,
    },

    rightButtonsContainerStyle: {
      backgroundColor: "transparent",
    },

    accountCounter: {
      fontSize: 10,
      color: COLORS.lightTextMuted,
    },

    accountInputWrapper: {
      flexDirection: "row",
      alignItems: "center",

      minHeight: 52,

      backgroundColor: COLORS.lightInput,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      borderRadius: RADIUS.md,

      paddingHorizontal: 14,
    },

    accountInputWrapperComplete: {
      borderColor: isDark ? "#2D7A47" : "#86D6A1",
    },

    accountInputWrapperError: {
      borderColor: isDark ? "#7A343A" : "#F0A0A0",
    },

    accountStatusIcon: {
      fontSize: 19,
      color: COLORS.lightTextMuted,
    },

    accountVerifiedIcon: {
      fontSize: 19,
      color: COLORS.accent,
    },

    accountVerifiedCheck: {
      fontSize: 12,
      color: COLORS.accent,
    },

    bankLastInput: {
      flex: 1,

      minHeight: 50,

      marginBottom: 0,

      paddingHorizontal: 0,
      paddingVertical: 12,

      borderWidth: 0,

      backgroundColor: "transparent",

      fontSize: 15,

      color: COLORS.lightText,

      includeFontPadding: false,
    },

    /* ===============================================================
       BANK FEEDBACK
       =============================================================== */

    bankFeedbackCard: {
      flexDirection: "row",
      alignItems: "center",

      padding: 12,

      borderRadius: RADIUS.lg,

      marginTop: 8,
    },

    bankSuccessCard: {
      backgroundColor: COLORS.accentSoftLight,

      borderWidth: 1,
      borderColor: isDark ? "#285A3A" : "#CBEBD5",
    },

    bankFeedbackIconContainer: {
      width: 38,
      height: 38,

      borderRadius: 12,

      alignItems: "center",
      justifyContent: "center",
    },

    bankSuccessIconContainer: {
      backgroundColor: isDark ? "rgba(34,197,94,0.14)" : "rgba(22,163,74,0.10)",
    },

    bankSuccessCheck: {
      fontSize: 19,
      color: COLORS.accent,
    },

    bankFeedbackContent: {
      flex: 1,
      marginLeft: 10,
    },

    bankFeedbackTitle: {
      fontSize: 12,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    bankFeedbackDescription: {
      marginTop: 3,

      fontSize: 10,
      lineHeight: 15,

      color: COLORS.lightTextSecondary,
    },

    bankSuccessTitleRow: {
      flexDirection: "row",
      alignItems: "center",
    },

    verifiedBadge: {
      marginLeft: 7,

      paddingVertical: 3,
      paddingHorizontal: 6,

      borderRadius: RADIUS.pill,

      backgroundColor: isDark ? "#1B4028" : "#DDF3E4",
    },

    verifiedBadgeText: {
      fontSize: 8,
      fontWeight: "800",

      color: COLORS.accent,

      textTransform: "uppercase",
    },

    accountNameValue: {
      marginTop: 3,

      fontSize: 11,

      color: isDark ? "#9ED0AA" : "#4C795A",
    },

    bankErrorCard: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 8,

      padding: 12,

      borderRadius: RADIUS.lg,

      backgroundColor: COLORS.dangerSoftLight,

      borderWidth: 1,
      borderColor: isDark ? "#653037" : "#F5CACA",
    },

    bankErrorIconContainer: {
      width: 38,
      height: 38,

      borderRadius: 12,

      backgroundColor: isDark ? "rgba(239,68,68,0.14)" : "rgba(220,38,38,0.08)",

      alignItems: "center",
      justifyContent: "center",
    },

    bankErrorIcon: {
      fontSize: 19,
      color: COLORS.danger,
    },

    bankSecurityNote: {
      flexDirection: "row",
      alignItems: "center",

      marginTop: 8,

      paddingHorizontal: 3,
    },

    bankSecurityIcon: {
      fontSize: 14,
      color: COLORS.lightTextMuted,
    },

    bankSecurityText: {
      flex: 1,

      marginLeft: 7,

      fontSize: 10,
      lineHeight: 15,

      color: COLORS.lightTextMuted,
    },

    /* ===============================================================
       COMPATIBILITY STYLES
       =============================================================== */

    addGuarantorSub: {
      marginHorizontal: 10,

      fontSize: 20,
      fontWeight: "800",

      color: COLORS.lightText,
    },

    subHeader: {
      marginTop: 15,

      fontSize: 13,
      fontWeight: "800",

      color: COLORS.lightTextSecondary,
    },

    inputReview: {
      minHeight: 52,

      paddingVertical: 10,
      paddingHorizontal: 15,

      fontSize: 15,
      letterSpacing: 0.2,

      color: COLORS.lightText,

      backgroundColor: COLORS.lightInput,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      borderRadius: RADIUS.md,

      marginBottom: 10,
    },

    inputReviewLast: {
      minHeight: 52,

      paddingVertical: 10,
      paddingHorizontal: 15,

      fontSize: 15,
      letterSpacing: 0.2,

      color: COLORS.lightText,

      backgroundColor: COLORS.lightInput,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      borderRadius: RADIUS.md,

      marginBottom: 30,
    },

    /* ===============================================================
       OLD NIN COMPATIBILITY
       =============================================================== */

    sectionTitle: {
      fontSize: 16,
      fontWeight: "800",

      color: COLORS.lightText,

      marginTop: 15,
      marginBottom: 8,
    },

    ninCard: {
      backgroundColor: COLORS.lightSurface,

      borderRadius: RADIUS.xl,

      padding: 15,

      marginBottom: 15,

      borderWidth: 1,
      borderColor: COLORS.lightBorder,

      ...SHADOWS.subtle,
    },

    uploadBox: {
      minHeight: 130,

      borderWidth: 1.5,

      borderColor: COLORS.lightBorderStrong,

      borderStyle: "dashed",

      borderRadius: RADIUS.lg,

      paddingVertical: 30,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: COLORS.lightSurfaceSoft,
    },

    uploadTitle: {
      marginTop: 10,

      fontSize: 14,
      fontWeight: "700",

      color: COLORS.lightText,
    },

    uploadSub: {
      fontSize: 11,

      color: COLORS.lightTextMuted,

      marginTop: 4,
    },

    ninImage: {
      width: "100%",
      height: 180,

      borderRadius: RADIUS.lg,

      resizeMode: "cover",
    },

    ninActions: {
      flexDirection: "row",
      justifyContent: "space-between",

      marginTop: 10,
    },

    replaceBtn: {
      padding: 10,
    },

    replaceText: {
      color: COLORS.lightText,

      fontWeight: "700",
    },

    removeBtn: {
      padding: 10,
    },

    removeText: {
      color: COLORS.danger,

      fontWeight: "700",
    },

    /* ===============================================================
       THEME HELPER STYLES
       =============================================================== */

    lightContainer: {
      backgroundColor: COLORS.lightBackground,
    },

    lightSurface: {
      backgroundColor: COLORS.lightSurface,
    },

    lightText: {
      color: COLORS.lightText,
    },

    lightTextSecondary: {
      color: COLORS.lightTextSecondary,
    },

    lightBorder: {
      borderColor: COLORS.lightBorder,
    },
  });
};
