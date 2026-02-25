import { StyleSheet, } from 'react-native'


const styles = StyleSheet.create({
    container:{
        flex:1,
        marginTop:30,
        marginHorizontal:10,
    },
    title: {
        fontSize: 30,
        fontWeight: "bold",
        textAlign: "center",
        margin: 10,
    },
    bckBtnCon:{
        position:'absolute',
        top:10,
        left:10,
    },
    bckBtnIcon:{
        fontSize:30,
        color:'black'
    },
    signoutBtn:{
        position:'absolute',
        top:10,
        right:15,
    },
    signoutTxt:{
        fontSize:16,       
        color:'#c90707',
    },
    profilePicWrapper: {
        alignItems: "center",
        marginVertical: 15,
    },

    profilePicContainer: {
        height: 150,
        width: 150,
        borderRadius: 75,
        backgroundColor: "#e0e0e0",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },

    img: {
        width: "100%",
        height: "100%",
        borderRadius: 75,
        resizeMode: "cover",
    },

    placeholderContainer: {
        justifyContent: "center",
        alignItems: "center",
    },

    addPhotoText: {
        marginTop: 5,
        fontSize: 14,
        color: "#555",
    },

    cameraIconContainer: {
        position: "absolute",
        bottom: 5,
        right: 5,
        backgroundColor: "#07a830",
        height: 35,
        width: 35,
        borderRadius: 17.5,
        justifyContent: "center",
        alignItems: "center",
        elevation: 3,
    },

    input: {
        marginBottom:10,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 5,
        fontSize:16,
    },
    inputLast: {
        marginTop: 10,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 5,
        fontSize:16,
    },
    error:{
        color:'#d80b0b',
        fontSize:13,
        marginTop:5,
        marginHorizontal:15,
        marginBottom:5,
    },
    nxtBtn:{
        backgroundColor:'#1a1b1a',
        marginTop:10,
        padding:2,
        marginHorizontal:80,
        marginBottom:10,
        alignItems:'center',
        borderRadius:30,
    },
    nxtBtnIcon:{
        fontSize:50,
        color:'#ffffff'
    },
    saveBtn:{
        backgroundColor:'#05c405',
        marginTop:10,
        padding:2,
        marginHorizontal:60,
        marginBottom:10,
        alignItems:'center',
        borderRadius:30,
    },
    saveBtnTxt:{
        fontSize:30,
        fontWeight:'bold',
        color:'#e9e6e6'
    },

    // Review data
    reviewContainer:{
        flex:1,
        marginTop:30,
        marginHorizontal:10,
    },

    reviewScrollContent: {
        paddingBottom: 30,
        
    },
    
    reviewProfileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        resizeMode: "cover",
    },
    

    reviewNinImage: {
        width: "100%",
        height: 200,
        borderRadius: 12,
        marginTop: 10,
        resizeMode: "cover",
    },

    maxiImages: {
        width: '48%',
        height: 150,
        borderRadius: 12,
        marginBottom: 10,
    },

    imageListContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    addGuarantorSub:{
        marginHorizontal:10,
        fontSize:20,
        fontWeight:'bold',
    },
    subHeader:{
        marginTop:15,
        fontSize:15,
        fontWeight:'bold',
    },
    inputReview:{
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        letterSpacing: 0.5,
        color: "white",
        backgroundColor: "#3b3b3b",
        borderRadius: 12,
        marginBottom: 10,
    },

    inputReviewLast:{
        paddingVertical: 10,
        paddingHorizontal: 15,
        fontSize: 18,
        letterSpacing: 0.5,
        color: "white",
        backgroundColor: "#3b3b3b",
        borderRadius: 12,
        marginBottom: 30,
    },

    // NIN styles
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 8,
    },

    ninCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3, // Android shadow
        shadowColor: "#000", // iOS shadow
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },

    uploadBox: {
        borderWidth: 1.5,
        borderColor: "#07a830",
        borderStyle: "dashed",
        borderRadius: 10,
        paddingVertical: 30,
        alignItems: "center",
        justifyContent: "center",
    },

    uploadTitle: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "600",
    },

    uploadSub: {
        fontSize: 13,
        color: "#777",
        marginTop: 4,
    },

    ninImage: {
        width: "100%",
        height: 180,
        borderRadius: 10,
        resizeMode: "cover",
    },

    ninActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
    },

    replaceBtn: {
        padding: 10,
    },

    replaceText: {
        color: "#07a830",
        fontWeight: "bold",
    },

    removeBtn: {
        padding: 10,
    },

    removeText: {
        color: "#c90707",
        fontWeight: "bold",
    },

    // Bank styles
    bankContainer: {
        zIndex: 3000, // VERY IMPORTANT
    },
    autocompleteContainer: {
        zIndex: 1000, 
        backgroundColor: "#fff",
        borderRadius: 5,
        marginBottom:10,
    },

    inputContainerStyle:{
        backgroundColor: "transparent",
    },

    autocompleteInput: {
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#fff",
        marginBottom:10,
    },

    autocompleteList: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        marginTop: 5,
    },

    rightButtonsContainerStyle:{
        backgroundColor: "#fff",
        borderRadius: 5,
    },

    bankLastInput: {
        marginBottom:8,
        backgroundColor: "white",
        padding: 15,
        borderRadius: 5,
        fontSize:16,
    },

    success: {
        color: "green",
        marginTop: 10,
    },
  
  })

export default styles
