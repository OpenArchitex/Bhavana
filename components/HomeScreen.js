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
  const [showStopButton, setShowStopButton] = useState(true);

  return (
    <View style={styles.container}>
      <CountDownTimer
        timerState={timerState}
        showStopButton={setShowStopButton}
      />
      <View style={{ flexDirection: 'row' }}>
        <IconButton
          icon="stop-circle-outline"
          size={120}
          iconColor={theme.colors.backdrop}
          onPress={() => {
            setTimerState(CountDownTimerStates.NOT_STARTED);
            setShowStopButton(true);
          }}
        />
        {showStopButton && (
          <IconButton
            icon={
              timerState === CountDownTimerStates.RUNNING
                ? 'pause-circle-outline'
                : 'play-circle-outline'
            }
            size={120}
            iconColor={theme.colors.primary}
            onPress={() =>
              setTimerState(
                timerState === CountDownTimerStates.RUNNING
                  ? CountDownTimerStates.PAUSED
                  : CountDownTimerStates.RUNNING
              )
            }
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
