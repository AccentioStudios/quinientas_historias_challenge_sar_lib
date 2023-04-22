import axios, * as others from "axios";

/**
 * Class to manage all the requests to the API
 * @param {string} jwt - JWT of the user
 * @param {string} url - URL of the API
 * @returns {object} - Object with all the methods
 *
 * @example
 * const sar = new SarLib("jwt","url");
 * sar.getAllAvaliableChallenges();
 * sar.addStep();
 * sar.finishChallenge();
 * sar.getAllChallenges();
 * sar.getActiveChallengeUser();
 *
 */
export default class SarLib {
  constructor(jwt, url) {
    this.axios = axios;
    this.urlApi = url || "https://500h-sar-dev.accentiostudios.com";
    this.jwt = jwt;
  }
  /**
   * Method to get all avaliable challenges
   * @returns object
   *
   */
  getAllAvaliableChallenges() {
    return this.callAxios(
      "GET",
      "/get-retos",
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
      {}
    );
  }

  /**
   * Method to get add a step to an unfinished challenge
   * @returns object
   */
  addStep() {
    return this.callAxios(
      "POST",
      "/add-paso",
      {
        "Content-Type": "application/json",
        authorization: `Bearer ${this.jwt}`,
      },
      {}
    );
  }
  /**
   * Method to finish challenge
   * @returns object
   */
  finishChallenge() {
    return this.callAxios(
      "POST",
      "/finish-reto",
      {
        "Content-Type": "application/json",
        authorization: `Bearer ${this.jwt}`,
      },
      {}
    );
  }
  /**
   * Method to get all challenges assigned to user
   * @returns object
   */
  getAllChallenges() {
    return this.callAxios(
      "GET",
      "/get-asignados-retos?all=true",
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
      {}
    );
  }
  /**
   * Method to get all actives challenges for a user
   * @returns object
   */
  getActiveChallengeUser() {
    return this.callAxios(
      "GET",
      "/get-asignados-retos?active=true",
      {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.jwt}`,
      },
      {}
    );
  }

  /**
   * Method to call axios
   * @param {*} method
   * @param {*} url
   * @param {*} headers
   * @param {*} params
   * @returns
   */
  async callAxios(method, url, headers, params) {
    try {
      return (
        await this.axios({
          headers: headers,
          method: method,
          url: this.urlApi + url,
          data: params,
        })
      ).data;
    } catch (error) {
      console.log(
        "peticion fallo con codigo: ",
        error.response.status,
        " y mensaje: ",
        error.response.data.message
      );
      throw new Error(error.response.data.message);
    }
  }
}
