<script setup lang="ts" vapor>
import { tableGetStorageOwner } from '#layers/ui/app/components/Table/functions/table-get-storage-owner'

const owner = tableGetStorageOwner()
</script>

<template>
  <output>{{ owner }}</output>
</template>
