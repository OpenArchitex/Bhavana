import { StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

const SettingsScreen = ({ navigation }) => {
  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>
      <View style={styles.container}>
        <Text variant="headlineMedium"></Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SettingsScreen;
