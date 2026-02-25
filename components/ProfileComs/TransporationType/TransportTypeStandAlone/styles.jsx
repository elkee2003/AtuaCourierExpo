import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6FA',
    padding: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0F2D7A',
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },

sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F2D7A',
    marginBottom: 15,
},

sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
},

savedImagesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F2D7A',
    marginTop: 10,
    marginBottom: 8,
},

  dropdown: {
    height: 55,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E2E6EF',
    marginBottom: 15,
  },

  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6EF',
    marginBottom: 15,
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

  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2D7A',
    padding: 14,
    borderRadius: 12,
    marginTop: 5,
  },

  photoButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 15,
  },

  previewImage: {
    width: '48%',
    height: 150,
    borderRadius: 12,
    marginBottom: 10,
  },

  error: {
    color: '#d80b0b',
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: '#0F2D7A',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 25,
    marginBottom:40,
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
})

export default styles