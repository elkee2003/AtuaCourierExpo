import { StyleSheet } from "react-native"

const styles = StyleSheet.create({
    container:{
        marginHorizontal:10,
        marginTop:40,
    },
    details:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginBottom:15,
        gap:10,
        
    },
    icon:{
        backgroundColor:'#d2d5d8',
        borderRadius:25,
        borderWidth:2,
        borderColor:'#6bff08',
        justifyContent:'center',
        alignItems:'center',
        width:35,
        height:35,
    },
    rIcon:{
        backgroundColor:'#dae4e2',
        borderRadius:25,
        borderWidth:2,
        borderColor:'#2c1f1f',
        justifyContent:'center',
        alignItems:'center',
        width:50,
        height:50,
    },
    tDetails:{
        flex:1,
        fontSize:24,
        fontWeight:'bold',
        color:'#1d1b1b',
    },
    divider:{
        borderTopWidth:1,
        borderColor:'#333333',
        marginVertical:20,
    },
    receipientCard:{
        padding:5,
        borderRadius:10,
        backgroundColor:'#c0bfbf',
    },
    recipientHeader:{
        fontSize:30,
        fontWeight:'bold',
        marginRight:'auto',
        marginTop:20,
        marginBottom:15,
        marginLeft:15,
        color:'#474646',
    },
    acceptBtn:{
        marginVertical:30,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#6bff08',
        borderRadius:30,
        padding:5,
    },

    tBtn:{
        fontSize:30,
        fontWeight:'bold',
        textAlign:'center',
        color:'#1b1b1b'
    }
})

export default styles;