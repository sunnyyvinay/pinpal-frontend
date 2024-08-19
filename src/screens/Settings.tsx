import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Input, Header} from '@rneui/themed';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Colors from '../constants/colors';
import BackButton from '../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from '../services/user.service';

const Settings = ({ route, navigation }: any) => {
    const [userData, setUserData] = useState<any>({});

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const user_id  = await AsyncStorage.getItem("user_id");
                if (user_id) {
                    const userData = await getUser(user_id);
                    setUserData(userData.user);
                } else {
                    navigation.navigate("Welcome");
                }
            } catch (error) {
                console.log("Error fetching Settings data: ", error);
            } 
        }
        fetchUserData();
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.accountInfoView}>
                <Text>
                    Username
                </Text>
                <Text>
                    {userData.username}
                </Text>
            </View>
            <Button 
                title="LOG OUT" 
                color={Colors.white}
                buttonStyle={styles.logOutButton}
                titleStyle={{ color: Colors.white, fontWeight: '700', fontFamily: 'Sansation' }}
                containerStyle={styles.logOutButtonContainer}
                onPress={async () => {
                    await AsyncStorage.removeItem("user_id");
                    navigation.navigate("Welcome");
                }}
            />
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        alignContent: 'center',
        flex: 1,
        flexDirection: 'column',
        textAlign: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        alignSelf: 'flex-start',
        marginLeft: 15,
        fontFamily: 'Sansation',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    accountInfoView: {
        width: '90%',
        height: 30,
        backgroundColor: Colors.white,
    },
    logOutButton: {
        backgroundColor: Colors.mediumOrange
    },
    logOutButtonContainer: {
        width: '50%',
        marginTop: 20,
    }
});

export default Settings;