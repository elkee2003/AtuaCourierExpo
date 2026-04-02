import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginVertical: 8,
    padding: 16,
    borderRadius: 18,

    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  type: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },

  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00A86B',
  },

  addressContainer: {
    marginVertical: 10,
  },

  label: {
    fontSize: 12,
    color: '#888',
    marginTop: 6,
  },

  address: {
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },

  timer: {
    color: '#FF3B30',
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  acceptBtn: {
    backgroundColor: '#00C853',
    padding: 10,
    borderRadius: 10,
  },

  declineBtn: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 10,
  },
});