<template>
    <div ref="booking">
        <Grid @selectedRows="selected = $event" title="Agendamentos" />
    </div>
</template>

<script setup>

const selected = ref([])

</script>