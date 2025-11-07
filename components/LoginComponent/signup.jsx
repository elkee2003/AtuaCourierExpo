import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import styles from './styles';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { router } from 'expo-router';
import { signUp } from 'aws-amplify/auth';

const SignupCom = () => {
  const [loading, setLoading] = useState(false);
  const [toggleCheckBox, setToggleCheckBox] = useState(false); 
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isPasswordRepeatVisible, setIsPasswordRepeatVisible] = useState(false);

  const { control, handleSubmit, formState:{ errors }, getValues } = useForm();

  const role = "courier"; // set per project (courier app / user app)

  const onSignUp = async (data) => {
    setLoading(true);
    const { email, password } = data;

    try {
      // Sign up user with custom:role attribute
      const { isSignUpComplete } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            'custom:role': role,
          },
          autoSignIn: true,
        },
      });

      // ✅ Navigate to confirm email page
      router.push({
        pathname: '/login/confirmemail',
        params: { username: email }
      });

    } catch (error) {
      // Show proper error
      Alert.alert('Error', error.message);
    }

    setLoading(false);
  };

  return (
    <View style={styles.containerP}>
      <View style={styles.titleCon}>
        <Text style={styles.title}>Create Account</Text>
      </View>

      <ScrollView>
        <View style={styles.inputSection}>
          <Text style={styles.inputSub}>Email</Text>
          <Controller
            name='email'
            control={control}
            defaultValue=''
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
                message: 'Invalid email format',
              },
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                autoCapitalize='none'
                placeholder='Enter your Email'
              />
            )}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

          <Text style={styles.inputSub}>Password</Text>
          <Controller
            name='password'
            control={control}
            defaultValue=''
            rules={{
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters long.' },
              validate: value => /\d/.test(value) || 'Password must include at least one number',
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={value}
                  secureTextEntry={!isPasswordVisible}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize='none'
                  placeholder='Enter your Password'
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Ionicons name={isPasswordVisible ? 'eye' : 'eye-off'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

          <Text style={styles.inputSub}>Confirm Password</Text>
          <Controller
            name='confirmPassword'
            control={control}
            defaultValue=''
            rules={{
              required: 'Please confirm your password',
              validate: value => value === getValues('password') || 'Passwords do not match'
            }}
            render={({ field: { value, onChange, onBlur } }) => (
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  value={value}
                  secureTextEntry={!isPasswordRepeatVisible}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize='none'
                  placeholder='Confirm your Password'
                />
                <TouchableOpacity onPress={() => setIsPasswordRepeatVisible(!isPasswordRepeatVisible)}>
                  <Ionicons name={isPasswordRepeatVisible ? 'eye' : 'eye-off'} size={24} color="grey" />
                </TouchableOpacity>
              </View>
            )}
          />
          {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>}
        </View>

        <View style={styles.policyContainerSignUp}>
          <Checkbox value={toggleCheckBox} onValueChange={setToggleCheckBox} />
          <Text style={styles.policyTxt}>
            I agree to the{' '}
            <Text style={styles.policyLink} onPress={() => router.push('/termsandconditions')}>Terms of Service</Text> and{' '}
            <Text style={styles.policyLink} onPress={() => router.push('/privacypolicy')}>Privacy Policy</Text>
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.btnCon} 
          onPress={handleSubmit(onSignUp)}
          disabled={!toggleCheckBox || loading}
        >
          <Text style={styles.btnTxt}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secBtnCon} onPress={()=>router.push('/login')}>
          <Text style={styles.secBtnTxt}>Sign In</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default SignupCom;
