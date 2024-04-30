import { StyleSheet } from 'react-native';
import { Appbar, Portal, Button, Dialog, useTheme } from 'react-native-paper';
import { List } from 'react-native-paper';
import { useEffect, useState } from 'react';
import Settings from '../constants/Settings';
import { TimerPicker } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [alarmIntervalInSecs, setAlarmIntervalInSecs] = useState(30);
  const [visible, setVisible] = useState(false);
  const [bellSound, setBellSound] = useState('bell-sound.mp3');
  const [dialog, setDialog] = useState(null);

  const alarmIntervalMinutes = Math.floor((alarmIntervalInSecs % 3600) / 60);

  const alarmIntervalSeconds = Math.abs(alarmIntervalInSecs % 60);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  useEffect(() => {
    const getAlarmInterval = async () => {
      const alarmInterval = Number(
        (await AsyncStorage.getItem('DELAY_INTERVAL')) || 30
      );
      setAlarmIntervalInSecs(alarmInterval);
    };
    void getAlarmInterval();
  }, []);

  const saveSettings = async () => {
    try {
      setAlarmIntervalInSecs(alarmIntervalInSecs);
      await AsyncStorage.multiSet([
        ['DELAY_INTERVAL', alarmIntervalInSecs.toString()],
        ['BELL_SOUND', bellSound],
      ]);
      hideDialog();
    } catch (e) {
      // saving error
      console.log(e);
    }
  };

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.navigate('Home')} />
        <Appbar.Content title="Settings" />
      </Appbar.Header>

      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{dialog?.TITLE}</Dialog.Title>
          <Dialog.Content style={{ marginLeft: 60 }}>
            {dialog === Settings.DELAY_INTERVAL && (
              <TimerPicker
                initialMinutes={alarmIntervalMinutes}
                initialSeconds={alarmIntervalSeconds}
                hideHours={true}
                allowFontScaling={true}
                LinearGradient={LinearGradient}
                topPickerGradientOverlayProps={{
                  colors: [theme.colors.surface, 'transparent'],
                }}
                bottomPickerGradientOverlayProps={{
                  colors: ['transparent', theme.colors.surface],
                }}
                styles={{ backgroundColor: 'transparent' }}
                onDurationChange={({ minutes, seconds }) => {
                  setAlarmIntervalInSecs(minutes * 60 + seconds);
                }}
              />
            )}
            {dialog === Settings.BELL_SOUND && <></>}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => hideDialog()}>Cancel</Button>
            <Button onPress={() => saveSettings()}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      <List.Section style={{ marginLeft: 10 }}>
        <List.Item
          title="Delay Interval"
          onPress={() => {
            setDialog(Settings.DELAY_INTERVAL);
            showDialog();
          }}
          left={() => <List.Icon icon="timer-cog-outline" />}
          description={`${Settings.DELAY_INTERVAL.DESCRIPTION}: ${alarmIntervalMinutes}m ${alarmIntervalSeconds}s`}
        />
        <List.Item
          title="Bell Sound"
          onPress={() => {
            {
              setDialog(Settings.BELL_SOUND);
              showDialog();
            }
          }}
          left={() => <List.Icon icon="playlist-music" />}
          description={`${Settings.BELL_SOUND.DESCRIPTION}: ${bellSound}`}
        />
      </List.Section>
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
