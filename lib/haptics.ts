// Haptic feedback via Web Vibration API
// Works on Android + most browsers. iOS Safari has limited support.

export const haptics = {
  tap:     () => navigator.vibrate?.(10),
  correct: () => navigator.vibrate?.(50),
  wrong:   () => navigator.vibrate?.([80, 60, 80]),
  levelUp: () => navigator.vibrate?.([100, 50, 100, 50, 200]),
  success: () => navigator.vibrate?.([50, 30, 100]),
}
