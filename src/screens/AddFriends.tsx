import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, SearchBar } from '@rneui/themed';
import { acceptFriendRequest, deleteFriendRequest, getSearchUsers, getUser, getUserRequests } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Colors from '../constants/colors';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

const AddFriends = ({ route, navigation }: any) => {
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
            if (user_id) {
                const friendRequestData = await getUserRequests(user_id);
                setState({...state, friend_requests: friendRequestData.friend_requests});
            } else {
                navigation.navigate("Welcome");
            }
        }

        getFriendsState();
    }, []);

    const userView = (user: any, request: boolean) => {
        searchedUserCount--;
        return (
            <TouchableOpacity onPress={() => navigation.navigate("Profile", {user_id: user.user_id})} key={searchedUserCount}>
                { request ?
                    <View style={styles.searchUserView}>
                        <Image 
                            source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                            style={{...styles.searchUserPfp, flex: 0.1}} />
                        <View style={{...styles.searchUserTextView, flex: 0.6}}>
                            <Text style={styles.searchUserFullName}>{user.full_name}</Text>
                            <Text style={styles.searchUserUsernameText}>{user.username}</Text>
                        </View>
                        <Button 
                            title="Accept" 
                            color={Colors.white}
                            buttonStyle={styles.acceptButton}
                            titleStyle={{ color: Colors.white, fontWeight: '500', fontFamily: 'Sansation', fontSize: 13 }}
                            containerStyle={styles.acceptButtonContainer}
                            onPress={async () => {
                                user_id = await AsyncStorage.getItem("user_id");
                                if (user_id) await acceptFriendRequest(user.user_id, user_id);
                                setState({...state, friend_requests: state.friend_requests.filter((u: any) => u.user_id !== user.user_id)}) 
                            }}
                        />
                        <TouchableOpacity style={{flex: 0.1, marginRight: 3}} onPress={async () => { 
                            user_id = await AsyncStorage.getItem("user_id");
                            if (user_id) await deleteFriendRequest(user.user_id, user_id) 
                            setState({...state, friend_requests: state.friend_requests.filter((u: any) => u.user_id !== user.user_id)})
                        }}>
                            <MaterialIcon name="cancel" size={25} color={Colors.errorRed} />
                        </TouchableOpacity>
                    </View> 
                    :
                    <View style={styles.searchUserView}>
                        <Image 
                            source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                            style={{...styles.searchUserPfp, flex: 0.1}} />
                        <View style={{...styles.searchUserTextView, flex: 0.9}}>
                            <Text style={styles.searchUserFullName}>{user.full_name}</Text>
                            <Text style={styles.searchUserUsernameText}>{user.username}</Text>
                        </View>
                    </View>
                }
            </TouchableOpacity>
        )
    }

  return (
    <View style={{width: "100%", height: "100%"}}>
        <SearchBar 
            placeholder='Search...'
            value={state.search}
            round={true}
            autoCapitalize="none"
            lightTheme={true}
            containerStyle={styles.searchBarContainer}
            onChangeText={ async (text) => {
                if (text.length > 0) {
                    const users = await getSearchUsers(text);
                    searchedUserCount = users.users.length + 1;
                    setState({...state, search: text, queryUsers: users.users});
                } else {
                    setState({...state, search: "", queryUsers: []});
                }
        }}/>
        
        <ScrollView>
            { state.search.length === 0 ?
                <View style={{flex: 1}}>
                    { state.friend_requests && state.friend_requests.length > 0 ? <Text style={styles.friendRequestTitleText}>Friend Requests</Text> : null }
                    { state.friend_requests && state.friend_requests.length > 0 && state.friend_requests.map((user: any) => (
                        userView(user, true)
                    ))}
                </View> 
                :
                <View style={{flex: 1}}>
                    { state.queryUsers && state.queryUsers.length > 0 && state.queryUsers.map((user: any) => (
                        userView(user, false)
                    ))}
                </View>
            }
        </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
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
    acceptButton: {
        backgroundColor: Colors.mediumOrange
    },
    acceptButtonContainer: {
        width: '30%',
        height: '90%',
        flex: 0.2,
        borderRadius: 30,
        marginRight: 10
    },
});

export default AddFriends