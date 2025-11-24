<template>
    <footer class="bg-gray-900 text-white border-t border-gray-800">
        <UContainer class="py-12">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div class="md:col-span-1 space-y-6">
                    <h3 class="text-2xl font-bold text-amber-500">Barbearia Elite</h3>

                    <p class="text-gray-400 text-sm">Onde a tradição encontra a navalha moderna. Agende seu horário e sinta a diferença!</p>

                    <div class="space-y-2 text-sm">
                        <div class="flex items-center space-x-2">
                            <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-amber-500" />
                            <p>Rua Exemplo, 123 - Centro, Cidade - UF</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <UIcon name="i-heroicons-phone" class="w-5 h-5 text-amber-500" />
                            <p>(XX) XXXX-XXXX</p>
                        </div>
                        <div class="flex items-center space-x-2">
                            <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-amber-500" />
                            <p>contato@barbeariaelite.com</p>
                        </div>
                    </div>

                    <div class="flex space-x-3 pt-4">
                        <UButton icon="i-simple-icons-instagram" color="gray" variant="link" to="https://instagram.com/suabarbearia" target="_blank" aria-label="Instagram" class="text-gray-400 hover:text-amber-500" />
                        <UButton icon="i-simple-icons-facebook" color="gray" variant="link" to="https://facebook.com/suabarbearia" target="_blank" aria-label="Facebook" class="text-gray-400 hover:text-amber-500" />
                        <UButton icon="i-simple-icons-whatsapp" color="gray" variant="link" to="https://wa.me/XXXXXXXXXXX" target="_blank" aria-label="WhatsApp" class="text-gray-400 hover:text-amber-500" />
                    </div>
                </div>

                <div class="md:col-span-1 space-y-4 hidden md:block">
                    <h3 class="text-lg font-semibold text-white">Navegação</h3>
                    <ul class="space-y-2 text-sm">
                        <li>
                            <ULink to="/" active-class="text-amber-500" inactive-class="text-gray-400 hover:text-amber-500"> Início </ULink>
                        </li>
                        <li>
                            <ULink to="/services" active-class="text-amber-500" inactive-class="text-gray-400 hover:text-amber-500"> Serviços </ULink>
                        </li>
                    </ul>
                </div>

                <div class="md:col-span-1 space-y-4">
                    <h3 class="text-lg font-semibold text-white">Nossa Localização</h3>

                    <div class="rounded-lg overflow-hidden shadow-lg h-48 w-full">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d5202.924320699677!2d-49.65264532967242!3d-27.213942747497423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1smaps!5e0!3m2!1spt-BR!2sbr!4v1764002556717!5m2!1spt-BR!2sbr" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                    </div>

                    <div class="text-right">
                        <a href="LINK_PARA_SEU_ENDERECO_NO_GOOGLE_MAPS" target="_blank" class="text-amber-500 hover:text-amber-400 text-sm font-medium transition-colors"> Ver no Google Maps 🗺️ </a>
                    </div>
                </div>
            </div>
        </UContainer>

        <div class="bg-gray-800 py-4 text-center text-sm text-gray-500">
            <UContainer> © {{ new Date().getFullYear() }} Barbearia Elite. Todos os direitos reservados. </UContainer>
        </div>
    </footer>
</template>

<script setup>
// Não é necessário script, a menos que você queira buscar dados dinâmicos
</script>

<style scoped>
/* Estilos personalizados, se necessário */
</style>
