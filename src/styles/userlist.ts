import { StyleSheet } from "react-native";
import * as Colors from '../constants/colors';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const userListStyles = StyleSheet.create({
    userView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: hp('1%'),
        marginLeft: wp('0.5%')
    },
    userPfp: {
        width: hp('5%'),
        height: hp('5%'),
        borderRadius: hp('2.5%'),
        borderWidth: hp('0.2%'),
        borderColor: Colors.mediumOrange,
    },
    userTextView: {
        marginLeft: wp('3%'),
        flexDirection: 'column',
        flex: 0.9
    },
    userFullName: {
        fontSize: 16,
        fontFamily: 'Futura',
        flex: 0.45,
    },
    userUsernameText: {
        fontSize: 14,
        fontFamily: 'Futura',
        color: Colors.mediumGray,
        flex: 0.45
    }
});

export default userListStyles;