
import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:"#666768"
    },
    bottomSheet:{
        flex:1,
        backgroundColor:"#c2c0c0"
    },
    bottomText:{
        fontSize:24,
        fontWeight:'bold',
        color:'#111111'
    },
    bottomTextStat:{
        fontSize:22,
        color:'#c01c10'
    },
    bottomTextOff:{
        fontSize:24,
        fontWeight:'bold',
        color:'#f80b0b'
    },
    bckBtn:{
        position:'absolute',
        top:25,
        left:10,
        height:35,
        width:35,
        borderRadius:10,
        backgroundColor:'#d8d3d3',
        zIndex:2,
        justifyContent:'center',
        alignItems:'center'
    },
    bckBtnIcon:{
        fontSize:30,
        color:'#6e6d6d',
    },
    pendingOrderText:{
        fontSize:18,
        color:'#c01c10',
        textAlign:'center',
        fontWeight:'bold',
    },
    pickUpInfo:{
        flexDirection:'row',
        alignItems:"center",
    },
    isFinished:{
        flexDirection:'row',
        alignItems:"center",
        justifyContent:'center',
        backgroundColor:'#000000',
        borderRadius:30,
        width:200,
        padding:5,
        marginVertical: 5,
    },
    isFinishedText:{
        fontSize:20,
        fontWeight:'bold',
        color:'white',
    },
    userBackground:{
        backgroundColor:'#07e5f5',
        borderRadius:70,
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
        marginHorizontal:10,
    },
    userBackgroundDrop:{
        backgroundColor:'#09ff00',
        borderRadius:70,
        width:30,
        height:30,
        alignItems:'center',
        justifyContent:'center',
        marginHorizontal:10,
    },
   
})

export default styles 