import { View, StyleSheet, AppState } from 'react-native';
import { Text } from 'react-native-paper';
import { useEffect, useState } from 'react';
import CountDownTimerStates from '../constants/CountDownTimerStates';
import { Audio } from 'expo-av';
import { TimerPicker } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sounds from '../constants/Sounds';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function prepareSound(bellSound) {
  try {
    return await Audio.Sound.createAsync(bellSound.value);
  } catch (e) {
    console.error('Failed to load sound:', e);
  }
}

const CountDownTimer = ({ timerState, showPauseButton, showStopButton }) => {
  const [alarmIntervalInSecs, setAlarmIntervalInSecs] = useState(30);
  const [bellSound, setBellSound] = useState(Sounds.BELL_SOUND);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [counter, setCounter] = useState(
    hours * 60 * 60 + minutes * 60 + seconds
  );
  const [appBackgroundPointTime, setAppBackgroundPointTime] = useState(0);
  const [futureTimerEndNotificationId, setFutureTimerEndNotificationId] =
    useState('');

  const remainingHours =
    counter > 0 ? Math.floor(counter / 3600) : -Math.ceil(counter / 3600);
  const remainingMinutes =
    counter > 0
      ? Math.floor((counter % 3600) / 60)
      : -Math.ceil((counter % 3600) / 60);
  const remainingSeconds = Math.abs(counter % 60);

  void Notifications.setNotificationChannelAsync('Bhavana', {
    name: 'Bhavana Notifications',
    importance: Notifications.AndroidImportance.MAX,
    sound: bellSound.fileName, // <- for Android 8.0+, see channelId property below
  });

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'inactive' || nextAppState === 'background') {
        setAppBackgroundPointTime(Date.now());
        void Notifications.scheduleNotificationAsync({
          content: {
            title: 'Your Timer is Running',
            body: 'Your timer is still running in the background. Tap to open the app.',
            priority: Notifications.AndroidNotificationPriority.MAX,
          },
          trigger: null,
        });
        Notifications.scheduleNotificationAsync({
          content: {
            title: 'Your Time is Up!',
            body: 'Your timer has finished! Tap to open the app.',
            sticky: true,
            priority: Notifications.AndroidNotificationPriority.MAX,
            sound: bellSound.fileName,
          },
          trigger: { seconds: counter },
        }).then((notificationId) =>
          setFutureTimerEndNotificationId(notificationId)
        );
      } else {
        setCounter(
          counter - Math.floor((Date.now() - appBackgroundPointTime) / 1000)
        );
        if (counter > 0) {
          void Notifications.cancelScheduledNotificationAsync(
            futureTimerEndNotificationId
          );
        }
      }
    });

    return () => {
      subscription.remove();
    };
  });

  useEffect(() => {
    if (timerState === CountDownTimerStates.RUNNING) {
      showPauseButton(true);
      showStopButton(true);
      const interval = setInterval(() => {
        setCounter((prevCounter) => {
          return prevCounter - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (timerState === CountDownTimerStates.NOT_STARTED) {
      resetCounter();
    }
  }, [timerState]);

  useEffect(() => {
    if (timerState === CountDownTimerStates.RUNNING && counter <= 0) {
      showPauseButton(false);
      showStopButton(true);
      let isLoaded = false;
      let soundObject = prepareSound(bellSound).then((soundObject) => {
        isLoaded = true;
        void soundObject.sound.playAsync();
        return soundObject;
      });
      const soundInterval = setInterval(() => {
        if (!isLoaded) return;
        soundObject.then((soundObject) => soundObject.sound.replayAsync());
      }, alarmIntervalInSecs * 1000);

      return () => {
        clearInterval(soundInterval);
        soundObject.then((sound) => sound.sound.unloadAsync());
      };
    }
  }, [timerState === CountDownTimerStates.RUNNING && counter <= 0]);

  useEffect(() => {
    setCounter(hours * 60 * 60 + minutes * 60 + seconds);
  }, [hours, minutes, seconds]);

  useEffect(() => {
    const getAlarmInterval = async () => {
      const alarmInterval = Number(
        (await AsyncStorage.getItem('DELAY_INTERVAL')) || 30
      );
      setAlarmIntervalInSecs(alarmInterval);
    };
    void getAlarmInterval().catch((e) => console.error(e));
  }, [counter <= 3]);

  useEffect(() => {
    const getBellSound = async () => {
      let bellSound = await AsyncStorage.getItem('BELL_SOUND');
      if (!bellSound) {
        bellSound = Sounds.BELL_SOUND;
        setBellSound(bellSound);
      } else {
        setBellSound(JSON.parse(bellSound));
      }
    };
    void getBellSound().catch((e) => console.error(e));
  }, [counter <= 3]);

  const resetCounter = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    setCounter(hours * 60 * 60 + minutes * 60 + seconds);
  };

  const timerString = `${String(remainingMinutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {timerState === CountDownTimerStates.NOT_STARTED ? (
        <TimerPicker
          allowFontScaling={true}
          minuteLabel=":"
          hourLabel=":"
          secondLabel=""
          LinearGradient={LinearGradient}
          styles={{
            theme: 'light',
            pickerItem: {
              fontSize: 40,
            },
            pickerLabel: {
              fontSize: 40,
              right: -60,
              top: -6,
            },
            pickerContainer: {
              marginRight: 0,
            },
            pickerLabelContainer: {
              width: 60,
            },
            pickerItemContainer: {
              width: 100,
              height: 100,
            },
          }}
          onDurationChange={({ hours, minutes, seconds }) => {
            setHours(hours);
            setMinutes(minutes);
            setSeconds(seconds);
          }}
        />
      ) : (
        <Text style={{ fontSize: 80, color: counter < 0 ? 'red' : 'black' }}>
          {counter < 0 ? '-' : ''}
          {remainingHours !== 0
            ? `${String(remainingHours).padStart(2, '0')}:${timerString}`
            : timerString}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CountDownTimer;
