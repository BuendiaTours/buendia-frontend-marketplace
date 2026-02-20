Cuando añadas iconos aquí asegúrate de:

- Que el `fill`, `stroke` y otros atributos están en propiedades
- Elimiminar todo lo que no sea strictamente necesario
- El `width` y `height` por defecto estamos usando `24`

MAL:

```xml
<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100%" height="100%" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;">
    <path d="M20.5,3.5L3.5,20.5M3.5,3.5L20.5,20.5" style="fill:none;fill-rule:nonzero;stroke:rgb(28,39,76);stroke-width:1.5px;"/>
</svg>
```

---

BIEN:

```xml
<svg width="24" height="24" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M20.5,3.5L3.5,20.5M3.5,3.5L20.5,20.5" fill="none" stroke="#1c274c" stroke-width="1.5"/></svg>
```
