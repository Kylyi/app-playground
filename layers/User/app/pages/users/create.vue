<script setup lang="ts">
const user = ref({
  email: '',
})

const errMsg = ref('')

async function createUser() {
  const x = await r(
    () => $fetch('/api/users', { method: 'POST', body: user.value }),
    {
      onError: err => {
        errMsg.value = err.data.data
      },

    },
  )
}
</script>

<template>
  <div>
    Create user...
  </div>
</template>
