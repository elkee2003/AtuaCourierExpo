import { View, Text, Pressable} from 'react-native'
import React, {useState, useRef, useMemo} from 'react'
import BottomSheet, { BottomSheetView, BottomSheetFlatList} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import styles from './styles';
import HomeMap from '../HomeMap'
import BottomContainer from '../BottomContainer'
import OrderItem from '../../components/OrderItem'
import {orders} from '../../assets/data/orders'

const HomeComponent = () => {
  // useState Hooks
  const [isOnline, setIsOnline]= useState(false)
  const [myPosition, setMyPosition] = useState(null)
  const [avaliableOrders, setAvaliableOrders]= useState (orders)

  const bottomSheetRef = useRef(null)
  const snapPoints = useMemo(()=>['15%', '85%', '100%'], [])

  // Refferenced functions
  const onGoPress = () => {
    setIsOnline(!isOnline)
  }

  // Remove Order
  const onRemoveOrder = (id)=>{
    const filteredOrder = avaliableOrders.filter((order)=> order.id !== id)
    setAvaliableOrders(filteredOrder)
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      
      {/* later check if availableorder prop is necessary */}
      <HomeMap avaliableOrders={avaliableOrders}/>

      {/* Money Balance */}
      <View style={styles.balance}>
        <Text style={styles.balanceText}>
          <Text style={{color:'green'}}>₦</Text>
          {" "}
          0.00
        </Text>
      </View>


      {/* Go/End button */}
      {isOnline ?
        <Pressable onPress={onGoPress} style={styles.endButton}>
          <Text style={styles.endButtonText}>
            END
          </Text>
        </Pressable>
        :
        <Pressable onPress={onGoPress} style={styles.goButton}>
          <Text style={styles.goButtonText}>
            GO
          </Text>
        </Pressable>
      }
      <BottomSheet ref={bottomSheetRef}
      snapPoints={snapPoints} 
      index={0} 
      topInset={0} // Ensure no inset from the top
      handleIndicatorStyle={{backgroundColor:'#666768', width:80}}>
        <BottomContainer isOnline={isOnline}/>
        {isOnline && 
        <BottomSheetFlatList
        data={avaliableOrders}
        renderItem={({item})=><OrderItem 
            order={item} 
            // onAccept={onAccept}
            onRemoveOrder={onRemoveOrder}
        />}
        />
        }
      </BottomSheet>  
    </GestureHandlerRootView>
  )
}

export default HomeComponent