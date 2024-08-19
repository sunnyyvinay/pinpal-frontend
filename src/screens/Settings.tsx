import React, { useEffect, useState } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Input, Header} from '@rneui/themed';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import * as Colors from '../constants/colors';
import BackButton from '../components/BackButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUser } from '../services/user.service';

const Settings = ({ route, navigation }: any) => {
    const [userData, setUserData] = useState<any>({});
    const formattedBirthday = new Date(userData.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });;

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
                <View style={styles.fieldView}>
                    <View style={styles.textView}>
                        <Text style={{...styles.fieldText}}>
                            Username
                        </Text>
                        <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.lightGray}}>
                            {userData.username}
                        </Text>
                    </View>
                    <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
                </View>

                <View style={styles.fieldView}>
                    <View style={styles.textView}>
                        <Text style={{...styles.fieldText}}>
                            Full Name
                        </Text>
                        <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.lightGray}}>
                            {userData.full_name}
                        </Text>
                    </View>
                    <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
                </View>

                <View style={styles.fieldView}>
                    <View style={styles.textView}>
                        <Text style={{...styles.fieldText}}>
                            Birthday
                        </Text>
                        <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.lightGray}}>
                            {formattedBirthday}
                        </Text>
                    </View>
                    <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
                </View>

                <View style={styles.fieldView}>
                    <View style={styles.textView}>
                        <Text style={{...styles.fieldText}}>
                            Phone Number
                        </Text>
                        <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.lightGray}}>
                            {userData.phone_no}
                        </Text>
                    </View>
                    <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
                </View>

                <View style={styles.fieldView}>
                    <View style={styles.textView}>
                        <Text style={{...styles.fieldText}}>
                            Email
                        </Text>
                        <Text style={{...styles.fieldText, fontWeight: 'normal', color: Colors.lightGray}}>
                            {userData.email}
                        </Text>
                    </View>
                    <FeatherIcon name="edit-2" size={15} style={styles.fieldIcon} />
                </View>

                <View style={styles.fieldView}>
                    <View style={styles.textView}>
                        <Text style={{...styles.fieldText}}>
                            Change Your Password
                        </Text>
                    </View>
                    <MaterialIcon name="password" size={15} style={styles.fieldIcon} />
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
        marginTop: 10,
    },
    fieldView: {
        width: '90%',
        backgroundColor: Colors.white,
        flex: 1,
        flexDirection: 'row',
        borderRadius: 10,
        marginBottom: 10,
    },
    textView: {
        flex: 0.95,
        flexDirection: 'column',
        marginTop: 10,
        marginBottom: 10,
        marginLeft: 10,
    },
    fieldText: {
        fontFamily: 'Sansation',
        flex: 0.5,
    },
    fieldIcon: {
        flex: 0.05,
        alignSelf: 'center',
        marginRight: 5,
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