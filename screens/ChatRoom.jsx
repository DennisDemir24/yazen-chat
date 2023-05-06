import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { db } from '../config/firebaseConfig'
import {
    collection, addDoc, onSnapshot, query, orderBy, limit,
    startAfter, getDocs
} from 'firebase/firestore';

const ChatRoom = ({ route }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [lastLoadedMessageTimestamp, setLastLoadedMessageTimestamp] = useState(null);

    const { userId, userName } = route.params;

    const flatListRef = useRef(null); // Create a ref for FlatList

    useEffect(() => {
        const q = query(collection(db, 'dennis-yazen-messages'), orderBy('timestamp', 'asc'), limit(25));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            let messages = [];
            querySnapshot.forEach((doc) => {
                messages.push({ ...doc.data(), id: doc.id });
            });
            setMessages(messages);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current.scrollToIndex({ index: messages.length - 1 });
        }
    }, [messages]);

    const handleSend = async () => {
        if (newMessage.trim() === '') return;

        await addDoc(collection(db, 'dennis-yazen-messages'), {
            userId,
            userName,
            text: newMessage,
            timestamp: new Date().getTime(),
        });

        setNewMessage('');

        // Append the new message to the existing messages
        setMessages([...messages, {
            id: 'new-message-' + new Date().getTime(),
            userId,
            userName,
            text: newMessage,
            timestamp: new Date().getTime(),
        }]);
    };

    const handleLoadMoreMessages = async () => {
        if (lastLoadedMessageTimestamp === null) {
          // This is the initial load, so the first query has already loaded the 25 most recent messages
          return;
        }
      
        const q = query(
          collection(db, 'dennis-yazen-messages'),
          orderBy('timestamp', 'desc'),
          endBefore(lastLoadedMessageTimestamp),
          limit(25)
        );
      
        const querySnapshot = await getDocs(q);
      
        let messages = [];
        querySnapshot.forEach((doc) => {
          messages.push({ ...doc.data(), id: doc.id });
        });
      
        // Append the older messages to the beginning of the messages array
        setMessages([...messages, ...messages]);
      
        // Update the last loaded message's timestamp
        setLastLoadedMessageTimestamp(messages[messages.length - 1].timestamp);
      };


    const renderItem = ({ item }) => (
        <View style={[
            styles.messageContainer,
            item.userId === userId ? styles.sentMessage : styles.receivedMessage,
        ]}>
            <Text style={styles.messageAuthor}>{item.userName}</Text>
            <Text style={styles.messageText}>{item.text}</Text>
        </View>
    );

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <SafeAreaView style={styles.header}>
                    <Text style={styles.headerTitle}>Chat App</Text>
                </SafeAreaView>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id + "-" + index}
                    onEndReached={
                        handleLoadMoreMessages
                    }
                    onEndReachedThreshold={0.1}
                    onScrollToIndexFailed={
                        () => console.log("WARNING")
                    }
                />
                <SafeAreaView style={styles.footer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={setNewMessage}
                        placeholder="Type your message here"
                        onSubmitEditing={handleSend}
                        blurOnSubmit={false}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                        <Text style={styles.sendButtonText}>Send</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        backgroundColor: '#2196F3',
        padding: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    footer: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#ccc',
    },
    input: {
        flex: 1,
        marginRight: 16,
        padding: 8,
        backgroundColor: '#f2f2f2',
        borderRadius: 16,
        fontSize: 16, // font size of the text input
        borderWidth: 1, // border width of the text input
        borderColor: '#ccc', // border color of the text input
        paddingLeft: 10, // left padding of the text input
        paddingRight: 10, // right padding of the text input
        paddingTop: 8, // top padding of the text input
        paddingBottom: 8, // bottom padding of the text input
    },
    sendButton: {
        backgroundColor: 'black',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 16,
    },
    sendButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    messageContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    messageAuthor: {
        marginBottom: 4,
        color: '#ccc',
        fontSize: 14,
        fontWeight: 'bold',
    },
    messageText: {
        color: '#fff',
    },
    messageContainer: {
        padding: 10,
        borderRadius: 10,
        maxWidth: '80%',
        marginVertical: 5
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: 'blue',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'gray',
    },
});

export default ChatRoom