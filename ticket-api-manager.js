// this module is used to access Zendesk API and request tickets from lucibu.zendesk.com

const axios = require('axios');

const FIRST_PAGE_URL = "https://lucibu.zendesk.com/api/v2/tickets.json";

const ErrorTypes = {
  UNEXPECTED: 'UNEXPECTED',
  UNAUTHORIZED: 'UNAUTHORIZED'
};

async function fetchTickets(username, password, per_page, pageURL) {
  try {
    const res = await axios({
      method: 'get',
      url: pageURL ? pageURL : FIRST_PAGE_URL,
      params: {
        per_page: per_page
      },
      headers: { 'Accept': 'application/json' }, // this api needs this header set for the request
      auth: {
        username: username,
        password: password
      }
    });
    return res.data;
  } catch (err) {
    if (err.response === undefined) {
      throw new Error(ErrorTypes.UNEXPECTED);
    } else if (err.response.status === 500 || err.response.status === 503 || err.response.status === 403) {
      throw new Error(`APIerror ${err.response.status}`);
    } else if (err.response.status === 401) {
      throw new Error(ErrorTypes.UNAUTHORIZED);
    }
  }
}

module.exports.FIRST_PAGE_URL = FIRST_PAGE_URL;
module.exports.fetchTickets = fetchTickets;
module.exports.ErrorTypes = ErrorTypes;