import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    // container: {
    //     justifyContent: 'center', // center vertically
    //     alignItems: 'center', // center horizontally
    //   },
      orderContainer: {
        flexDirection: 'row',
        backgroundColor: '#b8b7b7',
        margin:10,
        borderRadius: 22,
        padding:10
      },
      header:{
        fontSize:20,
        fontWeight:'bold',
      },
      subHeader:{
        fontSize:18,
        fontWeight:'bold',
      },
      txt:{
        color:'white', 
        fontSize:16,
      },
      detailsContainer: {
        flex: 1,
        marginLeft:10
      },
      details: {
        flexDirection: 'row',
        marginVertical: 2,
      },
      thumbs:{
        flexDirection:'row',
        gap:10,
        marginLeft:5
      },
      thumbsUp: {
        backgroundColor: '#365e36',
        borderBottomLeftRadius:20,
        borderTopLeftRadius:20,
        justifyContent: 'center',
        alignItems: 'center',
        padding:15,
      },
      thumbsDown: {
        backgroundColor: '#833030',
        borderBottomRightRadius:20,
        borderTopRightRadius:20,
        justifyContent: 'center',
        alignItems: 'center',
        padding:15,
      },
})

export default styles;