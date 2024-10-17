import { View, Text } from 'react-native'
import React from 'react'
import {orders} from '../../../assets/data/orders'
import EditProfile from '@/components/ProfileComs/EditProfile'
import MainProfile from '../../../components/ProfileComs/MainProfile'
import { useAuthContext } from '@/providers/AuthProvider'

const Profile = () => {

  const {dbUser} = useAuthContext()
  
  return (
    <View style={{flex:1}}>
      {/* Note that its mainprofile thats meant to be here */}
      {dbUser ?
        <MainProfile/>
      :
        <EditProfile/>
      }
    </View>
  )
}

export default Profile;