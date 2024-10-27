import { StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';

const userSearchStyles = StyleSheet.create({
    searchBarContainer: {
        width: '90%',
        marginTop: 10,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        height: 20,
        marginBottom: 40,
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent'
    },
    searchUserView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        marginVertical: 10,
        marginLeft: 10
    },
    searchUserPfp: {
        width: 35,
        height: 35,
        borderRadius: 20,
    },
    searchUserTextView: {
        marginLeft: 10,
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