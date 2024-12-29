import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from '@rneui/themed';
import { acceptFriendRequest, deleteFriendRequest, getSearchUsers, getUserRequests } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Colors from '../constants/colors';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import userSearchStyles from '../styles/usersearch';
import {widthPercentageToDP as wp, heightPercentageToDP as hp} from 'react-native-responsive-screen';

const AddFriends = ({ route, navigation }: any) => {
    const [theme, setTheme] = React.useState('light');
    let user_id: string | null = '';
    let searchedUserCount: number = 0;
    type State = {
        search: string;
        friend_requests: any[];
        queryUsers: any[];
    }
    const [state, setState] = useState<State>({
        search: "",
        friend_requests: [],
        queryUsers: []
    });
    
    useEffect(() => {
        const getFriendsState = async () => {
            user_id = await AsyncStorage.getItem("user_id");
            setTheme(await AsyncStorage.getItem('theme') || 'light');
            if (user_id) {
                const friendRequestData = await getUserRequests(user_id);
                setState({...state, friend_requests: friendRequestData.friend_requests});
            } else {
                navigation.navigate("Welcome");
            }
        }

        getFriendsState();
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
              const users = await getSearchUsers(state.search);
              searchedUserCount = users.users.length + 1;
              setState({...state, queryUsers: users.users});
            } catch (error) {
              console.error(error);
            }
        };

        if (state.search.length > 0) {
            // Debounce the API call to avoid too many requests
            const timeoutId = setTimeout(() => {
                fetchData();
            }, 300);
            return () => clearTimeout(timeoutId);
        } else {
            setState({...state, search: "", queryUsers: []});
        }
    
      }, [state.search]);

    const userView = (user: any, request: boolean) => {
        searchedUserCount--;
        return (
            <TouchableOpacity onPress={() => navigation.navigate("Profile", {user_id: user.user_id})} key={searchedUserCount}>
                { request ?
                    <View style={userSearchStyles.searchUserView}>
                        <Image 
                            source={user && user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                            style={{...userSearchStyles.searchUserPfp, borderColor: theme === 'dark' ? Colors.mediumOrange : Colors.darkOrange}} />
                        <View style={{...userSearchStyles.searchUserTextView, flex: 0.6}}>
                            <Text style={{...userSearchStyles.searchUserFullName, color: theme === 'dark' ? Colors.white : Colors.black}}>{user && user.full_name}</Text>
                            <Text style={{...userSearchStyles.searchUserUsernameText, color: theme === 'dark' ? Colors.mediumGray : Colors.black}}>{user && user.username}</Text>
                        </View>
                        <TouchableOpacity style={{...styles.acceptView, backgroundColor: theme === 'dark' ? Colors.mediumOrange : Colors.darkOrange}} onPress={async () => {
                                try {
                                    user_id = await AsyncStorage.getItem("user_id");
                                    if (user_id) await acceptFriendRequest(user.user_id, user_id);
                                    setState({...state, friend_requests: state.friend_requests.filter((u: any) => u.user_id !== user.user_id)}) 
                                } catch (error) {
                                    console.error(error);
                                }
                            }}>
                            <Text style={styles.acceptViewText}>Accept</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{flex: 0.1, marginRight: wp('2%')}} onPress={async () => { 
                            try {
                                user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) await deleteFriendRequest(user.user_id, user_id) 
                                setState({...state, friend_requests: state.friend_requests.filter((u: any) => u.user_id !== user.user_id)})
                            } catch (error) {
                                console.error(error);
                            }
                        }}>
                            <MaterialIcon name="cancel" size={wp('6%')} color={Colors.errorRed} />
                        </TouchableOpacity>
                    </View> 
                    :
                    <View style={userSearchStyles.searchUserView}>
                        <Image 
                            source={user && user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                            style={{...userSearchStyles.searchUserPfp, borderColor: theme === 'dark' ? Colors.mediumOrange : Colors.darkOrange}} />
                        <View style={{...userSearchStyles.searchUserTextView}}>
                            <Text style={{...userSearchStyles.searchUserFullName, color: theme === 'dark' ? Colors.white : Colors.black}}>{user && user.full_name}</Text>
                            <Text style={{...userSearchStyles.searchUserUsernameText, color: theme === 'dark' ? Colors.mediumGray : Colors.black}}>{user && user.username}</Text>
                        </View>
                    </View>
                }
            </TouchableOpacity>
        )
    }

  return (
    <View style={{width: "100%", height: "100%", backgroundColor: theme === 'dark' ? Colors.darkBackground : Colors.white}}>
        <SearchBar 
            placeholder='Search...'
            value={state.search}
            round={true}
            autoCapitalize="none"
            lightTheme={theme === 'dark' ? false : true}
            containerStyle={userSearchStyles.searchBarContainer}
            onChangeText={(text) => setState({...state, search: text})}/>
        
        <ScrollView>
            { state.search.length === 0 ?
                <View style={{flex: 1}}>
                    { state && state.friend_requests && state.friend_requests.length > 0 ? <Text style={styles.friendRequestTitleText}>Friend Requests</Text> : null }
                    { state && state.friend_requests && state.friend_requests.length > 0 && state.friend_requests.map((user: any) => (
                        userView(user, true)
                    ))}
                </View> 
                :
                <View style={{flex: 1}}>
                    { state && state.queryUsers && state.queryUsers.length > 0 && state.queryUsers.map((user: any) => (
                        userView(user, false)
                    ))}
                </View>
            }
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
    friendRequestTitleText: {
        marginLeft: wp('5%'),
        fontSize: 18,
        fontFamily: 'ChunkFive',
        marginBottom: hp('0.5%'),
        marginTop: hp('1.5%')
    },
    acceptButton: {
        backgroundColor: Colors.mediumOrange
    },
    acceptView: {
        flex: 0.2,
        borderRadius: hp('3%'),
        marginRight: wp('2%'),
        backgroundColor: Colors.darkOrange,
        padding: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    acceptViewText: {
        color: Colors.white,
        fontWeight: '500',
        fontFamily: 'ChunkFive',
        fontSize: 14,
        textAlign: 'center'
    },
});

export default AddFriends