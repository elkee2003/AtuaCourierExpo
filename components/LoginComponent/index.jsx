import { View, Text, Image, Alert, ScrollView } from 'react-native';
import React, { useState } from 'react';
import Logo from '../../assets/images/Atua.png';
import CustomInput from './customInput';
import CustomButton from './customButtons';
import { useForm } from 'react-hook-form';
import styles from './styles';
import { signIn, signOut, fetchAuthSession } from 'aws-amplify/auth';
import { router } from 'expo-router';

const Index = () => {
  const { control, handleSubmit } = useForm();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignInPressed = async (data) => {
    const { email, password } = data;

    if (loading) return;

    setLoading(true);

    try {
      const { isSignedIn } = await signIn({ username: email, password });

      if (isSignedIn) {
        // ✅ Get user’s session to inspect role/group
        const session = await fetchAuthSession();
        const accessToken = session.tokens?.accessToken?.toString();

        if (!accessToken) {
          throw new Error('Unable to fetch access token.');
        }

        // Decode JWT payload
        const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]));
        const userGroups = tokenPayload['cognito:groups'] || [];
        const userRole = tokenPayload['custom:role'] || '';

        // Define which role is allowed in this app
        const allowedRole = 'courier';

        // ✅ Check if user belongs to this app
        if (userGroups.includes(allowedRole) || userRole === allowedRole) {
          router.push('/home');
        } else {
          Alert.alert(
            'Access Denied',
            `This account is registered as a "${userRole || userGroups[0] || 'different'}". Please use the correct app.`
          );
          await signOut();
        }
      }
    } catch (error) {
      console.log('Error signing in:', error);
      Alert.alert('Sign In Failed', error.message || 'Something went wrong.');
    }

    setLoading(false);
  };

  const onSignUpPressed = () => router.push('/login/signup');
  const onForgotPassword = () => router.push('/login/forgotpassword');

  return (
    <View style={styles.container}>
      {/* Logo */}
      <View style={styles.logoCon}>
        <Image source={Logo} style={styles.logo} />
      </View>

      {/* Header */}
      <View style={styles.titleCon}>
        <Text style={styles.title}>Sign In (Courier App)</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Email */}
        <CustomInput
          name="email"
          control={control}
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
              message: 'Invalid email format',
            },
          }}
          placeholder="Enter your Email"
          inputSub="Email"
        />

        {/* Password */}
        <CustomInput
          name="password"
          control={control}
          isPasswordVisible={isPasswordVisible}
          setIsPasswordVisible={setIsPasswordVisible}
          rules={{
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters long.',
            },
            validate: (value) => {
              const hasNumber = /\d/.test(value);
              if (!hasNumber) {
                return 'Password must include at least one number';
              }
              return true;
            },
          }}
          placeholder="Enter your Password"
          inputSub="Password"
          secureTextEntry={!isPasswordVisible}
        />

        {/* Policy */}
        <View style={styles.policyContainer}>
          <Text style={styles.policyTxt}>
            Kindly review the{' '}
            <Text
              style={styles.policyLink}
              onPress={() => router.push('/termsandconditions')}
            >
              Terms of Use{' '}
            </Text>
            and{' '}
            <Text
              style={styles.policyLink}
              onPress={() => router.push('/privacypolicy')}
            >
              Privacy Policy
            </Text>{' '}
            before going further.
          </Text>
        </View>

        {/* Buttons */}
        <CustomButton
          text={loading ? 'Loading...' : 'Sign In'}
          onPress={handleSubmit(onSignInPressed)}
        />

        {/* Forgot Password & Create Account */}
        <View style={styles.secBtnSection}>
          <CustomButton
            text="Forgot Password?"
            onPress={onForgotPassword}
            type="SECONDARY"
          />
          <CustomButton
            text="Create Account"
            onPress={onSignUpPressed}
            type="SECONDARY"
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default Index;
