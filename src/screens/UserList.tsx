import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from '@rneui/base';
import { getUser, getUserFriends, getPinLikes } from '../services/user.service';
import * as Colors from '../constants/colors';
import userListStyles from '../styles/userlist';

function UserList(props: any): React.JSX.Element {
    const [users, setUsers] = useState<any>([]);

    useEffect(() => {
        const user_id = props.route.params.id;
        const type = props.route.params.type;
        const fetchUsers = async () => {
            try {
                if (user_id) {
                    if (type == "Friends") {
                        let friendData = await getUserFriends(user_id);
                        friendData = friendData.friends;

                        for (let i = 0; i < friendData.length; i++) {
                            let friend;
                            if (friendData[i].source_id != user_id) {
                                friend = await getUser(friendData[i].source_id);
                            } else {
                                friend = await getUser(friendData[i].target_id);
                            }
                            // friendData[i] = {...friendData[i], friend};
                            friendData[i] = {...friendData[i], user: friend.user};
                        }
                        setUsers([...friendData]);
                    } else if (type == "Likes") {
                        let userData = await getPinLikes(user_id);
                        userData = userData.likes;
                        for (let i = 0; i < userData.length; i++) {
                            let user = await getUser(userData[i].user_id);
                            // userData[i] = {...userData[i], user};
                            userData[i] = {...userData[i], user: user.user};
                        }
                        setUsers([...userData]);
                    } else {
                        setUsers([]);
                    }
                } else {
                    props.navigation.navigate("Welcome");
                }
            } catch (error) {
                console.log("Error fetching user data: ", error);
            } 
        }
        fetchUsers();
    }, [props.route.params.id]);

    useLayoutEffect(() => {
        props.navigation.setOptions({
            title: props.route.params.type
        })
    }, []);

  return (
    <ScrollView style={{width: '100%', height: '100%', backgroundColor: Colors.white}}>
        {users.map((user: any, index: number) => (
            <TouchableOpacity onPress={() => props.navigation.navigate("Profile", {user_id: user.user.user_id})} key={index}>
                <View style={userListStyles.userView}>
                    <Image 
                        source={user.profile_pic ? {uri: user.user.profile_pic} : require('../../assets/images/default-pfp.jpg')} 
                        style={userListStyles.userPfp} />
                    <View style={userListStyles.userTextView}>
                        <Text style={userListStyles.userFullName}>{user.user.full_name}</Text>
                        <Text style={userListStyles.userUsernameText}>{user.user.username}</Text>
                    </View>
                </View>
        </TouchableOpacity>
        ))}
    </ScrollView>
  )
}

export default UserList;