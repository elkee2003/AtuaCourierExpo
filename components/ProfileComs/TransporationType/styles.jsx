import { StyleSheet, } from 'react-native'

const styles = StyleSheet.create({
    container:{
        flex:1,
        marginHorizontal:10,
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
})

export default styles;
