import { socket } from '~/utils/socket/core'
export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    socket.init('https://life.tires', {
        auth: {
            token: useCookie('token').value
        }
    })
    return {
        provide: {
            socket
        }
    }
})