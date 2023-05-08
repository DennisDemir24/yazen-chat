import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react'

const JoinScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');

    const onPressJoin = () => {
        navigation.navigate('ChatRoom', { userId: new Date().getTime(), userName });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Join the Chatroom</Text>
            <TextInput style={styles.nameInput} placeholder="Enter your name" onChangeText={(userName) => setUserName(userName)} value={userName} />
            <TouchableOpacity style={styles.joinButton} onPress={onPressJoin}>
                <Text style={styles.buttonText}>Join</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20
    },
    nameInput: {
        height: 40, 
        width: '80%', 
        borderColor: '#FF581E', 
        borderWidth: 1,
        borderRadius: 4,
        marginBottom: 20,
        padding: 6
    },
    joinButton: {
        height: 40, 
        width: '80%', 
        backgroundColor: '#FF581E', 
        justifyContent: 'center', 
        alignItems: 'center',
        borderRadius: 5
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    }
})

export default JoinScreen