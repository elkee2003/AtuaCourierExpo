import { StyleSheet, Text, View, Dimensions } from 'react-native'

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    roundButton:{
        position:'absolute',
        backgroundColor: '#e0dddd',
        padding: 10,
        borderRadius:20,
    },
    goButton:{
        position: 'absolute',
        bottom:120, 
        right:Dimensions.get('window').width / 2 - 37,
        borderRadius:50,
        width:80,
        height: 80,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#09ff00',
        color:"black"
    },
    goButtonText:{
        fontWeight: 'bold',
        fontSize:35,
        color:'#181717',
    },
    endButton:{
        position: 'absolute',
        bottom:120, 
        right:Dimensions.get('window').width / 2 - 37,
        borderRadius:50,
        width:80,
        height: 80,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#ee030f',
        color:"black"
    },
    endButtonText:{
        fontWeight: 'bold',
        fontSize:30,
        color:'#181717',
    },
    balance:{
        position: 'absolute',
        top:40, 
        width:100,
        height:50,
        justifyContent:"center",
        alignItems:'center',
        right:Dimensions.get('window').width / 2 - 50,
        borderRadius:40,
        color:"black",
        backgroundColor: "black"
    },
    balanceText:{
        color:'white',
        fontWeight: 'bold',
        fontSize:25,
    },
})

export default styles
