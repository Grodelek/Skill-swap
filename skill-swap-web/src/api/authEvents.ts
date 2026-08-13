type Handler = () => void
let unauthorizedHandler: Handler | null = null

export function registerUnauthorizedHandler(h: Handler) {
  unauthorizedHandler = h
}

export function triggerUnauthorized() {
  unauthorizedHandler?.()
}
