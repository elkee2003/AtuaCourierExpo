import { View, Text } from 'react-native'
import React from 'react'
import {orders} from '../../../assets/data/orders'
import EditProfile from '@/components/ProfileComs/EditProfile'
import MainProfile from '../../../components/ProfileComs/MainProfile'
import { useProfileContext } from '@/providers/ProfileProvider'

const Profile = () => {

  const {dbUser} = useProfileContext()
  
  return (
    <View style={{flex:1}}>
      {/* Note that its mainprofile thats meant to be here */}
      {/* <MainProfile/> */}
      <EditProfile/>
    </View>
  )
}

export default Profile;