<script setup lang="ts">
const route = useRoute()
const { loggedIn, user, clear } = useUserSession()

const authError = computed(() => route.query.error === 'auth_failed')

const loginWithMicrosoft = () => {
  window.location.href = '/auth/microsoft'
}

const handleLogout = async () => {
  await clear()
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#F5F2EB] text-[#2A2825] selection:bg-[#FBDA0C] selection:text-[#2A2825]">

    <!-- Top Navigation Header -->
    <header class="sticky top-0 z-40 bg-[#EFEBE4] border-b border-[#E2DACF] px-4 lg:px-8 py-4">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">

        <!-- Brand Title & Navigation -->
        <div class="flex items-center gap-3">
          <div class="p-1.5 rounded-2xl bg-[#FFF8D6] border border-[#FBDA0C] flex items-center justify-center shrink-0">
            <img src="/favicon.svg" alt="App Icon" class="w-7 h-7 rounded-xl object-cover" />
          </div>
          <div>
            <h1 class="text-xl font-extrabold text-[#2A2825] tracking-tight flex items-center gap-2">
              Admin Portal
            </h1>
            <p class="text-xs text-[#736D66] font-medium">Meeting Room Display System</p>
          </div>
        </div>

        <!-- Right Side Nav Actions -->
        <div class="flex items-center gap-3">

          <button v-if="loggedIn" @click="handleLogout"
            class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F5E6E3] hover:bg-[#EAD7D4] text-[#8C4E43] text-xs font-semibold border border-[#E5C7C2] transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>

      </div>
    </header>

    <!-- Main Body Area -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">

      <!-- LOGGED IN VIEW -->
      <div v-if="loggedIn" class="space-y-8">

        <!-- User Info Card -->
        <div class="japandi-card rounded-2xl p-6 border border-[#E2DACF] bg-[#FAF8F5]">
          <div
            class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <!-- Avatar Circle -->
              <div
                class="w-14 h-14 rounded-2xl bg-[#FBDA0C] text-[#2A2825] font-extrabold text-xl flex items-center justify-center border border-[#E6C200] shrink-0 shadow-sm">
                {{ user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'A' }}
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h2 class="text-lg font-bold text-[#2A2825]">{{ user?.displayName || 'Admin User' }}</h2>
                  <span
                    class="px-2.5 py-0.5 text-[11px] rounded-full bg-[#FFF5C2] text-[#6B5900] border border-[#E6C200] font-semibold">
                    Microsoft Account
                  </span>
                </div>
                <p class="text-sm text-[#736D66] flex items-center gap-1.5 mt-0.5">
                  <svg class="w-4 h-4 text-[#736D66]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {{ user?.email || 'No email provided' }}
                </p>
              </div>
            </div>
          </div>
        </div>


        <!-- Placeholder Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Card 1: Room Configuration -->
          <div
            class="japandi-card rounded-2xl p-6 border border-[#E2DACF] bg-[#FAF8F5] opacity-90 hover:opacity-100 transition-all">
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-xl bg-[#FFF8D6] border border-[#FBDA0C] text-[#6B5900]">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0h4m-4 0H7" />
                </svg>
              </div>
              <span
                class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FFF5C2] text-[#6B5900] border border-[#E6C200]">
                Active
              </span>
            </div>
            <h3 class="text-base font-bold text-[#2A2825]">Room & Facility Management</h3>
            <p class="text-xs text-[#736D66] mt-1 leading-relaxed">
              Configure buildings, room names, mailboxes, and descriptions.
            </p>
            <div class="mt-4 pt-4 border-t border-[#E2DACF] flex items-center justify-end text-xs text-[#736D66]">
              <NuxtLink to="/admin/room"
                class="px-3.5 py-1.5 rounded-xl bg-[#FBDA0C] hover:bg-[#E5C700] text-[#2A2825] font-bold border border-[#E6C200] transition-colors">
                Manage Rooms
              </NuxtLink>
            </div>
          </div>

          </div>
      </div>

      <!-- LOGGED OUT VIEW -->
      <div v-else class="max-w-md mx-auto py-12">

        <!-- Auth Error Notification if redirect returned error -->
        <div v-if="authError"
          class="mb-6 p-4 rounded-2xl bg-[#F5E6E3] border border-[#E5C7C2] text-xs text-[#8C4E43] flex items-start gap-3">
          <svg class="w-5 h-5 text-[#8C4E43] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <strong class="font-bold block">Authentication Failed</strong>
            <span>Microsoft login could not be completed. Please check environment configuration or try again.</span>
          </div>
        </div>

        <!-- Japandi Login Card -->
        <div class="japandi-card rounded-3xl p-8 border border-[#E2DACF] bg-[#FAF8F5] text-center shadow-sm">

          <!-- Microsoft Icon SVG -->
          <div
            class="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[#EFEBE4] border border-[#E2DACF] flex items-center justify-center">
            <svg class="w-8 h-8" viewBox="0 0 23 23" fill="none">
              <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022" />
              <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7FBA00" />
              <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
              <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
            </svg>
          </div>

          <h2 class="text-xl font-extrabold text-[#2A2825] tracking-tight">Admin Authentication</h2>
          <p class="text-xs text-[#736D66] mt-2 mb-8 leading-relaxed max-w-xs mx-auto">
            Access to the administration portal requires a valid Microsoft account with authorization.
          </p>

          <!-- Login Button -->
          <button @click="loginWithMicrosoft"
            class="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-2xl bg-[#FBDA0C] hover:bg-[#E5C700] text-[#2A2825] text-sm font-bold border border-[#E6C200] transition-all shadow-sm hover:shadow">
            <svg class="w-5 h-5 shrink-0" viewBox="0 0 23 23" fill="none">
              <rect x="0" y="0" width="10.5" height="10.5" fill="#F25022" />
              <rect x="12.5" y="0" width="10.5" height="10.5" fill="#7FBA00" />
              <rect x="0" y="12.5" width="10.5" height="10.5" fill="#00A4EF" />
              <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" />
            </svg>
            Sign in with Microsoft
          </button>

          <!-- Footer Info -->
          <div class="mt-8 pt-6 border-t border-[#E2DACF] text-[11px] text-[#736D66]">
            <span>Secured via OAuth 2.0 & Microsoft Entra ID</span>
          </div>

        </div>
      </div>

    </main>

  </div>
</template>
