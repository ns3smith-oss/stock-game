// Celebration effects using canvas-confetti
import confetti from 'canvas-confetti'

export function celebrateCorrect() {
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.7 },
    colors: ['#39FF14', '#8B00FF', '#FFFFFF', '#FFD700'],
    startVelocity: 30,
    ticks: 60,
  })
}

export function celebrateLevelUp() {
  // Left side
  confetti({
    particleCount: 120,
    angle: 60,
    spread: 80,
    origin: { x: 0, y: 0.6 },
    colors: ['#39FF14', '#8B00FF', '#FFFFFF', '#FF6B6B'],
  })
  // Right side
  confetti({
    particleCount: 120,
    angle: 120,
    spread: 80,
    origin: { x: 1, y: 0.6 },
    colors: ['#39FF14', '#8B00FF', '#FFFFFF', '#FF6B6B'],
  })
}

export function celebrateCourseReady() {
  const duration = 2000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#39FF14', '#8B00FF', '#FFFFFF'],
    })
    confetti({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#39FF14', '#8B00FF', '#FFFFFF'],
    })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}
