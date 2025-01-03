import React, { useEffect } from "react";
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';
import Entypo from 'react-native-vector-icons/Entypo';
import * as Colors from '../constants/colors';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppContext } from "../AppContext";

const locationTags = ['Food', 'Vibes','Viewpoint', 'Shopping', 'Beach', 'Club', 'Other'];

const getLocationTagIcon = (locationTag: string) : JSX.Element => {
    const {theme, setTheme} = useAppContext();

    switch (locationTag) {
        case "Food":
            return (<Icon name="restaurant" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
        case "Vibes":
            return (<MaterialIcon name="emoji-emotions" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
        case "Viewpoint":
            return (<FontAwesome6 name="mountain-sun" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
        case "Shopping":
            return (<MaterialIcon name="shopping-bag" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
        case "Beach":
            return (<FontAwesome6 name="umbrella-beach" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
        case "Club":
            return (<Entypo name="drink" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
        default:
            return (<FontAwesome6 name="location-arrow" size={hp('2%')} color={theme === 'dark' ? Colors.white : Colors.black} style={{ flex: 0.15}}/>);
    }
}

export { locationTags, getLocationTagIcon }