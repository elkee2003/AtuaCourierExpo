import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { useProfileContext } from '../../../providers/ProfileProvider';
import { useAuthContext } from '@/providers/AuthProvider';
import Placeholder from '../../../assets/images/placeholder.png';
import { getUrl } from 'aws-amplify/storage';
import { signOut } from 'aws-amplify/auth';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import styles from './styles';

const MainProfile = () => {
  const {
    firstName, lastName, phoneNumber, bankName, accountName, accountNumber, transportationType, profilePic, setProfilePic,
  } = useProfileContext();

  const { dbUser } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const onSignout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ],
    );
  };

  const fetchImageUrl = async () => {
    if (!dbUser?.profilePic || dbUser.profilePic.startsWith('http')) {
      setProfilePic(dbUser?.profilePic || null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await getUrl({
        path: dbUser.profilePic,
        options: { validateObjectExistence: true },
      });
      setProfilePic(result.url.toString());
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImageUrl();
  }, [dbUser?.profilePic]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.signOutBtn} onPress={onSignout}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.signOut}>Sign Out</Text>
        </TouchableOpacity>

        <View style={styles.avatarWrapper}>
          <Image
            source={
              loading || !profilePic
                ? Placeholder
                : { uri: profilePic }
            }
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>
          {firstName} {lastName}
        </Text>
        <Text style={styles.role}>Courier Partner</Text>
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <InfoRow 
          icon={<Ionicons name="call-outline" size={18} color="#6B7280" />}
          label="Phone" 
          value={phoneNumber} 
        />

        <InfoRow
          icon={<FontAwesome name="road" size={18} color="#6B7280" />}
          label="Vehicle Type"
          value={transportationType}
        />
        
        <InfoRow 
          icon={<Ionicons name="business-outline" size={18} color="#6B7280" />} 
          label="Bank" 
          value={bankName} 
        />

        <InfoRow 
          icon={<Ionicons name="person-outline" size={18} color="#6B7280" />}  
          label="Account Name" 
          value={accountName} 
        />

        <InfoRow 
          icon={<Ionicons name="card-outline"  size={18} color="#6B7280" />}  
          label="Account Number" 
          value={accountNumber} 
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.push('/profile/editprofile')}
        >
          <Text style={styles.primaryText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push('/profile/reviewinfo/reviewcourier')}
        >
          <Text style={styles.secondaryText}>View Full Info</Text>
        </TouchableOpacity>
      </View>

      {/* Settings */}
      <View style={styles.card}>
        <SettingItem
          label="Transportation Type"
          onPress={() => router.push('/transportationtype')}
        />
        <SettingItem
          label="Policies & Terms"
          onPress={() => router.push('/policies')}
        />
      </View>
    </ScrollView>
  );
};

export default MainProfile;

/* ---------- Small Components ---------- */

const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    {icon}
    <View style={{ marginLeft: 12 }}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  </View>
);

const SettingItem = ({ label, onPress }) => (
  <TouchableOpacity style={styles.settingItem} onPress={onPress}>
    <Text style={styles.settingText}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
  </TouchableOpacity>
);
