<script setup lang="ts">
// // Utils
// const { mutateAsync } = useMutation({
//   key: ['users'],
//   mutation: (args: UserCreateArgs) => $fetch('/api/users', { method: 'POST', body: args }),
// })

// Layout
const userData = ref({
  email: '',
})

// Methods
async function createUser() {
  // await mutateAsync({ data: userData.value })
}
</script>

<template>
  <div>
    <input v-model="userData.email">
    <button @click="createUser">
      Create user
    </button>
  </div>
</template>
