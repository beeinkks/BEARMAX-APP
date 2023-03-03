import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Load from "./Screens/Load";
import Main from "./Screens/Main";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen 
          name="Load"
          component={Load}
        />
        <Stack.Screen 
          name="Main"
          component={Main}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}