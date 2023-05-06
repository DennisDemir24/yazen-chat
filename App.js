import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import JoinScreen from './screens/JoinScreen';
import ChatRoom from './screens/ChatRoom';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="JoinScreen" component={JoinScreen} options={
          {
            headerTitle: "Welcome to Yazen Chat"
          }
        } />
        <Stack.Screen name="ChatRoom" component={ChatRoom} options={
          {
            headerTitle: "Chat Room"
          }
        } />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;