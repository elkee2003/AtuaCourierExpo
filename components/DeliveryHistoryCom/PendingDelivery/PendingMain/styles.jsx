import { StyleSheet,} from 'react-native'

const styles = StyleSheet.create({
    container:{
        flex:1,
        marginTop:10,
        marginHorizontal:10,
    },
    loading:{
        flex:1,
        color:'#3cff00',
        justifyContent:'center',
        alignItems:'center',
    },
    title:{
        fontSize:30,
        fontWeight:'bold',
        textAlign:'center',
    },
    noPendingOrdersCon:{
        flex:1, 
        justifyContent:'center', 
        alignItems:'center',
    },
    noPendingOrders:{
        fontSize:30, 
        fontWeight:'bold', 
        color:'#afadad',
    }
})

export default styles;
