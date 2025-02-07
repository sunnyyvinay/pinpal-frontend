import { StyleSheet } from 'react-native';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const userTagsStyles = StyleSheet.create({
    userTagsModal: {
        justifyContent: 'center',
    },
    userTagsModalView: {
        backgroundColor: 'white',
        padding: hp('1%'),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: hp('1%'),
        flex: 0.8,
    },
    userTagsModalHeader: {
        flexDirection: 'row',
        marginTop: hp('1%'),
        marginBottom: hp('3%'),
    },
    userTagsModalTitle: {
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'Futura',
    },
    userTagsModalText: {
        marginLeft: wp('5%'),
        fontSize: 14,
        fontFamily: 'Futura',
        marginBottom: hp('0.5%'),
        marginTop: hp('1.5%'),
    },
});

export default userTagsStyles;