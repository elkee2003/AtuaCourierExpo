import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import styles from "./styles";

const CustomButton = ({ text, onPress, loading }) => {
  return (
    <View>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>{text}</Text>
        )}
      </TouchableOpacity>

      {/* Google Sign in */}
      {/* <TouchableOpacity style={styles.btnGoogleCon}>
            <Text style={styles.btnGoogleTxt}>Sign In with Google</Text>
        </TouchableOpacity> */}

      {/* Secondary Buttons */}
      {/* <View style={styles.secBtnSection}>
            <TouchableOpacity >
                <Text style={styles.secBtnTxt}>Forgot Password ?</Text>
            </TouchableOpacity>
            <TouchableOpacity >
                <Text style={styles.secBtnTxt}>Create Account</Text>
            </TouchableOpacity>
        </View> */}
    </View>
  );
};

export default CustomButton;
