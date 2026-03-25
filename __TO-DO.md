Quiero crear un componente `PdpCollectionPoint` en `src/lib/components/marketplace/pdp` basado en este JSON:

```
      {
        "id": "pkl-0001",
        "optionId": "opt-0001",
        "location": {
          "type": "Point",
          "coordinates": [
            -3.7038,
            40.4168
          ]
        },
        "description": "Puerta del Sol, junto a la estatua del oso",
        "marginTime": 15,
        "timeOfDay": "08:45"
      }
```

Además mostrará un icono `MapPoint`

El diseño sería como se adjunta, y el enlace de `Abrir en Google Maps` abre las coordenadas en otra pestaña
