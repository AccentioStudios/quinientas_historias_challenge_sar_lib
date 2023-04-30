# SAR Lib - Libreria para manejar todas las peticiones a la API del SAR
Esta es una librería para manejar peticiones a la API del SAR. Esta clase se puede utilizar para obtener información del usuario y para terminar un reto.

## Requisitos
Esta librería tiene las siguientes dependencias:
 - Toastify-js

## Uso
### Importar la librería
Para utilizar la librería, primero debes importar la libreria desde el CDN de 500Historias
``` html
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/sarlib.min.js"></script>
```
### Inicializar la librería
Para inicializar la librería, debes instanciar la clase SarLib. La clase toma como argumento un objeto de configuración con las siguientes propiedades:

 - uuid: Identificador único de la solicitud de autenticación.
 - secretKey: Clave secreta proporcionada por SAR.
 - url (opcional): URL de la API de SAR. Por defecto, es "https://500h-sar-dev.accentiostudios.com".

```js
    const sar = new SarLib({ uuid: 'xxx-xxx-xxx-xxx-xxx', secretKey: 'secretKey', url: 'urlApi' });
```

Después, puedes llamar al método init() para inicializar la librería. Este método toma como argumento una función de retorno que se ejecutará después de que se complete la inicialización. La función de retorno recibirá el objeto del usuario como argumento.

```js
    sar.init((user) => {
        console.log(user);
    });
```
### Obtener información del usuario
El callback de la funcion init() retorna los datos del usuario. Sin embargo puedes hacer la peticion nuevamente con el método getUser(). Este método devuelve una promesa que se resuelve con el objeto del usuario.

```js
sar.getUser()
  .then((user) => {
    console.log(user);
  })
  .catch((error) => {
    console.log(error);
  });
```

### Terminar un reto

Puedes terminar un reto llamando al método finishChallenge(). Este método toma un argumento booleano que indica si el reto fue exitoso o no.

```js
sar.finishChallenge(true)
  .then(() => {
    console.log('Reto terminado exitosamente');
  })
  .catch((error) => {
    console.log(error);
  });
```

### Terminar un paso en un reto con pasos
Puedes terminar un paso en un reto con pasos llamando al método addStep(). Este método devuelve una promesa que se resuelve con un objeto con una propiedad success que indica si el paso fue exitoso o no.

```js
sar.addStep()
  .then((response) => {
    if (response.success) {
      console.log('Paso terminado exitosamente');
    } else {
      console.log('Error al terminar el paso');
    }
  })
  .catch((error) => {
    console.log(error);
  });
```

## Créditos

Este proyecto es una iniciativa de 500Historias con la ayuda de Accentio Studios.

500Historias es un programa de transformación educativa que busca descubrir e impulsar nuevos talentos de la literatura, así como desarrollar habilidades como la creatividad, el pensamiento crítico y la colaboración en los jóvenes participantes.

Accentio Studios es una empresa de desarrollo de software que ofrece soluciones innovadoras y de calidad para diversos sectores.
