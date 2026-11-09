// Génère un identifiant unique pour chaque enregistrement.
// crypto.randomUUID n'est disponible qu'en HTTPS : pendant les tests sur le
// réseau local (http://192.168…) on utilise un repli tout aussi unique.
export function newId() {
  if (globalThis.crypto?.randomUUID && globalThis.isSecureContext) {
    return crypto.randomUUID()
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}
