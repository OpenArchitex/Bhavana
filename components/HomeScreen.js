import { View, StyleSheet } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import CountDownTimer from './CountDownTimer';
import { useEffect, useState } from 'react';
import CountDownTimerStates from '../constants/CountDownTimerStates';

const HomeScreen = () => {
  const theme = useTheme();
  const [timerState, setTimerState] = useState(
    CountDownTimerStates.NOT_STARTED
  );
  const [showStopButton, setShowStopButton] = useState(false);
  const [showPauseButton, setShowPauseButton] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);

  useEffect(() => {
    if (timerState === CountDownTimerStates.RUNNING) {
      setShowPlayButton(false);
    } else if (timerState === CountDownTimerStates.PAUSED) {
      setShowStopButton(true);
      setShowPauseButton(false);
      setShowPlayButton(true);
    } else if (timerState === CountDownTimerStates.NOT_STARTED) {
      setShowStopButton(false);
      setShowPauseButton(false);
      setShowPlayButton(true);
    }
  }, [timerState]);

  return (
    <View style={styles.container}>
      <CountDownTimer
        timerState={timerState}
        showPauseButton={setShowPauseButton}
        showStopButton={setShowStopButton}
      />
      <View style={{ flexDirection: 'row' }}>
        {showStopButton && (
          <IconButton
            icon="stop-circle-outline"
            size={120}
            iconColor={theme.colors.backdrop}
            onPress={() => {
              setTimerState(CountDownTimerStates.NOT_STARTED);
            }}
          />
        )}
        {showPauseButton && (
          <IconButton
            icon="pause-circle-outline"
            size={120}
            iconColor={theme.colors.primary}
            onPress={() => {
              setTimerState(CountDownTimerStates.PAUSED);
            }}
          />
        )}
        {showPlayButton && (
          <IconButton
            icon="play-circle-outline"
            size={120}
            iconColor={theme.colors.primary}
            onPress={() => {
              setTimerState(CountDownTimerStates.RUNNING);
            }}
          />
        )}
      </View>
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

export default HomeScreen;
