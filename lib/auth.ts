// Auth utility — localStorage-based for prototype.
// Swap localStorage calls for real API calls when backend is added.

export interface StocklyUser {
  id: string
  name: string
  email: string
  password: string         // plaintext for prototype only — hash server-side in production
  termsAgreed: boolean
  termsTimestamp: string | null
  termsSessionId: string | null
  enrollmentComplete: boolean
  onboardingStep: string   // last completed onboarding route
  track: string | null     // starter / builder / leveler
  plan: string | null      // free / pro
  createdAt: string
}

const USERS_KEY = 'stockly_users'
const SESSION_KEY = 'stockly_session'

function loadUsers(): StocklyUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveUsers(users: StocklyUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function signUp(name: string, email: string, password: string): { success: boolean; error?: string; user?: StocklyUser } {
  const users = loadUsers()
  const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (exists) return { success: false, error: 'An account with that email already exists.' }

  const user: StocklyUser = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    password,
    termsAgreed: false,
    termsTimestamp: null,
    termsSessionId: null,
    enrollmentComplete: false,
    onboardingStep: '/welcome',
    track: null,
    plan: null,
    createdAt: new Date().toISOString(),
  }

  users.push(user)
  saveUsers(users)
  localStorage.setItem(SESSION_KEY, user.id)
  return { success: true, user }
}

export function signIn(email: string, password: string): { success: boolean; error?: string; user?: StocklyUser } {
  const users = loadUsers()
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  )
  if (!user) return { success: false, error: 'Incorrect email or password.' }

  localStorage.setItem(SESSION_KEY, user.id)
  return { success: true, user }
}

export function getCurrentUser(): StocklyUser | null {
  try {
    const id = localStorage.getItem(SESSION_KEY)
    if (!id) return null
    const users = loadUsers()
    return users.find((u) => u.id === id) ?? null
  } catch {
    return null
  }
}

export function updateUser(updates: Partial<StocklyUser>): void {
  const id = localStorage.getItem(SESSION_KEY)
  if (!id) return
  const users = loadUsers()
  const idx = users.findIndex((u) => u.id === id)
  if (idx < 0) return
  users[idx] = { ...users[idx], ...updates }
  saveUsers(users)
}

export function agreeToTerms(): void {
  updateUser({
    termsAgreed: true,
    termsTimestamp: new Date().toISOString(),
    termsSessionId: crypto.randomUUID(),
    onboardingStep: '/onboarding/questions',
  })
}

export function resetPassword(email: string, newPassword: string): { success: boolean; error?: string } {
  const users = loadUsers()
  const idx = users.findIndex((u) => u.email.toLowerCase() === email.toLowerCase())
  if (idx < 0) return { success: false, error: 'No account found with that email.' }
  users[idx].password = newPassword
  saveUsers(users)
  return { success: true }
}

export function signOut(): void {
  localStorage.removeItem(SESSION_KEY)
}

// Returns where a returning user should be routed after sign in
export function getResumeRoute(user: StocklyUser): string {
  if (user.enrollmentComplete) return '/learn'
  if (!user.termsAgreed) return '/welcome'
  return user.onboardingStep || '/onboarding/questions'
}
