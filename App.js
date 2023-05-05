import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import { createAppContainer } from 'react-navigation';
import JoinScreen from './screens/JoinScreen';

const navigator = createStackNavigator(
  {
    JoinScreen: { screen: JoinScreen },
  },
  {
    initialRouteName: 'JoinScreen',
  }
);


const AppContainer = createAppContainer(navigator);

export default function App() {
  return <AppContainer />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
