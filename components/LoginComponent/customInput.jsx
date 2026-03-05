import { Ionicons } from "@expo/vector-icons";
import { Controller } from "react-hook-form";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import styles from "./styles";

const CustomInput = ({
  control,
  name,
  rules = {},
  placeholder,
  inputSub,
  secureTextEntry,
  isPasswordVisible,
  setIsPasswordVisible,
}) => {
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.inputLabel}>{inputSub}</Text>

      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={rules}
        render={({
          field: { value, onChange, onBlur },
          fieldState: { error },
        }) => (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, error && styles.errorBorder]}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                secureTextEntry={secureTextEntry}
                autoCapitalize="none"
              />

              {inputSub.includes("Password") && (
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye" : "eye-off"}
                    size={22}
                    color="#64748B"
                  />
                </TouchableOpacity>
              )}
            </View>

            {error && <Text style={styles.errorText}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

export default CustomInput;
