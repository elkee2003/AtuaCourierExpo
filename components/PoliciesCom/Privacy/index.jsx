import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
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
 * PRIVACY POLICY
 * ================================================================
 *
 * This screen presents Atua's Privacy Policy in a clean,
 * readable legal-document layout.
 *
 * The page includes:
 *
 * - SafeAreaView
 * - Light / dark mode support
 * - Structured policy sections
 * - Terms & Conditions navigation
 * - Email and phone support
 * - Copy-to-clipboard actions
 * ================================================================
 */

const PrivacyPolicy = () => {
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
   * COPY SUPPORT EMAIL
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
   * COPY SUPPORT PHONE
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
   * NAVIGATE TO TERMS AND CONDITIONS
   * ---------------------------------------------------------------
   *
   * Change the route below if your Terms & Conditions screen lives
   * somewhere else in your Expo Router folder structure.
   */

  const goToTermsAndConditions = () => {
    router.push("/termsandconditions");
  };

  /**
   * ---------------------------------------------------------------
   * REUSABLE POLICY SECTION
   * ---------------------------------------------------------------
   */

  const PolicySection = ({ number, title, children }) => {
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
   * REUSABLE BULLET
   * ---------------------------------------------------------------
   */

  const PolicyBullet = ({ title, children }) => {
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
            <Text style={styles.header}>Privacy Policy</Text>

            <Text style={styles.headerSubtitle}>
              How Atua collects, uses and protects your information
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
              INTRODUCTION CARD
              ====================================================== */}

          <View style={styles.introCard}>
            <View style={styles.introIconContainer}>
              <Feather name="shield" style={styles.introIcon} />
            </View>

            <View style={styles.introContent}>
              <Text style={styles.introTitle}>Your privacy matters</Text>

              <Text style={styles.introText}>
                This policy explains how Atua handles information when you use
                our platform and services.
              </Text>
            </View>
          </View>

          {/* ======================================================
              1. INTRODUCTION
              ====================================================== */}

          <PolicySection number="01" title="Introduction">
            <Text style={styles.txt}>
              Atua values your privacy. This Privacy Policy explains how we
              collect, use, and share your information when you use our
              services.
            </Text>
          </PolicySection>

          {/* ======================================================
              2. INFORMATION WE COLLECT
              ====================================================== */}

          <PolicySection number="02" title="Information We Collect">
            <Text style={styles.txt}>From Senders and Couriers:</Text>

            <PolicyBullet title="Personal Information: ">
              Name, email address, phone number, and payment details.
            </PolicyBullet>

            <PolicyBullet title="Location Information: ">
              GPS data to facilitate package delivery.
            </PolicyBullet>

            <PolicyBullet title="Usage Information: ">
              Information about how you use the Platform.
            </PolicyBullet>
          </PolicySection>

          {/* ======================================================
              3. HOW WE USE INFORMATION
              ====================================================== */}

          <PolicySection number="03" title="How We Use Your Information">
            <PolicyBullet>
              To facilitate connections between Senders and Couriers.
            </PolicyBullet>

            <PolicyBullet>To process payments and payouts.</PolicyBullet>

            <PolicyBullet>
              To improve and personalize the Platform.
            </PolicyBullet>

            <PolicyBullet>
              To communicate with Users regarding updates and support.
            </PolicyBullet>
          </PolicySection>

          {/* ======================================================
              4. SHARING INFORMATION
              ====================================================== */}

          <PolicySection number="04" title="Sharing of Information">
            <Text style={styles.txt}>We may share your information:</Text>

            <PolicyBullet>
              With Couriers or Senders to facilitate delivery.
            </PolicyBullet>

            <PolicyBullet>
              With service providers to support Platform functionality.
            </PolicyBullet>

            <PolicyBullet>
              When required by law or to protect the rights of Atua.
            </PolicyBullet>
          </PolicySection>

          {/* ======================================================
              5. DATA SECURITY
              ====================================================== */}

          <PolicySection number="05" title="Data Security">
            <Text style={styles.txt}>
              Atua employs reasonable measures to protect User data. However, no
              method of transmission over the internet is entirely secure, and
              we cannot guarantee absolute security.
            </Text>
          </PolicySection>

          {/* ======================================================
              6. USER RIGHTS
              ====================================================== */}

          <PolicySection number="06" title="User Rights">
            <PolicyBullet title="Access and Update: ">
              Users can access and update their information through their
              account.
            </PolicyBullet>

            <PolicyBullet title="Deletion: ">
              Users can access and update their information through their
              account.
            </PolicyBullet>
          </PolicySection>

          {/* ======================================================
              7. COOKIES
              ====================================================== */}

          <PolicySection number="07" title="Cookies">
            <Text style={styles.txt}>
              The Platform uses cookies to enhance User experience and gather
              analytics. Users can manage cookie preferences through their
              browser settings.
            </Text>
          </PolicySection>

          {/* ======================================================
              8. THIRD-PARTY LINKS
              ====================================================== */}

          <PolicySection number="08" title="Third-Party Links">
            <Text style={styles.txt}>
              Our website or app may contain links to third-party websites. We
              are not responsible for the privacy practices of these websites
              and recommend reviewing their privacy policies.
            </Text>
          </PolicySection>

          {/* ======================================================
              9. CHANGES
              ====================================================== */}

          <PolicySection number="09" title="Changes to Privacy Policy">
            <Text style={styles.txt}>
              We may update this Privacy Policy from time to time. Significant
              changes will be communicated to Users, and continued use of the
              Platform constitutes acceptance of the updated policy.
            </Text>
          </PolicySection>

          {/* ======================================================
              LEGAL DOCUMENT NAVIGATION
              ====================================================== */}

          <View style={styles.legalNavigationCard}>
            <View style={styles.legalNavigationIconContainer}>
              <Feather name="file-text" style={styles.legalNavigationIcon} />
            </View>

            <View style={styles.legalNavigationContent}>
              <Text style={styles.legalNavigationTitle}>
                Terms & Conditions
              </Text>

              <Text style={styles.legalNavigationDescription}>
                Review the rules and conditions that govern your use of Atua.
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={goToTermsAndConditions}
              style={styles.legalNavigationButton}
            >
              <Feather
                name="arrow-right"
                style={styles.legalNavigationButtonIcon}
              />
            </TouchableOpacity>
          </View>

          {/* ======================================================
              10. CONTACT US
              ====================================================== */}

          <PolicySection number="10" title="Contact Us">
            <Text style={styles.txt}>
              If you have any questions about this Privacy Policy or your
              personal data, please contact us at:
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
                <Fontisto name="email" style={styles.emailIcon} />
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
          </PolicySection>

          {/* ======================================================
              FOOTER
              ====================================================== */}

          <View style={styles.footer}>
            <View style={styles.footerIconContainer}>
              <Feather name="shield" style={styles.footerIcon} />
            </View>

            <Text style={styles.footerText}>
              Atua is committed to protecting the privacy and security of its
              users.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default PrivacyPolicy;
