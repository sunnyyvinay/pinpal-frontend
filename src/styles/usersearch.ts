import { StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';

const userSearchStyles = StyleSheet.create({
    searchBarContainer: {
        width: '90%',
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        height: 15,
        marginBottom: 30
    },
    friendRequestTitleText: {
        marginLeft: 10,
        fontSize: 18,
        fontFamily: 'Sansation',
        marginBottom: 5,
        marginTop: 15
    },
    searchUserView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        marginLeft: 10
    },
    searchUserPfp: {
        width: 35,
        height: 35,
        borderRadius: 20,
    },
    searchUserTextView: {
        marginLeft: 5,
        flexDirection: 'column'
    },
    searchUserFullName: {
        fontSize: 16,
        fontFamily: 'Sansation',
        flex: 0.45,
    },
    searchUserUsernameText: {
        fontSize: 14,
        fontFamily: 'Sansation',
        color: Colors.lightGray,
        flex: 0.45
    },
});

export default userSearchStyles;