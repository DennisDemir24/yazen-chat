import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { db } from '../config/firebaseConfig'
import {
    collection, addDoc, onSnapshot, query, orderBy, limit,
    startAfter, endBefore
} from 'firebase/firestore';

const ChatRoom = ({ route }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [lastLoadedMessageTimestamp, setLastLoadedMessageTimestamp] = useState(null);
    const { userId, userName } = route.params;

    const flatListRef = useRef(null); // Create a ref for FlatList

    // Query to fetch initial 25 messages in descending order of creation
    const messageRef = collection(db, 'dennis-yazen-messages');
    const q = query(
        messageRef,
        orderBy('createdAt', 'desc'),
        limit(25)
    );

    // Listen for changes to the query and update messages state accordingly
    useEffect(() => {
        try {
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const newMessages = [];
                querySnapshot.forEach((doc) => {
                    const message = doc.data();
                    newMessages.push({
                        id: doc.id,
                        text: message.text,
                        userId: message.userId,
                        userName: message.userName,
                        createdAt: message.createdAt
                    });
                });
                setMessages(newMessages);
            });

            return () => unsubscribe();
        } catch (e) {
            console.log("First useEffect", e);
        }
    }, []);

    // Function to add a new message to the database and update messages state
    const handleSend = async () => {
        if (message.trim() !== '') {
            try {
                await addDoc(messageRef, {
                    text: message,
                    userName: userName,
                    userId: userId,
                    createdAt: new Date(),
                });

                setMessage('');
            } catch (e) {
                console.log(e);
            }
        }
    };

    const retrieveMore = async () => {
        try {
            const lastMessage = messages[messages.length - 1];
            if (!lastMessage) {
                return;
            }
            const lastMessageTimestamp = lastMessage.createdAt;
            const nextMessagesQuery = query(
                collection(db, 'dennis-yazen-messages'),
                orderBy('createdAt', 'desc'),
                startAfter(lastMessageTimestamp),
                limit(10)
            );
            setIsLoadingMore(true);
            const unsubscribe  = await onSnapshot(nextMessagesQuery, (querySnapshot) => {
                const newMessages = [];
                querySnapshot.forEach((doc) => {
                    const message = doc.data();
                    newMessages.push({
                        id: doc.id,
                        text: message.text,
                        userId: message.userId,
                        userName: message.userName,
                        createdAt: message.createdAt
                    });
                });
                setMessages((previousMessages) => [...previousMessages, ...newMessages]);
                setIsLoadingMore(false);
                setLastLoadedMessageTimestamp(newMessages[querySnapshot.docs.length - 1]?.createdAt);
                

                return () => unsubscribe()
            });
        } catch (e) {
            console.log("No messages to retrieve: ", e);
        }
    };

    /* useEffect(() => {
        // Scroll to bottom when sending new message
        flatListRef.current?.scrollToOffset({
            offset: messages.length,
        })
    }, [messages]); */

    const renderItem = ({ item }) => {
        return (
            <View style={[
                styles.messageContainer,
                item.userId === userId ? styles.sentMessage : styles.receivedMessage,
            ]}>
                <Text style={styles.messageAuthor}>{item.userName}</Text>
                <Text style={styles.messageText}>{item.text}</Text>
            </View>
        )
    };

    return (
        <View style={{ flex: 1 }}>
            <KeyboardAvoidingView style={styles.container} behavior="padding">
                <SafeAreaView style={styles.header}>
                    <Text style={styles.headerTitle}>Yazen Chat</Text>
                </SafeAreaView>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.id + index}
                    onEndReached={retrieveMore}
                    inverted
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={
                        isLoadingMore ?
                            <ActivityIndicator size="large" color="#FF581E" />
                            :
                            null
                    }
                />
                <SafeAreaView style={styles.footer}>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
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
        backgroundColor: '#FF581E',
        padding: 16,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
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
        padding: 10,
        backgroundColor: '#f2f2f2',
        borderRadius: 16,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ccc',
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 8,
        paddingBottom: 8,
    },
    sendButton: {
        backgroundColor: '#FF581E',
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
        marginVertical: 5,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF581E',
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: 'gray',
    },
});

export default ChatRoom