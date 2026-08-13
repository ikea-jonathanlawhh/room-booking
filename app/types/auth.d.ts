declare module '#auth-utils' {
  interface User {
    id?: string
    displayName: string
    email: string
  }

  interface UserSession {
    user?: User
    loggedInAt?: number
  }
}

export {}
