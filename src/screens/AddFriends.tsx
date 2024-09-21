import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, SearchBar } from '@rneui/themed';
import { acceptFriendRequest, deleteFriendRequest, getSearchUsers, getUser, getUserRequests } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Colors from '../constants/colors';
import Icon from '@react-native-vector-icons/ionicons';

const AddFriends = ({ route, navigation }: any) => {
    let user_id: string | null = '';
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
                setState({...state, friend_requests: friendRequestData});
            } else {
                navigation.navigate("Welcome");
            }
        }

        getFriendsState();
    }, []);

    const userView = (user: any, request: boolean) => {
        return (
            <TouchableOpacity onPress={() => navigation.navigate("Profile", {user_id: user.user_id})}>
            <View style={styles.searchUserView}>
                <Image source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.searchUserPfp} />
                <View style={styles.searchUserTextView}>
                    <Text style={styles.searchUserFullName}>{user.full_name}</Text>
                    <Text style={styles.searchUserUsernameText}>{user.username}</Text>
                </View>
                { request && 
                    <View>
                        <Button 
                            title="Accept" 
                            color={Colors.white}
                            buttonStyle={styles.acceptButton}
                            titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                            containerStyle={styles.acceptButtonContainer}
                            onPress={async () => { 
                                if (user_id) await acceptFriendRequest(user.user_id, user_id);
                                setState({...state, friend_requests: state.friend_requests.filter((u: any) => u.user_id !== user.user_id)}) 
                            }}
                        />
                        <TouchableOpacity onPress={async () => { 
                            if (user_id) await deleteFriendRequest(user.user_id, user_id) 
                            setState({...state, friend_requests: state.friend_requests.filter((u: any) => u.user_id !== user.user_id)})
                        }}>
                            <Icon name="remove-circle" size={20} color={Colors.errorRed} />
                        </TouchableOpacity>
                    </View>
                }
            </View>
            </TouchableOpacity>
        )
    }

  return (
    <View style={{width: "100%", height: "100%"}}>
        <SearchBar 
            placeholder='Search...'
            value={state.search}
            round={true}
            lightTheme={true}
            containerStyle={styles.searchBarContainer}
            onChangeText={ async (text) => {
                if (text.length > 0) {
                    const users = await getSearchUsers(text);
                    setState({...state, search: text, queryUsers: users.users});
                } else {
                    setState({...state, search: text, queryUsers: []});
                }
            }}/>
        
        <ScrollView>
            { state.search.length === 0 ?
                <View style={{flex: 1}}>
                    { state.friend_requests && state.friend_requests.length > 0 ? <Text style={styles.friendRequestTitleText}>Friend Requests</Text> : null }
                    { state.friend_requests && state.queryUsers.length > 0 && state.queryUsers.map((user: any) => (
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
        marginLeft: 5,
        fontSize: 18,
        fontFamily: 'Sansation',
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
        flex: 0.9,
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
        width: '50%',
        marginTop: 20,
    },
});

export default AddFriends