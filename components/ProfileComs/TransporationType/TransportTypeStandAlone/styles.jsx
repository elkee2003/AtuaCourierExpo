import { StyleSheet, } from 'react-native'

const styles = StyleSheet.create({
    container:{
        flex:1,
        marginTop:40,
        marginHorizontal:10,
    },
    header:{
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        margin: 10,
    },
    subHeader:{
        fontSize:17,
        fontWeight:'bold'
    },
    selectTransportTypeTxt:{
        fontSize:16,
        padding:10,
        color:'white',
        backgroundColor:'#1f1e1e',
    },
    dropdown: {
        height: 50,
        borderColor: '#ffffff',
        backgroundColor:'white',
        borderWidth: 2,
        // borderRadius: 20,
        paddingHorizontal: 8,
        marginVertical:10,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
    },
    placeholderStyle: {
        fontSize: 16,
        color:'grey'
    },
    selectedTextStyle: {
        fontSize: 16,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
    },
    // labelTxt:{
    //     color:'#02061b',
    //     fontSize:15,
    //     fontStyle:'italic',
    //     marginLeft:5,
    //     marginTop:10,
    //     marginBottom:10,
    // },
    dropdownItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal:10,
        alignItems: 'center',
        paddingVertical: 10,
    },
    itemLabel: {
        fontSize: 16,
        marginVertical:7,
    },
    input: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 5,
        fontSize:16,
        marginBottom:10,
    },
    addPhotoCon:{
        justifyContent:'center',
        alignItems:'center',
        alignSelf:'center',
        padding: 7,
        borderWidth:1,
        borderColor:'black',
        borderRadius:15,
        marginBottom:10,
    },
    addPhotoTxt:{
        fontSize:16,
        fontWeight:'bold',
        color:'#161616',
    },
    error:{
        color:'#d80b0b',
        fontSize:13,
        marginTop:-10,
        marginHorizontal:15,
        marginBottom:5,
    },
    btnCon:{
        marginTop:20,
        backgroundColor:'#0de90d',
        marginHorizontal:50,
        padding:10,
        justifyContent:'center',
        alignItems:'center',
        borderRadius:15,
    },
    btnTxt:{
        fontSize:25,
        fontWeight:'bold',
        textAlign:'center',
    },
})

export default styles;
