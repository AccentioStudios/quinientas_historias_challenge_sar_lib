'use strict';

import Toastify from 'toastify-js'
import { extend } from './utils.js';
import ImagesBase64 from './images-base64.js';
const { detect } = require('detect-browser');
// SARLIB v1.0.0-beta Copyright (c) 2023-present 500Historias and Collaborators

/**
 * SARLIB v1.0.0-beta Copyright (c) 2023-present 500Historias and Collaborators
 * Clase para manejar todas las peticiones a la API del SAR
*/
class SarLib {
  constructor() {
    this.initialized = false;
    this.secretKey = null;
    this.challengeUUID = null;
    this.params = [];
    this.urlApi = "https://sarapi.500historias.com";
    this.user = null;
    this.testMode;
    this.browser = false;
  }

  /**
  * Inicializa la libreria, obtiene el usuario y lo retorna en el callback
  * @param {object} config - Objeto con la configuracion de la API (uuid, secretKey, url(optional))
  * @param {object} callback - Funcion que se ejecuta al terminar de inicializar, retorna el usuario (optional)
  * @returns {object} - Instancia de la clase SarLib
  *
  * @example
  * sar.init({'uuid', 'secretKey'}, (user) => {
  *   console.log(user);
  * });
  */

  async verifyIfIsBrowser() {
    const browser = detect();
    if(browser) {
      this.browser = true;
    }
  }

  async init({uuid, secretKey, options, url = "https://sarapi.500historias.com"}, callback) {
    try {
      if(document != undefined) {
        this.browser = true;
      }

      this.secretKey = secretKey;
      this.challengeUUID = uuid;
      this.urlApi = url || "https://sarapi.500historias.com";

      if(this.browser) {
        this.createLoadingScreen();
        this.removeErrorScreen();
      }
      this.parseParams(options);
      const testMode = this.getQueryParam("testMode") === 'true';
      this.testMode = testMode;
      
      setTimeout(async () => {
        const responses = await Promise.all([
          this.getUser(),
        ]).catch(error => {
          this.createErrorScreen(error.message);
          throw error;
        });
          this.initialized = true;
          this.removeLoadingScreen();
          callback(this.user);
      }, 2000);

      return this;
    } catch(error) {
      if(this.browser) {
        this.createErrorScreen('Error al inicializar. Carga nuevamente el juego.');
      }
      throw error;
    }
  }

  /**
   * Metodo parsear los parametros de la URL y los guarda dentro de SarLib.queryParams;
   * @example
   * sar.parseQueryParams();
   */
  parseParams({userId, storyId ,testMode}) {
    if(this.browser) {
      const searchParams = new URLSearchParams(window.location.search);
      for (const [key, value] of searchParams) {
        this.params[encodeURIComponent(key)] = encodeURIComponent(value);
      }
    } else {
      if(userId) this.params[userId] = userId;
      if(storyId) this.params[storyId] = storyId;
      if(testMode) this.params[testMode] = testMode;
    }
  }
  /**
   * Metodo para obtener un parametro de la URL
   * @param {string} paramName - Nombre del parametro a obtener
   * @returns {string} - Valor del parametro
   * @example
   * sar.getQueryParam('userId');
   * // returns '123456'
   * @example
   * sar.getQueryParam('testMode');
   * // returns 'true'
   */
  getQueryParam(paramName) {
    const paramValue = this.params[encodeURIComponent(paramName)];
    if (paramValue !== null) {
      return encodeURIComponent(paramValue);
    }
    return '';
  }
    
    
  /**
  * Metodo para obtener todos los el usuario
  * @returns Promise<User>
  * @example
  * const user = await sar.getUser();
  * // returns User
  */
    async getUser() {
      try {
        const userId = this.getQueryParam("userId");
        let myHeaders = new Headers();
        myHeaders.append("sar-secret-key", this.secretKey);
        myHeaders.append("sar-challenge-uuid", this.challengeUUID);
        myHeaders.append("sar-test-mode", this.testMode.toString());
        var requestOptions = {
          method: 'GET',
          headers: myHeaders,
          redirect: 'follow'
        };
        const response = await fetch(`${this.urlApi}/v1/challenge/user?id=${userId}`, requestOptions);
        if(response) {
          if(response.ok) {
              const data = await response.json();
              this.user = data;
              return data;
          } else {
            this.toaster('Status Code: ' + response.status)
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
  addStep() {
    this.retryIfNotDone(async () => {
      const response = await fetch(`${this.urlApi}/v1/challenge/add-step`);
      const data = await response.json();
      return data;
    });
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
  async finishChallenge(success) {
    var isMobile = this.getQueryParam('isMobile') === 'true';
    try {
      this.createLoadingScreen();
      await this.sendRequest('/v1/challenge/finish', {
        method: 'POST',
        body: {
          userId: this.user.id,
          uuid: this.challengeUUID,
          success: success
        }
      });
      this.createSuccessScreen(success);
      this.removeLoadingScreen();
      // wait 2 seconds for close the web view
      await new Promise(resolve => setTimeout(() => {
        this.closeWebView(success);
        resolve();
      }, 2000));
    } catch (error) {
      this.removeLoadingScreen();
      // this.createErrorScreen(error.message);
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
    this.removeErrorScreen();
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
    this.createErrorScreen('Se ha intentado 3 veces y no se ha podido realizar la operación');
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
    this.removeErrorScreen();

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
        this.toaster(error.message);
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

  /**
   * Metodo para mostrar un toast
   * @param {string} message - Mensaje del toast
   * @example
   * sar.toaster('Este es un toast');
  */
  toaster(message) {
    Toastify({
      text: message || "This is a toast",
      duration: 3000,
      newWindow: true,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "left", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#930006",
        color: "#FFDAD4",
      },
      onClick: function(){} // Callback after click
    }).showToast();
  }
}

function createInstance() {
  const instance = new SarLib();
  
  // Copy SarLib.prototype to context 
  extend(instance, SarLib.prototype, null, {allOwnKeys: true});

  return instance;
}

// Create the default instance to be exported
const sarLib = createInstance();
// Expose class to allow class inheritance
sarLib.SarLib = SarLib;

sarLib.default = sarLib;

export default sarLib;