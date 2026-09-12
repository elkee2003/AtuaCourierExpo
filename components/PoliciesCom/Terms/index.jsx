import Feather from "@expo/vector-icons/Feather";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createStyles } from "./styles";

/**
 * ================================================================
 * TERMS AND CONDITIONS
 * ================================================================
 *
 * Atua Terms & Conditions screen.
 *
 * The page uses the same visual language as the Privacy Policy:
 *
 * - SafeAreaView
 * - Light / dark theme support
 * - Structured legal sections
 * - Numbered section indicators
 * - Readable typography
 * - Dedicated support contact cards
 * - Single vertical ScrollView
 * ================================================================
 */

const TermAndConditions = () => {
  /**
   * ---------------------------------------------------------------
   * THEME
   * ---------------------------------------------------------------
   */

  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const styles = React.useMemo(() => createStyles(isDark), [isDark]);

  /**
   * ---------------------------------------------------------------
   * COPY EMAIL
   * ---------------------------------------------------------------
   */

  const copyEmail = async () => {
    try {
      await Clipboard.setStringAsync("support@atuainc.com");

      Alert.alert(
        "Copied",
        "The support email address has been copied to your clipboard.",
      );
    } catch (error) {
      console.log("Unable to copy email:", error);
    }
  };

  /**
   * ---------------------------------------------------------------
   * COPY PHONE
   * ---------------------------------------------------------------
   */

  const copyPhone = async () => {
    try {
      await Clipboard.setStringAsync("+234 704 296 1902");

      Alert.alert(
        "Copied",
        "The support phone number has been copied to your clipboard.",
      );
    } catch (error) {
      console.log("Unable to copy phone number:", error);
    }
  };

  /**
   * ---------------------------------------------------------------
   * POLICY / TERMS SECTION
   * ---------------------------------------------------------------
   */

  const TermsSection = ({ number, title, children }) => {
    return (
      <View style={styles.policySection}>
        <View style={styles.sectionHeading}>
          <View style={styles.sectionNumber}>
            <Text style={styles.sectionNumberText}>{number}</Text>
          </View>

          <Text style={styles.subHeader}>{title}</Text>
        </View>

        <View style={styles.sectionContent}>{children}</View>
      </View>
    );
  };

  /**
   * ---------------------------------------------------------------
   * BULLET
   * ---------------------------------------------------------------
   */

  const TermsBullet = ({ title, children }) => {
    return (
      <View style={styles.bulletRow}>
        <View style={styles.bullet}>
          <View style={styles.bulletDot} />
        </View>

        <Text style={styles.txt}>
          {title ? <Text style={styles.pointer}>{title}</Text> : null}

          {children}
        </Text>
      </View>
    );
  };

  /**
   * ---------------------------------------------------------------
   * SUBSECTION
   * ---------------------------------------------------------------
   *
   * Used for sections such as:
   *
   * For Senders
   * For Couriers
   */

  const TermsSubsection = ({ title, children }) => {
    return (
      <View style={styles.termsSubsection}>
        <View style={styles.termsSubsectionHeader}>
          <View style={styles.termsSubsectionIndicator} />

          <Text style={styles.txtSubBold}>{title}</Text>
        </View>

        <View style={styles.termsSubsectionContent}>{children}</View>
      </View>
    );
  };

  /**
   * ---------------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------------
   */

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {/* ========================================================
            HEADER
            ======================================================== */}

        <View style={styles.headerContainer}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" style={styles.backIcon} />
          </TouchableOpacity>

          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>Terms & Conditions</Text>

            <Text style={styles.headerSubtitle}>
              The rules governing your use of Atua
            </Text>
          </View>
        </View>

        {/* ========================================================
            CONTENT
            ======================================================== */}

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ======================================================
              INTRO CARD
              ====================================================== */}

          <View style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Feather name="file-text" style={styles.introIcon} />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>Please read carefully</Text>

              <Text style={styles.introText}>
                These Terms and Conditions govern your access to and use of
                Atua's services.
              </Text>
            </View>
          </View>

          {/* ======================================================
              1. INTRODUCTION
              ====================================================== */}

          <TermsSection number="01" title="Introduction">
            <Text style={styles.txt}>
              Welcome to Atua. By accessing or using our services, you agree to
              be bound by these Terms and Conditions. If you do not agree to
              these terms, you may not use our services.
            </Text>
          </TermsSection>

          {/* ======================================================
              2. NATURE OF PLATFORM
              ====================================================== */}

          <TermsSection number="02" title="Nature of the Platform">
            <Text style={styles.txt}>
              Atua provides a platform to connect couriers ("Couriers") with
              individuals or businesses ("Senders") who wish to send packages.
              Atua acts solely as a facilitator and is not a party to any
              agreements or contracts formed between Senders and Couriers.
            </Text>
          </TermsSection>

          {/* ======================================================
              3. REGISTRATION AND ACCOUNT
              ====================================================== */}

          <TermsSection number="03" title="Registration and Account">
            <TermsBullet title="Eligibility: ">
              You must be at least 18 years old to use the Platform.
            </TermsBullet>

            <TermsBullet title="Account Information: ">
              You agree to provide accurate and complete information when using
              our services.
            </TermsBullet>

            <TermsBullet title="Responsibility: ">
              Users are responsible for maintaining the confidentiality of their
              account credentials and for all activities under their account.
            </TermsBullet>
          </TermsSection>

          {/* ======================================================
              4. USER OBLIGATIONS
              ====================================================== */}

          <TermsSection number="04" title="User Obligations">
            {/* ==================================================
                SENDERS
                ================================================== */}

            <TermsSubsection title="For Senders">
              <TermsBullet>
                Ensure the package complies with all applicable laws and
                regulations.
              </TermsBullet>

              <TermsBullet>
                Provide accurate details of the package, and content.
              </TermsBullet>

              <TermsBullet>
                Ensure timely availability of the package for pickup by the
                Courier.
              </TermsBullet>
            </TermsSubsection>

            {/* ==================================================
                COURIERS
                ================================================== */}

            <TermsSubsection title="For Couriers">
              <TermsBullet>
                Comply with all applicable laws and regulations while delivering
                packages.
              </TermsBullet>

              <TermsBullet>
                Ensure timely and safe delivery of the package.
              </TermsBullet>

              <TermsBullet>
                Maintain professional conduct while interacting with Senders.
              </TermsBullet>
            </TermsSubsection>
          </TermsSection>

          {/* ======================================================
              5. PROHIBITED ITEMS
              ====================================================== */}

          <TermsSection number="05" title="Prohibited Items">
            <Text style={styles.txt}>
              Senders are prohibited from shipping/sending:
            </Text>

            <View style={styles.prohibitedNotice}>
              <View style={styles.prohibitedIconContainer}>
                <Feather name="alert-triangle" style={styles.prohibitedIcon} />
              </View>

              <Text style={styles.prohibitedNoticeText}>
                Items that are illegal, dangerous, or otherwise prohibited under
                applicable laws must not be sent through the Platform.
              </Text>
            </View>

            <TermsBullet>Illegal substances or items.</TermsBullet>

            <TermsBullet>Hazardous materials.</TermsBullet>

            <TermsBullet>
              Items prohibited by local or international laws.
            </TermsBullet>

            <TermsBullet>
              Perishable goods (unless explicitly agreed upon).
            </TermsBullet>
          </TermsSection>

          {/* ======================================================
              6. FEES AND PAYMENTS
              ====================================================== */}

          <TermsSection number="06" title="Fees and Payments">
            <TermsBullet title="For Senders: ">
              Fees for courier services are displayed at the time of booking and
              must be paid through the Platform.
            </TermsBullet>

            <TermsBullet title="For Couriers: ">
              Payment for services rendered will be processed through the
              Platform, subject to applicable transaction fees.
            </TermsBullet>
          </TermsSection>

          {/* ======================================================
              7. LIABILITY
              ====================================================== */}

          <TermsSection number="07" title="Liability">
            <Text style={styles.txt}>Atua is not responsible for:</Text>

            <TermsBullet>Damages, loss, or theft of packages.</TermsBullet>

            <TermsBullet>Delays in delivery.</TermsBullet>

            <TermsBullet>
              Any disputes between Senders and Couriers.
            </TermsBullet>
          </TermsSection>

          {/* ======================================================
              8. TERMINATION
              ====================================================== */}

          <TermsSection number="08" title="Termination">
            <Text style={styles.txt}>
              Atua reserves the right to suspend or terminate a User's account
              if they violate these Terms or engage in unlawful activities.
            </Text>
          </TermsSection>

          {/* ======================================================
              9. MODIFICATIONS
              ====================================================== */}

          <TermsSection number="09" title="Modifications of Terms">
            <Text style={styles.txt}>
              Atua reserves the right to modify these Terms at any time. Users
              will be notified of significant changes, and continued use of the
              Platform constitutes acceptance of the updated Terms.
            </Text>
          </TermsSection>

          {/* ======================================================
              10. GOVERNING LAW
              ====================================================== */}

          <TermsSection number="10" title="Governing Law">
            <View style={styles.governingLawCard}>
              <View style={styles.governingLawIconContainer}>
                <Feather name="globe" style={styles.governingLawIcon} />
              </View>

              <View style={styles.governingLawContent}>
                <Text style={styles.governingLawLabel}>
                  Applicable jurisdiction
                </Text>

                <Text style={styles.governingLawTitle}>
                  Federal Republic of Nigeria
                </Text>
              </View>
            </View>

            <Text style={styles.txt}>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria. Any disputes arising from or related to these Terms or
              the use of the platform shall be resolved exclusively in the
              courts of Nigeria.
            </Text>
          </TermsSection>

          {/* ======================================================
              11. CONTACT US
              ====================================================== */}

          <TermsSection number="11" title="Contact Us">
            <Text style={styles.txt}>
              If you have questions regarding these Terms, please contact us at:
            </Text>

            {/* ==================================================
                EMAIL SUPPORT
                ================================================== */}

            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.supportCard}
              onPress={copyEmail}
            >
              <View style={styles.supportIconContainer}>
                <Feather name="mail" style={styles.emailIcon} />
              </View>

              <View style={styles.supportTextContainer}>
                <Text style={styles.supportLabel}>Email support</Text>

                <Text style={styles.supportEmail}>support@atuainc.com</Text>
              </View>

              <View style={styles.copyIconContainer}>
                <Feather name="copy" style={styles.copyIcon} />
              </View>
            </TouchableOpacity>

            {/* ==================================================
                PHONE SUPPORT
                ================================================== */}

            <TouchableOpacity
              activeOpacity={0.78}
              style={styles.supportCard}
              onPress={copyPhone}
            >
              <View style={styles.supportIconContainer}>
                <Feather name="phone" style={styles.phoneIcon} />
              </View>

              <View style={styles.supportTextContainer}>
                <Text style={styles.supportLabel}>Phone support</Text>

                <Text style={styles.supportPhone}>+234 704 296 1902</Text>
              </View>

              <View style={styles.copyIconContainer}>
                <Feather name="copy" style={styles.copyIcon} />
              </View>
            </TouchableOpacity>
          </TermsSection>

          {/* ======================================================
              FOOTER
              ====================================================== */}

          <View style={styles.footer}>
            <View style={styles.footerIconContainer}>
              <Feather name="check-circle" style={styles.footerIcon} />
            </View>

            <Text style={styles.footerText}>
              By using Atua, you acknowledge that you have read and agreed to
              these Terms and Conditions.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default TermAndConditions;
