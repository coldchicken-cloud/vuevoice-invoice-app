<template>
  <div class="status-button flex" :class="status">
    <span>{{ label }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { STATUS_LABELS } from '@/utils/invoiceStatus';

const props = defineProps({
  status: {
    type: String,
    required: true,
    validator: (value) => ['paid', 'pending', 'draft', 'overdue'].includes(value),
  },
});

const label = computed(() => STATUS_LABELS[props.status]);
</script>
