# API Directory

Este directorio está reservado para endpoints HTTP tradicionales que necesiten ser accesibles públicamente o por servicios externos (webhooks, integraciones de terceros, etc.).

## Cuándo Usar Este Directorio

Crea endpoints aquí solo para:

1. **Webhooks**: Endpoints que reciben notificaciones de servicios externos (Stripe, PayPal, etc.)
2. **Integraciones Públicas**: APIs que necesitan ser consumidas por sistemas externos
3. **Endpoints de Autenticación OAuth**: Callbacks de proveedores de identidad externos

## NO Usar Para

- **Enums/opciones estáticas**: Los enums se definen localmente en `src/lib/api/{dominio}/enums.ts` e importan directamente en los componentes.
- **Comunicación interna componente-servidor**: Usar `+page.server.ts` con form actions o load functions de SvelteKit.
