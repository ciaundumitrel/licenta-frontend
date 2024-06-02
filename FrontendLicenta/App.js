import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import EncounteredBirds from './EncounteredBirds';
import Recording from './Recording';

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Bird Song Classifier</Text>
      <Text style={styles.descriptionText}>
        Record bird songs and classify them using our advanced AI model.
      </Text>
      <View style={styles.row}>
        <Button title="Encountered Birds" onPress={() => navigation.navigate('EncounteredBirds')} />
        <Button title="Find New Bird" onPress={() => navigation.navigate('Recording')} />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="EncounteredBirds" component={EncounteredBirds} />
        <Stack.Screen name="Recording" component={Recording} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  welcomeText: {
    top: 10,
    marginTop: 30,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    display: 'flex',
  },
  descriptionText: {
    top: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    width: '100%',
    paddingHorizontal: 20,
  },
  recorderContainer: {
    flex: 1,
    marginLeft: 20,
  },
});
