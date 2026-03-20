Quiero crear un componente `PdpCollectionPoint` en `src/lib/components/marketplace/pdp` basado en este JSON:

```
{
"id": <UUID>
"optionId": <UUID>
"description": "Vega de Arriba 19. 2ºA. 33600, Mieres (Asturias)",
"timeOfDay": "Horario de oficina de 8:00h a 15:00h.",
"marginTime": "15",
      "location": {
        "type": "Point",
        "coordinates": [
          2.17,
          41.3874
        ]
      }
}
```

Además mostrará un icono `MapPoint`

El diseño sería como se adjunta, y el enlace de `Abrir en Google Maps` abre las coordenadas en otra pestaña
