import { View, Text } from 'react-native';
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import styles from './styles';
import {useOrderContext} from '@/providers/OrderProvider';

const BottomSheetDetails = () => {

    const {totalMins, totalKm, isPickedUp, user} = useOrderContext()

  return (
    <View style={{alignItems:'center'}}>
        <View style={styles.pickUpInfo}>
            <Text style={styles.bottomText}>{totalMins.toFixed(0)} {""}min</Text>
            <View style={styles.userBackground}>
            <FontAwesome name={'user'} color={'white'} size={20}/>
            </View>
            <Text style={styles.bottomText}>{totalKm.toFixed(1)} km</Text>
        </View>
        <Text style={styles.bottomTextStat}>{ isPickedUp ? 'Dropping Parcel' : 'Picking Up Parcel of'} {user?.firstName.length > 10 ? `${user?.firstName.substring(0, 10)}...` : user?.firstName}</Text>
    </View>
  )
}

export default BottomSheetDetails;