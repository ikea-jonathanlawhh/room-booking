export default defineOAuthMicrosoftEventHandler({
  async onSuccess(event, { user }) {
    const msUser = user as {
      id?: string
      displayName?: string
      name?: string
      givenName?: string
      mail?: string
      userPrincipalName?: string
      email?: string
    }

    const displayName = msUser.displayName || msUser.name || msUser.givenName || 'Microsoft User'
    const email = msUser.mail || msUser.userPrincipalName || msUser.email || ''

    await setUserSession(event, {
      user: {
        id: msUser.id,
        displayName,
        email
      },
      loggedInAt: Date.now()
    })

    return sendRedirect(event, '/admin')
  },
  onError(event, error) {
    console.error('Microsoft OAuth Authentication Error:', error)
    return sendRedirect(event, '/admin?error=auth_failed')
  }
})
