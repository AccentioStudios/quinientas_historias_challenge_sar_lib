import { extend } from './utils.mjs';

// SARLIB v1.0.0-beta Copyright (c) 2023-present 500Historias and Collaborators

/**
 * SARLIB v1.0.0-beta Copyright (c) 2023-present 500Historias and Collaborators
 * Clase para manejar todas las peticiones a la API del SAR
 * @param {string} options.uuid - UUID del reto
 * @param {string} options.secretKey - Llave secreta del reto
 * @param {object} options.testMode - Modo de prueba
*/
class SarLib {
  constructor({uuid, secretKey, testMode}) {
    this.initialized = true;
    this.secretKey = secretKey;
    this.challengeUUID = uuid;
    this.urlApi = "https://500h-sar-dev.accentiostudios.com";
    this.user = null;
    this.testMode = testMode ?? false;
    this.browser = false;
  }
    
  /**
  * Metodo para obtener todos los el usuario
  * @returns Promise<User>
  * @example
  * const user = await sar.getUser();
  * // returns User
  */
    async getUser(userId) {
      try {
        const currentUserId = userId;
        let myHeaders = new Headers();
        myHeaders.append("sar-secret-key", this.secretKey);
        myHeaders.append("sar-challenge-uuid", this.challengeUUID);
        myHeaders.append("sar-test-mode", this.testMode.toString());
        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };
        const response = await fetch(`${this.urlApi}/v1/challenge/user?id=${currentUserId}`, requestOptions);
        if(response) {
          if(response.ok) {
              const data = await response.json();
              this.user = data;
              return data;
          } else {

            throw new Error('Error en la respuesta del servidor.');
          }
        }
      } catch(error) {
        if(error instanceof Error) {
          throw error;
        }
        throw new Error('Error al obtener informacion del usuario al inicializar.');
      }
    }


  /**
   * Metodo para terminar un paso en un reto con pasos
   * @returns Promise<object>
   * @example
   * const response = await sar.addStep();
   * // returns {success: true}
   */
  addStep(userId) {
    try {
      return this.sendRequest('/v1/challenge/add-step', {
        method: 'POST',
        body: {
          userId: userId,
          uuid: this.challengeUUID,
        }
      });
    } catch (error) {
      throw error;
    }
  }


  /** 
   * Metodo para cerrar el webview (solo para mobile)
   * @param {boolean} success - Indica si el reto fue exitoso o no
   * @example
   * sar.closeWebView(true);
   * // returns true
  */
  closeWebView(success) {
    if(window.messageHandler) {
      window.messageHandler.postMessage(success);
      window.close();
    }
  }


  /**
  * Metodo para terminar un reto 
  * @param {boolean} success - Indica si el reto fue exitoso o no
  * @example
  * sar.finishChallenge(true);
  * // returns true
  */
  async finishChallenge(userId, success) {
    try {
      return this.sendRequest('/v1/challenge/finish', {
        method: 'POST',
        body: {
          userId: userId,
          uuid: this.challengeUUID,
          success: success
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Metodo para reintentar una operacion si no se ha inicializado, con un maximo de 3 intentos
   * @param {function} func - Funcion a ejecutar
   * @returns Promise<any>
   * @example
   * sar.retryIfNotDone(async () => {
   *  const response = await fetch(`${this.urlApi}/v1/challenge/add-step`);
   *  const data = await response.json();
   *  return data;
   * });
  */
  async retryIfNotDone(func) {
    let count = 0;
    while (count < 3) {
      const result = await func();
      if (this.initialized === true) {
        return result;
      } else {
        count++;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    throw new Error('Se ha intentado 3 veces y no se ha podido realizar la operación');
  }


  /**
   * Metodo para enviar una peticion al servidor
   * @param {string} endpoint - Endpoint a donde se va a realizar la peticion
   * @param {object} options - Opciones de la peticion
   * @param {string} options.method - Metodo de la peticion
   * @param {object} options.body - Cuerpo de la peticion
   * @returns Promise<any>
   * @example
   * sar.sendRequest('/v1/challenge/finish', {
   *  method: 'POST',
   *  body: {
   *    userId: this.user.id,
   *    uuid: this.challengeUUID,
   *    success: success
   *  }
   * });
  */
  async sendRequest(endpoint, options = {}) {
    const urlApi = this.urlApi;

    const headers = {
      'Content-Type': 'application/json',
      'sar-challenge-uuid': this.challengeUUID,
      'sar-secret-key': this.secretKey,
      'sar-test-mode': this.testMode?.toString()
    };

    const requestOptions = {
      method: options.method || 'GET',
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : null,
    };

    let data = null;

    await this.retryIfNotDone(async () => {
      try {
        const response = await fetch(urlApi + endpoint, requestOptions);
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('Error en la respuesta del servidor.');
        }
      } catch (error) {

        throw new Error(error);
      }
    });

    return data;
  }

  /**
   * Metodo para mostrar pantalla de carga
   * @example
   * sar.createLoadingScreen();
  */
  createLoadingScreen() {
    const splashScreen = document.createElement('div');
    splashScreen.id = 'splashScreen';
    splashScreen.style.width = '100%';
    splashScreen.style.height = '100%';
    splashScreen.style.backgroundColor = '#101C29';
    splashScreen.style.position = 'fixed';
    splashScreen.style.top = '0';
    splashScreen.style.left = '0';
    splashScreen.style.display = 'flex';
    splashScreen.style.justifyContent = 'center';
    splashScreen.style.alignItems = 'center';
    splashScreen.style.zIndex = '10000000';
    // container flexible with centered image of gif and a text with loading message
    splashScreen.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; padding: 24px;">

        <img src="${ImagesBase64.loadingAnimation}" style="width: 180px; height: 180px;">
        <h1 style="color: white; font-size: 18px; margin-top: 18px;">Cargando...</h1>
      </div>
      
    `
    document.body.appendChild(splashScreen);
  }

  /**
   * Metodo para mostrar pantalla de exito
   * @param {boolean} win - Indica si el reto fue exitoso o no
   * @example
   * sar.createSuccessScreen(true);
  */
  createSuccessScreen(win) {
    // first we remove all the content inside the #sar-game-app div
    const sarGameApp = document.getElementById('sar-game-app');
    sarGameApp.innerHTML = '';
    // then we create a div with the id successScreen
    const successScreen = document.createElement('div');
    successScreen.id = 'successScreen';
    successScreen.style.width = '100%';
    successScreen.style.height = '100%';
    successScreen.style.backgroundColor = '#101C29';
    successScreen.style.position = 'fixed';
    successScreen.style.top = '0';
    successScreen.style.left = '0';
    successScreen.style.display = 'flex';
    successScreen.style.justifyContent = 'center';
    successScreen.style.alignItems = 'center';
    successScreen.style.zIndex = '10000000';
    // container flexible with centered image of gif and a text with loading message
    successScreen.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; padding: 24px;">
  
        <h1 style="color: white; font-size: 18px; margin-top: 18px;">Game Over!</h1>
        <h3 style="color: white; font-size: 16px; margin-top: 0px; text-align:center; font-weight: 400;">${win === true ? 'Felicidades, has obtenido puntos gracias a ganar el juego. Sigue así' : 'Lamentablemente no has obtenido puntos esta vez, pero sigue intentando!'}</h3>
      </div>
      
    `
    document.body.appendChild(successScreen);
  }

  /**
   * Metodo para mostrar pantalla de error
   * @param {string} message - Mensaje de error
   * @example
   * sar.createErrorScreen('Error al cargar el juego');
  */
  createErrorScreen(message) {
    this.removeErrorScreen();
    const errorScreen = document.createElement('div');
    errorScreen.id = 'errorScreen';
    errorScreen.style.width = '100%';
    errorScreen.style.height = '100%';
    errorScreen.style.backgroundColor = '#101C29';
    errorScreen.style.position = 'fixed';
    errorScreen.style.top = '0';
    errorScreen.style.left = '0';
    errorScreen.style.display = 'flex';
    errorScreen.style.justifyContent = 'center';
    errorScreen.style.alignItems = 'center';
    errorScreen.style.zIndex = '10000001';
    // container flexible with centered image of gif and a text with loading message
    errorScreen.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; padding: 24px;">

        <img src="${ImagesBase64.errorImage}" style="width: 120px; height: 120px;">
        <h1 style="color: white; font-size: 20px; margin-top: 24px; text-align:center;">Oops...</h1>
        <h3 style="color: white; font-size: 16px; margin-top: 0px; text-align:center; font-weight: 400;">${message}</h3>
      </div>
      
    `
    document.body.appendChild(errorScreen);
  }


  /**
   * Metodo para eliminar pantalla de error
   * @example
   * sar.removeErrorScreen();
  */
  removeErrorScreen() {
    const errorScreen = document.querySelector('#errorScreen');
    if(errorScreen) {
      errorScreen.parentNode.removeChild(errorScreen);
    }
  }

  /**
   * Metodo para eliminar pantalla de exito
   * @example
   * sar.removeSuccessScreen();
  */
  removeSuccessScreen() {
    const successScreen = document.querySelector('#successScreen');
    if(successScreen) {
      successScreen.parentNode.removeChild(successScreen);
    }
  }

  /**
   * Metodo para eliminar pantalla de carga
   * @example
   * sar.removeLoadingScreen();
  */
  removeLoadingScreen() {
    const splashScreen = document.querySelector('#splashScreen');
    if(splashScreen) {
      splashScreen.parentNode.removeChild(splashScreen);
    }
  }
}

function createInstance({uuid, secretKey, testMode}) {
  const instance = new SarLib({uuid: uuid, secretKey: secretKey, testMode: testMode});
  
  // Copy SarLib.prototype to context 
  extend(instance, SarLib.prototype, null, {allOwnKeys: true});

  return instance;
}

SarLib.useExpress = ({uuid, secretKey, testMode}) => (req, res, next) => {
  // Create the default instance to be exported
  const sarLib = createInstance({uuid: uuid, secretKey: secretKey, testMode: testMode});
  req.sar = sarLib;
  next();
};
export default SarLib;