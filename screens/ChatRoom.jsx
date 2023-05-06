import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, FlatList, KeyboardAvoidingView, SafeAreaView } from 'react-native';
import { db } from '../config/firebaseConfig'
import {
    collection, addDoc, onSnapshot, query, orderBy, limit,
    startAfter, serverTimestamp
} from 'firebase/firestore';

const ChatRoom = ({ route }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [lastLoadedMessageTimestamp, setLastLoadedMessageTimestamp] = useState();
    const { userId, userName } = route.params;

    console.log(messages.length);

    const flatListRef = useRef(null); // Create a ref for FlatList

    // Query to fetch initial 25 messages in descending order of creation
    const messageRef = collection(db, 'dennis-yazen-messages');
    const q = query(
        messageRef,
        orderBy('timestamp', 'desc'),
        limit(25)
    );

    // Listen for changes to the query and update messages state accordingly
    useEffect(() => {
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const newMessages = [];
            querySnapshot.forEach((doc) => {
                const message = doc.data();
                newMessages.push({
                    id: doc.id,
                    text: message.text,
                    userId: message.userId,
                    userName: message.userName,
                });
            });
            setMessages(newMessages.reverse());
        });

        return () => unsubscribe();
    }, []);

    // Function to add a new message to the database and update messages state
    const handleSend = async () => {
        if (message.trim() !== '') {
            await addDoc(messageRef, {
                text: message,
                timestamp: serverTimestamp(),
                userName: userName,
                userId: userId,
            });

            setMessage('');
        }
    };

    const loadMoreMessages = async () => {
        if (isLoadingMore) {
          return;
        }
      
        setIsLoadingMore(true);
      
        const q = query(
          messageRef,
          orderBy('timestamp', 'desc'),
          lastLoadedMessageTimestamp ? startAfter(lastLoadedMessageTimestamp) : null
        );
      
        console.log('Loading more messages'); // Add this line to see if the function is being called
      
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const newMessages = [];
          querySnapshot.forEach((doc) => {
            const message = doc.data();
            newMessages.unshift({
              id: doc.id,
              text: message.text,
              timestamp: serverTimestamp(),
              userId: message.userId,
              userName: message.userName,
            });
          });
          setMessages((prevMessages) => [...newMessages, ...prevMessages]);
          setLastLoadedMessageTimestamp(newMessages[newMessages.length - 1]?.timestamp);
          setIsLoadingMore(false);
        });
      
        return () => unsubscribe();
      };

    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current.scrollToIndex({ index: messages.length - 1 });
        }
    }, [messages]);

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
                    onScroll={e => {
                        const scrolledToTop = e.nativeEvent.contentOffset.y === 0;
                        if (scrolledToTop) {
                            loadMoreMessages();
                        }
                    }}
                    onEndReachedThreshold={0.1}
                    onScrollToIndexFailed={
                        () => console.log("WARNING")
                    }

                    ListHeaderComponent={
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
        marginVertical: 5
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