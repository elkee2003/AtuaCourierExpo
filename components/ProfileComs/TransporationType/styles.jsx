import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    // padding: 20,
  },

  // sectionTitle: {
  //   fontSize: 20,
  //   fontWeight: '700',
  //   marginBottom: 15,
  //   color: '#0F2D7A',
  // },

  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#333',
  },

  dropdown: {
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E6EF',
    marginBottom: 10,
  },

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
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E6EF',
    marginBottom: 12,
  },

  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2D7A',
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  photoButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 15,
  },

  imagePreviewContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  marginTop: 15,
  gap: 10,
},

previewImage: {
  width: 100,
  height: 100,
  borderRadius: 12,
  marginRight: 10,
  marginBottom: 10,
},
})

export default styles