import { StyleSheet } from "react-native";

const createStyles = (isDark = false) => {
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
    // --------------------------------------------------
    // SCREEN
    // --------------------------------------------------

    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    containerDark: {
      backgroundColor: colors.background,
    },

    keyboardAvoiding: {
      flex: 1,
    },

    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: 40,
    },

    // --------------------------------------------------
    // HEADER
    // --------------------------------------------------

    headerBlock: {
      marginBottom: spacing.xl,
    },

    header: {
      fontSize: 25,
      lineHeight: 31,
      fontWeight: "700",
      color: colors.text,
      letterSpacing: -0.3,
    },

    headerSubtitle: {
      marginTop: spacing.sm,
      fontSize: 14,
      lineHeight: 21,
      color: colors.secondary,
      maxWidth: 520,
    },

    // --------------------------------------------------
    // SECTIONS
    // --------------------------------------------------

    section: {
      marginBottom: spacing.xl,
    },

    sectionTitle: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.sm,
    },

    sectionSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      fontWeight: "400",
      color: colors.secondary,
      marginBottom: spacing.md,
    },

    label: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
      color: colors.secondary,
      marginBottom: spacing.sm,
    },

    // --------------------------------------------------
    // TRANSPORTATION DROPDOWN
    // --------------------------------------------------

    dropdown: {
      minHeight: 54,
      backgroundColor: colors.input,
      borderRadius: radius.md,
      paddingHorizontal: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
    },

    dropdownFocused: {
      borderColor: colors.borderStrong,
      backgroundColor: colors.inputFocused,
    },

    placeholderStyle: {
      fontSize: 15,
      color: colors.muted,
    },

    selectedTextStyle: {
      fontSize: 15,
      color: colors.text,
      fontWeight: "500",
    },

    dropdownItemContainer: {
      backgroundColor: colors.surface,
      borderBottomWidth: 0,
    },

    dropdownItemText: {
      fontSize: 15,
      color: colors.text,
    },

    dropdownItem: {
      minHeight: 52,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.surface,
    },

    dropdownItemCopy: {
      flex: 1,
      paddingRight: spacing.md,
    },

    itemLabel: {
      fontSize: 15,
      lineHeight: 20,
      color: colors.text,
      fontWeight: "500",
    },

    // --------------------------------------------------
    // INPUTS
    // --------------------------------------------------

    input: {
      minHeight: 54,
      backgroundColor: colors.input,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      marginBottom: spacing.md,
      fontSize: 15,
      color: colors.text,
    },

    descriptionInput: {
      minHeight: 110,
      backgroundColor: colors.input,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      marginTop: spacing.xs,
      fontSize: 15,
      lineHeight: 21,
      color: colors.text,
    },

    // --------------------------------------------------
    // MAXI INTRO
    // --------------------------------------------------

    maxiIntro: {
      marginBottom: spacing.md,
    },

    // --------------------------------------------------
    // MAXI VEHICLE GRID
    // --------------------------------------------------

    maxiVehicleGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
    },

    maxiVehicleCard: {
      width: "48.5%",
      backgroundColor: colors.surface,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: spacing.md,
      overflow: "hidden",

      shadowColor: colors.shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: isDark ? 0 : 0.05,
      shadowRadius: 5,
      elevation: isDark ? 0 : 2,
    },

    maxiVehicleCardSelected: {
      borderColor: colors.text,
      borderWidth: 1.5,
    },

    maxiVehicleImageWrapper: {
      height: 150,
      width: "100%",
      backgroundColor: colors.soft,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    },

    maxiVehicleImage: {
      width: "100%",
      height: "100%",
    },

    maxiSelectedBadge: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      width: 27,
      height: 27,
      borderRadius: radius.pill,
      backgroundColor: colors.text,
      alignItems: "center",
      justifyContent: "center",
    },

    maxiVehicleCopy: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
    },

    maxiVehicleTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 3,
    },

    maxiVehicleCapacity: {
      fontSize: 12,
      lineHeight: 17,
      fontWeight: "600",
      color: colors.secondary,
      marginBottom: spacing.xs,
    },

    maxiVehicleDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.muted,
    },

    // --------------------------------------------------
    // SELECTED VEHICLE SUMMARY
    // --------------------------------------------------

    selectedVehicleSummary: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.soft,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: radius.md,
      padding: spacing.md,
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
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
      fontWeight: "600",
      color: colors.muted,
      marginBottom: 2,
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },

    selectedVehicleSummaryValue: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700",
      color: colors.text,
    },

    selectedVehicleSummaryDescription: {
      fontSize: 12,
      lineHeight: 17,
      color: colors.secondary,
      marginTop: 2,
    },

    // --------------------------------------------------
    // VEHICLE INFORMATION
    // --------------------------------------------------

    vehicleInformationBlock: {
      marginTop: spacing.xs,
      marginBottom: spacing.xl,
    },

    // --------------------------------------------------
    // PHOTO SECTION
    // --------------------------------------------------

    photoSection: {
      marginTop: spacing.xs,
    },

    photoSectionTitle: {
      fontSize: 17,
      lineHeight: 23,
      fontWeight: "700",
      color: colors.text,
      marginBottom: spacing.xs,
    },

    photoSectionSubtitle: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.secondary,
      marginBottom: spacing.md,
    },

    photoButton: {
      minHeight: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.soft,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      borderRadius: radius.md,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
    },

    photoButtonText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
      marginLeft: spacing.sm,
    },

    loadingImagesText: {
      fontSize: 12,
      color: colors.muted,
      marginTop: spacing.sm,
    },

    savedImagesTitle: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "600",
      color: colors.secondary,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },

    imageGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginTop: spacing.xs,
    },

    imageItem: {
      width: "31.8%",
      height: 110,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      overflow: "hidden",
      backgroundColor: colors.soft,
      position: "relative",
    },

    previewImage: {
      width: "100%",
      height: "100%",
    },

    imageNumberBadge: {
      position: "absolute",
      left: spacing.sm,
      bottom: spacing.sm,
      minWidth: 24,
      height: 24,
      paddingHorizontal: 6,
      borderRadius: radius.pill,
      backgroundColor: "rgba(0,0,0,0.65)",
      alignItems: "center",
      justifyContent: "center",
    },

    imageNumberText: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: "700",
      color: colors.white,
    },

    // --------------------------------------------------
    // ERROR
    // --------------------------------------------------

    error: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.danger,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },

    // --------------------------------------------------
    // SAVE BUTTON
    // --------------------------------------------------

    saveButton: {
      minHeight: 54,
      backgroundColor: colors.text,
      borderRadius: radius.md,
      alignItems: "center",
      justifyContent: "center",
      marginTop: spacing.md,
      marginBottom: spacing.xl,
      paddingHorizontal: spacing.lg,
    },

    saveButtonDisabled: {
      opacity: 0.55,
    },

    saveButtonText: {
      color: colors.background,
      fontSize: 15,
      fontWeight: "700",
    },
  });
};

export default createStyles(false);
