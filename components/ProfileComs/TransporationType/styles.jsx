import { StyleSheet } from "react-native";

export const createStyles = (isDark = false) => {
  // ============================================================
  // DESIGN TOKENS
  // ============================================================

  const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  };

  const radius = {
    sm: 8,
    md: 12,
    lg: 14,
    xl: 16,
    pill: 999,
  };

  // ============================================================
  // LIGHT THEME
  // ============================================================

  const light = {
    background: "#F7F8FA",
    surface: "#FFFFFF",
    elevated: "#FFFFFF",
    soft: "#F3F5F7",

    input: "#F8F9FB",
    inputFocused: "#FFFFFF",

    border: "#E3E7EB",
    borderStrong: "#CDD3DA",

    text: "#171A1F",
    secondary: "#626C78",
    muted: "#8A9099",

    white: "#FFFFFF",
    black: "#000000",

    danger: "#DC2626",

    shadowColor: "#000000",
  };

  // ============================================================
  // DARK THEME
  // ============================================================

  const dark = {
    background: "#0B0F14",
    surface: "#121820",
    elevated: "#181F28",
    soft: "#1D252F",

    input: "#181F28",
    inputFocused: "#1D252F",

    border: "#29323D",
    borderStrong: "#3A4551",

    text: "#F5F7FA",
    secondary: "#A7B0BC",
    muted: "#8A95A2",

    white: "#FFFFFF",
    black: "#000000",

    danger: "#EF4444",

    shadowColor: "#000000",
  };

  const colors = isDark ? dark : light;

  return StyleSheet.create({
    // ============================================================
    // ROOT
    // ============================================================

    container: {
      width: "100%",
      backgroundColor: "transparent",
    },

    // ============================================================
    // TRANSPORTATION CATEGORY
    // ============================================================

    categoryGroup: {
      width: "100%",
      marginBottom: spacing.xxl,
    },

    categoryHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.md,
    },

    categoryHeaderIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    categoryHeaderCopy: {
      flex: 1,
      paddingTop: 1,
    },

    categoryTitle: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },

    categoryDescription: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.secondary,
    },

    // ============================================================
    // DROPDOWN
    // ============================================================

    dropdown: {
      minHeight: 52,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
    },

    dropdownFocused: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.inputFocused,
    },

    dropdownPlaceholder: {
      fontSize: 14,
      color: colors.muted,
    },

    dropdownSelectedText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: "500",
    },

    dropdownItem: {
      backgroundColor: colors.surface,
      borderRadius: radius.md,
    },

    dropdownItemCopy: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },

    itemLabel: {
      fontSize: 14,
      lineHeight: 19,
      color: colors.text,
      fontWeight: "600",
      marginBottom: 2,
    },

    itemDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.secondary,
    },

    infoButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: "center",
      justifyContent: "center",
    },

    infoIcon: {
      color: colors.secondary,
    },

    // ============================================================
    // DETAIL SECTION
    // ============================================================

    detailSection: {
      width: "100%",
      marginBottom: spacing.xxl,
    },

    detailHeader: {
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: spacing.md,
    },

    detailIcon: {
      width: 36,
      height: 36,
      borderRadius: radius.md,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    detailHeaderCopy: {
      flex: 1,
      paddingTop: 1,
    },

    detailTitle: {
      fontSize: 16,
      lineHeight: 21,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },

    detailSubtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.secondary,
    },

    detailCard: {
      width: "100%",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      padding: spacing.lg,
    },

    // ============================================================
    // MAXI VEHICLE SELECTION INTRO
    // ============================================================

    vehicleSelectionIntro: {
      flexDirection: "row",
      alignItems: "flex-start",
      backgroundColor: colors.soft,
      borderRadius: radius.md,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },

    vehicleSelectionIntroIcon: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    vehicleSelectionIntroCopy: {
      flex: 1,
    },

    vehicleSelectionTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },

    vehicleSelectionSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.secondary,
    },

    // ============================================================
    // MAXI VEHICLE GRID
    // ============================================================

    maxiVehicleGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      width: "100%",
    },

    maxiVehicleCard: {
      width: "48.5%",
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.lg,
      overflow: "hidden",
      marginBottom: spacing.md,
    },

    maxiVehicleCardSelected: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.elevated,
    },

    maxiVehicleImageWrapper: {
      width: "100%",
      height: 130,
      backgroundColor: colors.soft,
      position: "relative",
      overflow: "hidden",
    },

    maxiVehicleImageWrapperSelected: {
      backgroundColor: colors.soft,
    },

    maxiVehicleImage: {
      width: "100%",
      height: "100%",
    },

    maxiVehicleSelectedBadge: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    maxiVehicleCardContent: {
      padding: spacing.md,
      position: "relative",
      minHeight: 130,
    },

    maxiVehicleCardTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },

    maxiVehicleCardTitleSelected: {
      fontWeight: "800",
    },

    maxiVehicleCardCapacity: {
      fontSize: 11,
      lineHeight: 16,
      fontWeight: "600",
      color: colors.secondary,
      marginBottom: 6,
    },

    maxiVehicleCardDescription: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.muted,
      paddingRight: spacing.sm,
    },

    maxiVehicleSelectionIndicator: {
      position: "absolute",
      right: spacing.md,
      bottom: spacing.md,
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.surface,
    },

    maxiVehicleSelectionIndicatorSelected: {
      borderColor: colors.text,
      backgroundColor: colors.text,
    },

    maxiVehicleSelectionDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.surface,
    },

    // ============================================================
    // SELECTED VEHICLE SUMMARY
    // ============================================================

    selectedVehicleSummary: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.soft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },

    selectedVehicleSummaryIcon: {
      width: 64,
      height: 48,
      borderRadius: radius.sm,
      backgroundColor: colors.surface,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
      overflow: "hidden",
    },

    selectedVehicleSummaryImage: {
      width: "100%",
      height: "100%",
    },

    selectedVehicleSummaryCopy: {
      flex: 1,
    },

    selectedVehicleSummaryLabel: {
      fontSize: 11,
      lineHeight: 15,
      color: colors.muted,
      marginBottom: 2,
    },

    selectedVehicleSummaryValue: {
      fontSize: 14,
      lineHeight: 19,
      color: colors.text,
      fontWeight: "700",
      marginBottom: 1,
    },

    selectedVehicleSummaryDescription: {
      fontSize: 11,
      lineHeight: 15,
      color: colors.secondary,
    },

    // ============================================================
    // VEHICLE INFORMATION
    // ============================================================

    vehicleInformationDivider: {
      height: 1,
      backgroundColor: colors.border,
      marginTop: spacing.sm,
      marginBottom: spacing.lg,
    },

    vehicleInformationHeading: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.md,
    },

    vehicleInformationDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.secondary,
      marginBottom: spacing.md,
    },

    // ============================================================
    // INPUTS
    // ============================================================

    inputLabel: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
      color: colors.secondary,
      marginBottom: spacing.sm,
    },

    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
      fontSize: 14,
      color: colors.text,
      marginBottom: spacing.md,
    },

    inputFocused: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.inputFocused,
    },

    descriptionInput: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      marginBottom: spacing.lg,
    },

    // ============================================================
    // PHOTO SECTION
    // ============================================================

    photoSection: {
      width: "100%",
      marginTop: spacing.sm,
    },

    photoHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.md,
    },

    photoHeaderCopy: {
      flex: 1,
      paddingRight: spacing.md,
    },

    photoTitle: {
      fontSize: 14,
      lineHeight: 19,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },

    photoSubtitle: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.secondary,
    },

    photoCount: {
      minWidth: 42,
      height: 28,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.pill,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
    },

    photoCountText: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: "700",
      color: colors.text,
    },

    // ============================================================
    // PHOTO BUTTON
    // ============================================================

    photoButton: {
      minHeight: 68,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      backgroundColor: colors.input,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },

    photoButtonIcon: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
      marginRight: spacing.md,
    },

    photoButtonCopy: {
      flex: 1,
    },

    photoButtonText: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 2,
    },

    photoButtonSubtext: {
      fontSize: 11,
      lineHeight: 16,
      color: colors.secondary,
    },

    // ============================================================
    // PHOTO PREVIEWS
    // ============================================================

    imagePreviewContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
      width: "100%",
    },

    previewImageWrapper: {
      width: "31.8%",
      aspectRatio: 1,
      borderRadius: radius.md,
      overflow: "hidden",
      backgroundColor: colors.soft,
      position: "relative",
      borderWidth: 1,
      borderColor: colors.border,
    },

    previewImage: {
      width: "100%",
      height: "100%",
    },

    previewImageNumber: {
      position: "absolute",
      left: 7,
      top: 7,
      minWidth: 22,
      height: 22,
      paddingHorizontal: 5,
      borderRadius: 11,
      backgroundColor: "rgba(0, 0, 0, 0.68)",
      alignItems: "center",
      justifyContent: "center",
    },

    previewImageNumberText: {
      fontSize: 10,
      lineHeight: 13,
      fontWeight: "700",
      color: colors.white,
    },

    previewImageRemove: {
      position: "absolute",
      right: 7,
      top: 7,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: "rgba(0, 0, 0, 0.72)",
      alignItems: "center",
      justifyContent: "center",
    },
  });
};
