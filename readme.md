# SAR Lib - Libreria para manejar todas las peticiones a la API del SAR
Esta es una librería para manejar peticiones a la API del SAR. Esta clase se puede utilizar para obtener información del usuario y para terminar un reto.

## Requisitos
Esta librería tiene las siguientes dependencias:
 - Toastify-js

## Uso
### Importar la librería
Para utilizar la librería, primero debes importar la libreria en tu proyecto. Puedes hacerlo con el siguiente código:

Usando el CDN de Unpkg:
``` html
    <script src="https://unpkg.com/@500historias/sarlib@latest"></script>
```

Importandolo en Node.js:
``` js
    // commonjs
    const sarlib = require('@500historias/sarlib');

    // ESM
    import sarlib from '@500historias/sarlib';
```

### Inicializar la librería
Para inicializar la librería, debes usar el metodo init() de la instancia SarLib. El metodo toma como argumento un objeto de configuración con las siguientes propiedades:

 - uuid: Identificador único de la solicitud de autenticación.
 - secretKey: Clave secreta proporcionada por SAR.
 - url: URL de la API de SAR (opcional).

Como tercer parametro esta el url (opcional). Este URL es para conectar con el API de SAR en caso de querer apuntar a otro destino que no sea el que es por defecto.

Este método toma como argumento una función de retorno que se ejecutará después de que se complete la inicialización. La función de retorno recibirá el objeto del usuario como argumento.

```js
    sarlib.init({'uuid', 'secretKey'}, (user) => {
        console.log(user);
    });
```

### Recibiendo parametros de la URL
Al momento de inicializar sarlib, automaticamente se va a ejecutar el metodo parseQueryParams(), el cual va a obtener los parametros de la URL y los va a guardar. 

Para obtener los parametros de la URL, puedes usar el metodo getQueryParam('queryParameter').

```js
    const params = sarlib.getQueryParam('userId');
```

### Test Mode
Para casos de desarrollo, es probable que necesites datos de prueba, para estos casos sarlib automaticamente va a detectar el queryParameter 'testMode'. En caso de ser 'true', la libreria va a ser inicializada en modo de pruebas.

```js
    'http://{url-de-tu-app}/?userId=9999&testMode=true'
```

### Entendiendo mejor los parametros de la URL
Los parametros que van a ser mandados a tu aplicación van a provenir automaticamente desde la plataforma del SAR. Estos parametros son los siguientes:

 - userId (obligatorio): El id del usuario que está jugando.
 - storyId: El id de la historia que está relacionada al reto, en caso de haber.
 - readEnded: Tiempo en el que el usuario terminó de leer la historia.
 - readInit: Tiempo en el que el usuario empezó a leer la historia.
 - testMode: Indica si la libreria debe ser inicializada en modo de pruebas.


### Obtener información del usuario
El callback de la funcion init() retorna los datos del usuario. Sin embargo puedes hacer la peticion nuevamente con el método getUser(). Este método devuelve una promesa que se resuelve con el objeto del usuario.

```js
sarlib.getUser()
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
sarlib.finishChallenge(true)
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
sarlib.addStep()
  .then((response) => {
      console.log('Paso terminado exitosamente');
  })
  .catch((error) => {
    console.log(error);
  });
```

## Créditos

Este proyecto es una iniciativa de 500Historias con la ayuda de Accentio Studios.

500Historias es un programa de transformación educativa que busca descubrir e impulsar nuevos talentos de la literatura, así como desarrollar habilidades como la creatividad, el pensamiento crítico y la colaboración en los jóvenes participantes.

Accentio Studios es una empresa de desarrollo de software que ofrece soluciones innovadoras y de calidad para diversos sectores.

Esta documentación fue generada usando GPT 3.5
