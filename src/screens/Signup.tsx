import React, {useState } from 'react';
import { Button } from '@rneui/themed';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { Image } from '@rneui/base';
import PhoneInput from 'react-phone-number-input/react-native-input'

const Signup = () => {
    const [phoneNo, setPhoneNo] = useState<string | undefined>();
    const [location, setLocation] = useState<string | undefined>();
    const [fullName, setFullName] = useState<string | undefined>();
    const [username, setUsername] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();

    return (
        <div className='align-content: center'>
            <LinearGradient colors={[Colors.darkOrange, Colors.lightOrange]}>
                <Image source={require('../assets/full-logo.png')} style={{tintColor: Colors.white, flex: 1, width: 150, height: 100, resizeMode: 'contain'}}/>
                <PhoneInput defaultCountry={'US'} placeholder="Enter phone number" value={phoneNo} onChange={(value: string | undefined) => {setPhoneNo(value)}} />
                <Button title="Next" />
            </LinearGradient>
        </div>
    
  )
}

export default Signup;