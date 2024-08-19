import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
    bottomContainer:{
        height: 100,
        backgroundColor:'#121311',
        borderTopLeftRadius:50,
        borderTopRightRadius:50,
        flexDirection: 'row',
        justifyContent:'center',
        alignItems:"center",
        padding:15,
    },
    bottomText:{
        fontSize:24,
        fontWeight:'bold',
        color:'#111111'
    },
    
    bottomTextOffline:{
        fontSize:24,
        fontWeight:'bold',
        color:'#f80b0b'
    },
    pendingOrderText:{
        fontSize:18,
        color:'#c01c10',
        textAlign:'center',
        fontWeight:'bold',
    },
    // pickUpInfo:{
    //     flexDirection:'row',
    //     alignItems:"center",
    // },
    // isFinished:{
    //     flexDirection:'row',
    //     alignItems:"center",
    //     justifyContent:'center',
    //     backgroundColor:'#000000',
    //     borderRadius:30,
    //     width:200,
    //     padding:5,
    //     marginVertical: 5,
    // },
    // isFinishedText:{
    //     fontSize:20,
    //     fontWeight:'bold',
    //     color:'white',
    // },
    // userBackground:{
    //     backgroundColor:'#07e5f5',
    //     borderRadius:70,
    //     width:30,
    //     height:30,
    //     alignItems:'center',
    //     justifyContent:'center',
    //     marginHorizontal:10,
    // },
    // userBackgroundDrop:{
    //     backgroundColor:'#09ff00',
    //     borderRadius:70,
    //     width:30,
    //     height:30,
    //     alignItems:'center',
    //     justifyContent:'center',
    //     marginHorizontal:10,
    // },
})

export default styles;