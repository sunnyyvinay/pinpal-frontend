import { StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const userSearchStyles = StyleSheet.create({
    searchBarContainer: {
        width: wp('90%'),
        marginTop: hp('1%'),
        alignSelf: 'center',
        backgroundColor: 'transparent',
        height: hp('5%'),
        marginBottom: hp('4%'),
        borderBottomColor: 'transparent',
        borderTopColor: 'transparent'
    },
    searchUserView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        marginVertical: hp('1%'),
        marginLeft: wp('5%')
    },
    searchUserPfp: {
        width: hp('4%'),
        height: hp('4%'),
        borderRadius: hp('2%'),
    },
    searchUserTextView: {
        marginLeft: wp('3%'),
        flexDirection: 'column'
    },
    searchUserFullName: {
        fontSize: 16,
        fontFamily: 'Futura',
        flex: 0.45,
    },
    searchUserUsernameText: {
        fontSize: 14,
        fontFamily: 'Futura',
        color: Colors.mediumGray,
        flex: 0.45,
    },
});

export default userSearchStyles;