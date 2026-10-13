import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import styles from "./styles";

const BackgroundLocationDisclosureModal = ({ visible, onAgree, onDecline }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDecline}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>📍</Text>
            </View>

            <Text style={styles.title}>Background Location Access</Text>

            <Text style={styles.description}>
              Atua Courier collects your precise location while you are online,
              including when the app is running in the background or your phone
              is locked.
            </Text>

            <Text style={styles.description}>
              Your location helps us show your position, deliver relevant
              delivery requests, and update your live location during
              deliveries.
            </Text>

            <Text style={styles.description}>
              Background location access is required to use courier features
              while online. If you do not agree, you can remain offline. You can
              also go offline in the app to stop active background tracking.
            </Text>

            <View style={styles.privacyNote}>
              <Text style={styles.privacyNoteText}>
                <Text style={styles.boldText}>What you need to do:</Text>
                {"\n\n"}
                After tapping "Agree and Continue", your phone will ask you to
                grant location permission. To allow Atua Courier to access your
                location while you are online, open your phone's Settings and
                follow these steps:
                {"\n\n"}
                1. Select <Text style={styles.boldText}>Apps</Text> or
                <Text style={styles.boldText}> App management</Text>.{"\n"}
                2. Select <Text style={styles.boldText}>Atua Courier</Text>.
                {"\n"}
                3. Tap <Text style={styles.boldText}>Permissions</Text>, then{" "}
                <Text style={styles.boldText}>Location</Text>.{"\n"}
                4. Select{" "}
                <Text style={styles.boldText}>Allow all the time</Text>.{"\n\n"}
                The exact steps may vary depending on your phone. If you cannot
                find this option, check your phone's app permission settings.
                You must grant the required permission to go online as a
                courier.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.agreeButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onAgree}
              accessibilityRole="button"
            >
              <Text style={styles.agreeButtonText}>Agree and Continue</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.declineButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={onDecline}
              accessibilityRole="button"
            >
              <Text style={styles.declineButtonText}>Not Now</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default BackgroundLocationDisclosureModal;
