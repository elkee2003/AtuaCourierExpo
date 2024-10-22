import { StyleSheet, } from 'react-native'

const styles = StyleSheet.create({
    container:{
        flex:1,
    },
    dropdown: {
        height: 50,
        borderColor: '#ffffff',
        backgroundColor:'white',
        borderWidth: 2,
        // borderRadius: 20,
        paddingHorizontal: 8,
        marginBottom:10,
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
        alignItems: 'center',
        paddingVertical: 10,
    },
    infoIcon:{
        fontSize:20,
        color:'grey',
        marginRight:10,
    },
    itemLabel: {
        fontSize: 16,
        margin:7,
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
    }
    // addPhotoBtn:{
    //     fontSize:30,
    //     color:'#161616',
    // }
})

export default styles;
