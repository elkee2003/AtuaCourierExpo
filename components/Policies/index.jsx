import { View, Text, ScrollView } from 'react-native'
import React from 'react'
import styles from './styles'

const PoliciesCom = () => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
      <Text style={styles.header}>Terms and Conditions</Text>

      <Text style={styles.subHeader}>Introduction</Text>
      <Text style={styles.text}>
        Welcome to Atua. By accessing or using our services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, you may not use our services.
      </Text>

      <Text style={styles.subHeader}>Services Provided</Text>
      <Text style={styles.text}>
        Atua provides third party logistics and courier services including but not limited to parcel delivery, freight forwarding, and warehouse management. The scope of services is subject to change at our discretion.
      </Text>

      <Text style={styles.subHeader}>User Responsibilities</Text>
      <Text style={styles.text}>
        You agree to provide accurate and complete information when using our services.
        You are responsible for ensuring that any goods you ship comply with applicable laws and regulations.
        You agree not to ship prohibited items including but not limited to hazardous materials, illegal substances, and perishable goods without proper packaging.
      </Text>

      <Text style={styles.subHeader}>Liability and Insurance</Text>
      <Text style={styles.text}>
        Atua is not liable for loss or damage to goods unless due to our negligence.
      </Text>

      <Text style={styles.subHeader}>Prohibited Goods</Text>
      <Text style={styles.text}>
        You agree not to ship any prohibited goods, which include but are not limited to:

        Hazardous materials
        Illegal items (e.g., narcotics)
        Firearms and ammunition
        Perishable items without proper packaging
      </Text>

      <Text style={styles.subHeader}>Governing Law</Text>
      <Text style={styles.text}>
        These Terms and Conditions are governed by the laws of Country/State. Any disputes arising from the use of our services shall be settled in the courts of City/State.
      </Text>

      <Text style={styles.subHeader}>Changes to Terms</Text>
      <Text style={styles.text}>
        We reserve the right to modify these Terms and Conditions at any time. Any changes will be posted on our website and will become effective immediately.
      </Text>

      {/* Privacy Policy */}
      <Text style={styles.header}>Privacy Policy</Text>

      <Text style={styles.subHeader}>Introduction</Text>
      <Text style={styles.text}>
        This Privacy Policy explains how Atua collects, uses, and discloses your personal information when you use our services.
      </Text>

      <Text style={styles.subHeader}>Information We Collect</Text>
      <Text style={styles.text}>
        We collect the following types of information:

        Personal Information: Name, address, phone number, email, and payment details.
        Logistics Information: Package details (size, weight), delivery addresses, and tracking information.
        Technical Information: IP addresses, browser type, device information, and other data collected through cookies and analytics tools.
      </Text>

      <Text style={styles.subHeader}>
        How We Use Your Information
      </Text>
      <Text style={styles.text}>
        We use your personal information to:

        Provide and improve our logistics services.
        Process payments and fulfill orders.
        Communicate with you regarding your orders, shipments, or account.
        Send promotional offers (if you opt-in).
      </Text>

      <Text style={styles.subHeader}>
        How We Share Your Information
      </Text>
      <Text style={styles.text}>
        We may share your personal information with third parties in the following circumstances:

        Service Providers: We work with third-party companies (such as couriers, payment processors) to provide our services.
        Legal Requirements: If required by law, we may disclose your information to comply with legal obligations, court orders, or government regulations.
      </Text>

      <Text style={styles.subHeader}>
        Data Security
      </Text>
      <Text style={styles.text}>
        We implement security measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no online system is entirely secure, and we cannot guarantee the absolute security of your data.
      </Text>

      <Text style={styles.subHeader}>
        Data Retention
      </Text>
      <Text style={styles.text}>
        We retain your personal information only as long as necessary to provide our services and for legitimate business purposes, such as complying with legal obligations.
      </Text>

      <Text style={styles.subHeader}>Your Rights</Text>
      <Text style={styles.text}>
        You have the right to:

        Access the personal information we hold about you.
        Request corrections to inaccurate information.
        Request the deletion of your personal data.
        Opt-out of marketing communications.
        To exercise these rights, please contact us at [Your Email].
      </Text>

      <Text style={styles.subHeader}>
        Third-Party Links
      </Text>
      <Text style={styles.text}>
        Our website or app may contain links to third-party websites. We are not responsible for the privacy practices of these websites and recommend reviewing their privacy policies.
      </Text>

      <Text style={styles.subHeader}>Changes to Privacy Policy</Text>
      <Text style={styles.text}>
        We may update this Privacy Policy from time to time. Any changes will be posted on this page and will take effect immediately.
      </Text>

      <Text style={styles.subHeader}>Contact Information</Text>
      <Text style={styles.text}>
        If you have any questions or concerns about this Privacy Policy, please contact us at:

        Email: atuaincorporated.com
        Phone: +234-80-60-10-8660

      </Text>
    </ScrollView>
  )
}

export default PoliciesCom