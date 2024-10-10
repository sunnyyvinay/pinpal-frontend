import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from '@rneui/base';
import { getUser, getUserFriends } from '../services/user.service';
import * as Colors from '../constants/colors';

function Friends(props: any): React.JSX.Element {
    const [friends, setFriends] = useState<any>([]);

    useEffect(() => {
        const user_id = props.route.params.id;
        const fetchUserFriends = async () => {
            try {
                if (user_id) {
                    var friendData = await getUserFriends(user_id);
                    for (let i = 0; i < friendData.friends.length; i++) {
                        var friend;
                        if (friendData.friends[i].source_id != user_id) {
                            friend = await getUser(friendData.friends[i].source_id);
                        } else {
                            friend = await getUser(friendData.friends[i].target_id);
                        }
                        friendData.friends[i] = {...friendData.friends[i], friend};
                    }
                    setFriends([...friendData.friends]);
                } else {
                    props.route.params.navigation.navigate("Welcome");
                }
            } catch (error) {
                console.log("Error fetching friend data: ", error);
            } 
        }
        fetchUserFriends();
        console.log(friends);
    }, []);
  return (
    <ScrollView style={{width: '100%', height: '100%'}}>
        {friends.map((friend: any, index: number) => (
            <TouchableOpacity onPress={() => props.navigation.navigate("Profile", {user_id: friend.friend.user.user_id})} key={index}>
                <View style={styles.friendView}>
                    <Image 
                        source={friend.profile_pic ? {uri: friend.friend.user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                        style={styles.friendPfp} />
                    <View style={styles.friendTextView}>
                        <Text style={styles.friendFullName}>{friend.friend.user.full_name}</Text>
                        <Text style={styles.friendUsernameText}>{friend.friend.user.username}</Text>
                    </View>
                </View>
        </TouchableOpacity>
        ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
    friendView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 10,
        marginLeft: 10
    },
    friendPfp: {
        width: 35,
        height: 35,
        borderRadius: 20,
        flex: 0.1
    },
    friendTextView: {
        marginLeft: 5,
        flexDirection: 'column',
        flex: 0.9
    },
    friendFullName: {
        fontSize: 16,
        fontFamily: 'Sansation',
        flex: 0.45,
    },
    friendUsernameText: {
        fontSize: 14,
        fontFamily: 'Sansation',
        color: Colors.lightGray,
        flex: 0.45
    }
});

export default Friends;