import { StyleSheet } from 'react-native';
import { Appbar, Portal, Button, Dialog, useTheme } from 'react-native-paper';
import { List, RadioButton } from 'react-native-paper';
import { useEffect, useState } from 'react';
import Settings from '../constants/Settings';
import { TimerPicker } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sounds from '../constants/Sounds';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [alarmIntervalInSecs, setAlarmIntervalInSecs] = useState(30);
  const [visible, setVisible] = useState(false);
  const [bellSound, setBellSound] = useState(Sounds.BELL_SOUND);
  const [dialog, setDialog] = useState(null);

  const alarmIntervalMinutes = Math.floor((alarmIntervalInSecs % 3600) / 60);

  const alarmIntervalSeconds = Math.abs(alarmIntervalInSecs % 60);
  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const getSettings = async () => {
    const settings = await AsyncStorage.multiGet([
      'DELAY_INTERVAL',
      'BELL_SOUND',
    ]);
    if (settings[0][0] === 'DELAY_INTERVAL') {
      setAlarmIntervalInSecs(Number(settings[0][1]));
    }

    if (settings[1][0] === 'BELL_SOUND') {
      setBellSound(JSON.parse(settings[1][1]));
    }
  };

  useEffect(() => {
    void getSettings();
  }, []);

  const saveSettings = async () => {
    try {
      setAlarmIntervalInSecs(alarmIntervalInSecs);
      await AsyncStorage.multiSet([
        ['DELAY_INTERVAL', alarmIntervalInSecs.toString()],
        ['BELL_SOUND', JSON.stringify(bellSound)],
      ]);
      hideDialog();
    } catch (e) {
      // saving error
      console.log(e);
    }
  };

  const resetSettings = async () => {
    await getSettings();
    hideDialog();
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
            {dialog === Settings.BELL_SOUND && (
              <RadioButton.Group
                onValueChange={(value) => setBellSound(Sounds[value])}
                value={bellSound.key}
              >
                {Object.values(Sounds).map((sound) => (
                  <RadioButton.Item
                    key={sound.key}
                    label={sound.label}
                    value={sound.key}
                  />
                ))}
              </RadioButton.Group>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => resetSettings()}>Cancel</Button>
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
          description={`${Settings.BELL_SOUND.DESCRIPTION}: ${bellSound.label}`}
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
