import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CommonActions, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { BottomNavigation, PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomeScreen from './components/HomeScreen';
import SettingsScreen from './components/Settings';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <>
      <StatusBar style="auto" />
      <PaperProvider>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
            }}
            tabBar={({ navigation, state, descriptors, insets }) => (
              <BottomNavigation.Bar
                navigationState={state}
                safeAreaInsets={insets}
                onTabPress={({ route, preventDefault }) => {
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });

                  if (event.defaultPrevented) {
                    preventDefault();
                  } else {
                    navigation.dispatch({
                      ...CommonActions.navigate(route.name, route.params),
                      target: state.key,
                    });
                  }
                }}
                renderIcon={({ route, focused, color }) => {
                  const { options } = descriptors[route.key];
                  if (options.tabBarIcon) {
                    return options.tabBarIcon({ focused, color, size: 24 });
                  }

                  return null;
                }}
                getLabelText={({ route }) => {
                  const { options } = descriptors[route.key];
                  const label =
                    options.tabBarLabel !== undefined
                      ? options.tabBarLabel
                      : options.title !== undefined
                        ? options.title
                        : route.title;

                  return label;
                }}
              />
            )}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({ color, size }) => {
                  return <Icon name="home" size={size} color={color} />;
                },
              }}
            />
            <Tab.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                tabBarLabel: 'Settings',
                tabBarIcon: ({ color, size }) => {
                  return <Icon name="cog" size={size} color={color} />;
                },
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </>
  );
};

export default App;
