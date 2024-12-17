import { StyleSheet } from 'react-native';
import * as Colors from '../constants/colors';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const userTagsStyles = StyleSheet.create({
    userTagsModal: {
        justifyContent: 'center',
    },
    userTagsModalView: {
        backgroundColor: 'white',
        padding: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        flex: 0.9,
    },
    userTagsModalHeader: {
        flexDirection: 'row',
        marginTop: 10,
        marginBottom: 10
    },
    userTagsModalTitle: {
        fontSize: 20,
        textAlign: 'center',
        fontFamily: 'ChunkFive',
    },
    userTagsModalText: {
        marginLeft: 10,
        fontSize: 14,
        fontFamily: 'ChunkFive',
        marginBottom: 5,
        marginTop: 15,
    },
});

export default userTagsStyles;