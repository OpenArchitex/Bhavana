import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useEffect, useState } from 'react';
import CountDownTimerStates from '../constants/CountDownTimerStates';
import { Audio } from 'expo-av';
import { TimerPicker } from 'react-native-timer-picker';
import { LinearGradient } from 'expo-linear-gradient';

async function prepareSound() {
  try {
    return await Audio.Sound.createAsync(
      require('./../assets/timer-sounds/bell-sound.mp3')
    );
  } catch (e) {
    console.error('Failed to load sound:', e);
  }
}

const CountDownTimer = ({
  timerState,
  showStopButton,
  alarmInterval = 30000,
}) => {
  const theme = useTheme();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [counter, setCounter] = useState(
    hours * 60 * 60 + minutes * 60 + seconds
  );
  const remainingHours = Math.floor(counter / 3600);
  const remainingMinutes = Math.floor((counter % 3600) / 60);
  const remainingSeconds = counter % 60;

  useEffect(() => {
    if (timerState === CountDownTimerStates.RUNNING) {
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
      showStopButton(false);
      let isLoaded = false;
      let soundObject = prepareSound().then((soundObject) => {
        isLoaded = true;
        void soundObject.sound.playAsync();
        return soundObject;
      });
      console.log('Loaded sound');
      const soundInterval = setInterval(() => {
        if (!isLoaded) return;
        soundObject.then((soundObject) => soundObject.sound.replayAsync());
      }, alarmInterval);

      return () => {
        clearInterval(soundInterval);
        soundObject.then((sound) => sound.sound.unloadAsync());
      };
    }
  }, [timerState === CountDownTimerStates.RUNNING && counter <= 0]);

  useEffect(() => {
    setCounter(hours * 60 * 60 + minutes * 60 + seconds);
  }, [hours, minutes, seconds]);

  const resetCounter = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
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
