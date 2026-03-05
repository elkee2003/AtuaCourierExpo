import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import styles from "./styles";

const CustomButton = ({ onPress, text, loading }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>{text}</Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
