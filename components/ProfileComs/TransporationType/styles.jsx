import { StyleSheet } from "react-native";

/**
 * ============================================================
 * ATUA COURIER
 * TRANSPORTATION TYPE DESIGN SYSTEM
 * ============================================================
 *
 * This stylesheet belongs specifically to TransportationType.
 *
 * The component lives in its own folder and therefore keeps its
 * own stylesheet.
 *
 * However, it is now designed specifically to be EMBEDDED inside
 * EditProfile.
 *
 * The important distinction is:
 *
 *     OWN STYLES
 *         ≠
 *     OWN SCREEN
 *
 * TransportationType owns its visual styling, but EditProfile
 * owns the page layout and scrolling.
 * ============================================================
 */

/* ================================================================
   SPACING
   ================================================================ */

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

/* ================================================================
   RADIUS
   ================================================================ */

const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  pill: 999,
};

/* ================================================================
   STYLE FACTORY
   ================================================================ */

export const createStyles = (isDark = false) => {
  /* ============================================================
     COLORS
     ============================================================ */

  const COLORS = {
    /* ------------------------------------------------------------
       LIGHT
       ------------------------------------------------------------ */

    lightBackground: "#F7F8FA",
    lightSurface: "#FFFFFF",
    lightSurfaceElevated: "#FFFFFF",
    lightSurfaceSoft: "#F3F5F7",

    lightInput: "#F8F9FB",
    lightInputFocused: "#FFFFFF",

    lightBorder: "#E3E7EB",
    lightBorderStrong: "#CDD3DA",

    lightText: "#171A1F",
    lightTextSecondary: "#626C78",
    lightTextMuted: "#8A9099",

    /* ------------------------------------------------------------
       DARK
       ------------------------------------------------------------ */

    darkBackground: "#0B0F14",
    darkSurface: "#121820",
    darkSurfaceElevated: "#181F28",
    darkSurfaceSoft: "#1D252F",

    darkInput: "#181F28",
    darkInputFocused: "#1D252F",

    darkBorder: "#29323D",
    darkBorderStrong: "#3A4551",

    darkText: "#F5F7FA",
    darkTextSecondary: "#A7B0BC",
    darkTextMuted: "#8A95A2",

    /* ------------------------------------------------------------
       COMMON
       ------------------------------------------------------------ */

    white: "#FFFFFF",
    black: "#000000",

    danger: "#DC2626",
    dangerDark: "#EF4444",
  };

  /* ============================================================
     ACTIVE THEME ALIASES
     ============================================================ */

  const background = isDark ? COLORS.darkBackground : COLORS.lightBackground;

  const surface = isDark ? COLORS.darkSurface : COLORS.lightSurface;

  const surfaceElevated = isDark
    ? COLORS.darkSurfaceElevated
    : COLORS.lightSurfaceElevated;

  const surfaceSoft = isDark ? COLORS.darkSurfaceSoft : COLORS.lightSurfaceSoft;

  const input = isDark ? COLORS.darkInput : COLORS.lightInput;

  const inputFocused = isDark
    ? COLORS.darkInputFocused
    : COLORS.lightInputFocused;

  const border = isDark ? COLORS.darkBorder : COLORS.lightBorder;

  const borderStrong = isDark
    ? COLORS.darkBorderStrong
    : COLORS.lightBorderStrong;

  const text = isDark ? COLORS.darkText : COLORS.lightText;

  const textSecondary = isDark
    ? COLORS.darkTextSecondary
    : COLORS.lightTextSecondary;

  const textMuted = isDark ? COLORS.darkTextMuted : COLORS.lightTextMuted;

  /* ============================================================
     SHADOWS
     ============================================================ */

  const shadowSubtle = {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: isDark ? 0.16 : 0.05,
    shadowRadius: 5,
    elevation: isDark ? 1 : 1,
  };

  const shadowElevated = {
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: isDark ? 0.28 : 0.09,
    shadowRadius: 12,
    elevation: isDark ? 4 : 3,
  };

  return StyleSheet.create({
    /* ==========================================================
       ROOT CONTAINER
       ========================================================== */

    /*
     * IMPORTANT:
     *
     * Do NOT use flex: 1 here.
     *
     * TransportationType is embedded inside the parent's
     * ScrollView. Giving the child flex: 1 can cause awkward
     * measurement behaviour and can contribute to the component
     * appearing empty.
     */
    container: {
      width: "100%",
      backgroundColor: "transparent",
    },

    /* ==========================================================
       CATEGORY SECTION
       ========================================================== */

    categoryGroup: {
      width: "100%",
      marginBottom: SPACING.md,
    },

    categoryHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: SPACING.sm,
    },

    categoryHeaderIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surfaceSoft,
      borderWidth: 1,
      borderColor: border,
      marginRight: 10,
    },

    categoryHeaderCopy: {
      flex: 1,
    },

    categoryTitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
      color: text,
    },

    categoryDescription: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: textSecondary,
    },

    /* ==========================================================
       DROPDOWN
       ========================================================== */

    dropdown: {
      minHeight: 52,
      width: "100%",
      paddingHorizontal: 14,
      backgroundColor: input,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: border,
      marginBottom: SPACING.md,
    },

    dropdownFocused: {
      backgroundColor: inputFocused,
      borderColor: isDark ? "#F5F7FA" : "#171A1F",
    },

    dropdownPlaceholder: {
      fontSize: 14,
      color: textMuted,
    },

    dropdownSelectedText: {
      fontSize: 14,
      fontWeight: "600",
      color: text,
    },

    dropdownItemText: {
      fontSize: 14,
      color: text,
    },

    /* ==========================================================
       DROPDOWN ITEMS
       ========================================================== */

    dropdownItem: {
      minHeight: 64,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: surfaceElevated,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: border,
    },

    dropdownItemCopy: {
      flex: 1,
      paddingRight: 10,
    },

    itemLabel: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: text,
    },

    itemDescription: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 14,
      color: textSecondary,
    },

    infoButton: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surfaceSoft,
      borderWidth: 1,
      borderColor: border,
    },

    infoIcon: {
      fontSize: 16,
      color: isDark ? "#AAB2C0" : "#69727E",
    },

    /* ==========================================================
       DETAIL SECTION
       ========================================================== */

    detailSection: {
      width: "100%",
      marginTop: 2,
      marginBottom: SPACING.sm,
    },

    /* ==========================================================
       DETAIL HEADER
       ========================================================== */

    detailHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
    },

    detailIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surfaceSoft,
      borderWidth: 1,
      borderColor: border,
      marginRight: 10,
    },

    detailHeaderCopy: {
      flex: 1,
    },

    detailTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: text,
    },

    detailSubtitle: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: textSecondary,
    },

    /* ==========================================================
       DETAIL CARD
       ========================================================== */

    /*
     * This is deliberately an INNER card.
     *
     * EditProfile already provides the outer formCard.
     *
     * Therefore this card is visually lighter and slightly
     * smaller so that the hierarchy is:
     *
     * EditProfile formCard
     *      ↓
     * Transportation controls
     *      ↓
     * Vehicle details card
     */
    detailCard: {
      width: "100%",
      padding: 14,
      borderRadius: RADIUS.lg,
      backgroundColor: surfaceElevated,
      borderWidth: 1,
      borderColor: border,
      ...shadowSubtle,
    },

    /* ==========================================================
       INPUT LABELS
       ========================================================== */

    inputLabel: {
      marginBottom: 7,
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "700",
      color: textSecondary,
    },

    /* ==========================================================
       TEXT INPUT
       ========================================================== */

    input: {
      width: "100%",
      minHeight: 50,

      paddingHorizontal: 13,
      paddingVertical: 11,

      marginBottom: 14,

      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: border,

      backgroundColor: input,

      fontSize: 14,
      lineHeight: 20,

      color: text,

      /*
       * Helps vertical text positioning behave consistently.
       */
      includeFontPadding: false,
    },

    /* ==========================================================
       DESCRIPTION INPUT
       ========================================================== */

    descriptionInput: {
      minHeight: 120,
      paddingTop: 13,
      paddingBottom: 13,
      textAlignVertical: "top",
    },

    /* ==========================================================
       PHOTO SECTION
       ========================================================== */

    photoSection: {
      marginTop: 2,
      width: "100%",
    },

    photoHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },

    photoHeaderCopy: {
      flex: 1,
      paddingRight: 10,
    },

    photoTitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
      color: text,
    },

    photoSubtitle: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: textSecondary,
    },

    /* ==========================================================
       PHOTO COUNT
       ========================================================== */

    photoCount: {
      minWidth: 30,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: RADIUS.pill,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: surfaceSoft,
      borderWidth: 1,
      borderColor: border,
    },

    photoCountText: {
      fontSize: 11,
      fontWeight: "800",
      color: text,
    },

    /* ==========================================================
       PHOTO BUTTON
       ========================================================== */

    photoButton: {
      minHeight: 62,
      width: "100%",

      flexDirection: "row",
      alignItems: "center",

      paddingHorizontal: 13,
      paddingVertical: 10,

      borderRadius: 14,

      /*
       * Black primary action in light mode.
       *
       * In dark mode we invert it to maintain contrast.
       */
      backgroundColor: isDark ? "#F5F7FA" : "#111418",

      marginTop: 2,
    },

    photoButtonIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      alignItems: "center",
      justifyContent: "center",

      backgroundColor: isDark ? "#171A1F" : "#2A2E34",

      marginRight: 10,
    },

    photoButtonCopy: {
      flex: 1,
      paddingRight: 8,
    },

    photoButtonText: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "800",

      color: isDark ? "#111418" : "#FFFFFF",
    },

    photoButtonSubtext: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 14,

      color: isDark ? "#59616C" : "#C8CDD3",
    },

    /* ==========================================================
       IMAGE PREVIEWS
       ========================================================== */

    imagePreviewContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 12,
      gap: 9,
    },

    previewImageWrapper: {
      width: 92,
      height: 92,

      position: "relative",

      borderRadius: 13,
      overflow: "hidden",

      backgroundColor: surfaceSoft,

      borderWidth: 1,
      borderColor: border,
    },

    previewImage: {
      width: "100%",
      height: "100%",
    },

    /* ==========================================================
       IMAGE NUMBER BADGE
       ========================================================== */

    previewImageNumber: {
      position: "absolute",

      left: 6,
      bottom: 6,

      minWidth: 22,
      height: 22,

      paddingHorizontal: 5,

      borderRadius: 11,

      alignItems: "center",
      justifyContent: "center",

      backgroundColor: "rgba(0,0,0,0.68)",
    },

    previewImageNumberText: {
      fontSize: 9,
      fontWeight: "800",
      color: "#FFFFFF",
    },

    /* ==========================================================
       GENERAL TOUCH FEEDBACK SUPPORT
       ========================================================== */

    /*
     * Kept here so the component's stylesheet remains easy to
     * extend later without changing its architectural structure.
     */
    subtleShadow: {
      ...shadowSubtle,
    },

    elevatedShadow: {
      ...shadowElevated,
    },

    /* ==========================================================
       BOTTOM SPACING
       ========================================================== */

    /*
     * This is intentionally small because EditProfile already
     * supplies the overall bottom breathing room.
     */
    bottomSpacer: {
      height: SPACING.sm,
    },
  });
};

/*
 * Optional static export.
 *
 * The component itself uses:
 *
 *     createStyles(isDark)
 *
 * so this is only provided as a safe default for any other code
 * that might import the stylesheet without a theme argument.
 */
export default createStyles(false);
