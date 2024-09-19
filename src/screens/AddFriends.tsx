import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SearchBar } from '@rneui/themed';
import { getSearchUsers, getUser, getUserRequests } from '../services/user.service';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Colors from '../constants/colors';

const AddFriends = ({ route, navigation }: any) => {
    let user_id: string | null = '';
    type State = {
        search: string;
        friend_requests: [];
        queryUsers: [];
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

    const getUserFromRequest = async (request: any) => {
        const user = await getUser(request.source_id);
        return user.user;
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
                    { state.friend_requests.length > 0 ? <Text style={styles.friendRequestTitleText}>Friend Requests</Text> : null }
                </View> 
                :
                <View style={{flex: 1}}>
                    { state.queryUsers && state.queryUsers.length > 0 && state.queryUsers.map((user: any) => (
                        <TouchableOpacity>
                            <View style={styles.searchUserView}>
                                <Image source={user.profile_pic ? {uri: user.profile_pic} : require('../../assets/images/default-pfp.jpg')} style={styles.searchUserPfp} />
                                <View style={styles.searchUserTextView}>
                                    <Text style={styles.searchUserFullName}>{user.full_name}</Text>
                                    <Text style={styles.searchUserUsernameText}>{user.username}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
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
    }
});

export default AddFriends