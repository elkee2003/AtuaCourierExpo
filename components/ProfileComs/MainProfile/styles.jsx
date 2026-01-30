import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  /* Header */
  header: {
    backgroundColor: '#111827',
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },

  signOutBtn: {
    flex:1,
    alignItems: 'center',
    justifyContent:'center',
    position: 'absolute',
    right: 20,
    top: 60,
  },

  signOut:{
    color:'#f89f9f',
  },

  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#fff',
    padding: 4,
    marginBottom: 12,
  },

  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 55,
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  role: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 2,
  },

  /* Cards */
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },

  /* Actions */
  actions: {
    marginTop: 24,
    marginHorizontal: 16,
  },

  primaryBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },

  primaryText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },

  secondaryBtn: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryText: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 15,
  },

  /* Settings */
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  settingText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111827',
  },
});
