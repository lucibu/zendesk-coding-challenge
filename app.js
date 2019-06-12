
const inquirer = require('inquirer');
const moment = require('moment');
const ticketApiManager = require('./ticket-api-manager.js');
const Choices = {
  PREV_PAGE: 'Previous page',
  NEXT_PAGE: 'Next page',
  TIC_DETAIL: 'View ticket detail',
  QUIT: 'Quit',
  BACK: 'Back'
};
const Status = {
  OK: 'ok',
  UNAUTHORIZED: 'unauthorized',
  API_ERROR: 'APIerror',
  UNEXPECTED: 'unexpected'
};
const ViewStatus = {
  LIST: 'list',
  DETAIL: 'ticketDetail'
};

main();

async function main() {

  welcomeMessage();

  let credentials;
  let status;
  const perPage = 25;
  let ticketsData;

  // insert credentials to log in. Try again in case of spelling error. Program exits if problems with connection or API
  do {
    credentials = await getCredentials();
    console.log("");
    console.log('\tFetching tickets from API, please wait.');
    try {
      ticketsData = await ticketApiManager.fetchTickets(credentials.userName, credentials.password, perPage);
      status = Status.OK;
    } catch(error) {
      if (error.message === ticketApiManager.ErrorTypes.UNAUTHORIZED) {
        console.log("");
        console.log('\tAuthentication failed. Please check your spelling and try again.');
        console.log("");
        status = Status.UNAUTHORIZED;
      } else if (error.message === 'APIerror 500' || error.message === 'APIerror 503' || error.message === 'APIerror 403') {
        console.log("");
        console.log('\tWhoops, seems like there is a problem with the server. Please try again later.');
        console.log("");
        status = Status.API_ERROR;
        return;
      } else if (error.message === ticketApiManager.ErrorTypes.UNEXPECTED) {
        console.log("");
        console.log('\tUnexpected problem. Please check your internet connection.');
        console.log("");
        status = Status.UNEXPECTED;
        return;
      } else {
        console.log("");
        console.log('\tSorry, there was an unexepected undefined problem. Please try again later.');
        console.log("");
        return;
      }
    }  
  } while (status !== Status.OK);

  let currentPage = 1;
  const lastPage = Math.ceil(ticketsData.count / perPage);
  let viewStatus = ViewStatus.LIST;

  // give the user allways the same options all over again until they decide to exit the program
  while (true) {
    let tickets;
    if (viewStatus === ViewStatus.LIST) {
      tickets = ticketsData.tickets;
      console.log("");
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        printTicket(ticket, i + (currentPage - 1) * perPage);
      }
      console.log("");
      // options user see when on a page showing a list of tickets
      const listOptionPrompt = await inquirer.prompt({
        type: 'list',
        name: 'option',
        choices: function() {
          const options = [Choices.PREV_PAGE, Choices.NEXT_PAGE, Choices.TIC_DETAIL, Choices.QUIT];
          if (currentPage === 1) {
            options.splice(options.indexOf(Choices.PREV_PAGE), 1);
          } else if (currentPage === lastPage) {
            options.splice(options.indexOf(Choices.NEXT_PAGE), 1);
          };
          return options;
        },
        message: 'What would you like to do now?'
      });
      // this is what happens after user chose one of the options
      if (listOptionPrompt.option === Choices.QUIT) {
        process.exit();
      } else if (listOptionPrompt.option === Choices.TIC_DETAIL) {
        const ticketNumberPrompt = await inquirer.prompt({
          type: 'input',
          name: 'ticketNumber',
          message: 'Please type ticket number (type B to go back to list):',
          validate: function(value) {
            // validate if input is number or is "B"
            let parsedValue;
            if (value === 'B') {
              return true;
            } else if (currentPage === lastPage) {
              parsedValue = parseInt(value);
              if (parsedValue >= ((currentPage - 1) * perPage) + 1 && parsedValue <= ticketsData.count) {
                return true;
              } else {
                return `Please insert a value between ${((currentPage - 1) * perPage) + 1} and ${ticketsData.count}`;
              }
            } else {
              parsedValue = parseInt(value);
              if (parsedValue >= ((currentPage - 1) * perPage) + 1 && parsedValue <= currentPage * perPage) {
                return true;
              } else {
                return `Please insert a value between ${((currentPage - 1) * perPage) + 1} and ${currentPage * perPage}`;
              }
            }
          }
        });
        // if input = B do nothing and current page will be re-rendered
        if (ticketNumberPrompt.ticketNumber !== 'B') {
          const i = parseInt(ticketNumberPrompt.ticketNumber) - ((currentPage - 1) * perPage) - 1;
          const ticket = tickets[i];
          printTicketDetails(ticket, i + (currentPage - 1) * perPage);
          viewStatus = ViewStatus.DETAIL;
        }
      } else if (listOptionPrompt.option === Choices.NEXT_PAGE) {
        try {
          ticketsData = await ticketApiManager.fetchTickets(credentials.userName, credentials.password, perPage, ticketsData.next_page);
          currentPage += 1;
        } catch (error) {
          console.log("");
          console.log(`\tSorry, there was an unexpected error in API (${error.message}). Please try again later.`);
          process.exit();
        }
      } else if (listOptionPrompt.option === Choices.PREV_PAGE) {
        try {
          ticketsData = await ticketApiManager.fetchTickets(credentials.userName, credentials.password, perPage, ticketsData.previous_page);
          currentPage -= 1;
        } catch (error) {
          console.log("");
          console.log(`\tSorry, there was an unexpected error in API (${error.message}). Please try again later.`);
          process.exit();
        }
      } else {
        console.log("");
        console.log(`\tOkay, ${listOptionPrompt.option} it is!`);
        console.log("");
      }
      // options user see when inside of the ticket detail
    } else if (viewStatus === ViewStatus.DETAIL) {
      const detailOptionPrompt = await inquirer.prompt({
        type: 'list',
        name: 'options',
        message: 'What would you like to do now?',
        choices: [Choices.BACK, Choices.QUIT]
      });

      if (detailOptionPrompt.options === Choices.BACK) {
        viewStatus = ViewStatus.LIST;
      } else if (detailOptionPrompt.options === Choices.QUIT) {
        process.exit();
      }
    }
  }
}

function welcomeMessage() {
  console.log('\t**************************************************');
  console.log('');
  console.log('\tWelcome to the Zendesk Ticket Viewer.');
  console.log('\tPlease insert credentials for lucibu.zendesk.com.' );
  console.log('');
  console.log('\t**************************************************');
}

function printTicket(ticket, ticketIndex) {
  const formattedDate = moment(ticket.created_at).format('lll');
  const priorityString = ticket.priority ? ` [${ticket.priority}]` : '';
  console.log(`\t${ticketIndex + 1}. [${ticket.status}]${priorityString} ${ticket.subject} requested by ${ticket.requester_id} on ${formattedDate}`);
}

function printTicketDetails(ticket, ticketIndex) {
  const formattedDate = moment(ticket.created_at).format('lll');
  const priorityString = ticket.priority ? ` [${ticket.priority}]` : '';
  console.log("");
  console.log("\tShowing details for ticket:");
  console.log("");
  console.log(`\t${ticketIndex + 1}. [${ticket.status}]${priorityString} requested by ${ticket.requester_id} on ${formattedDate}`);
  console.log(`\tSubject: ${ticket.subject}`);
  console.log("");
  console.log("\tDescription:");
  console.log((`${ticket.description}`).replace(/([^\n]{1,80})/g, '\t$1\n')); // source: https://stackoverflow.com/questions/14484787/wrap-text-in-javascript
  console.log("");
}

async function getCredentials() {
  const credentials = {};

  const userNamePrompt = await inquirer.prompt({
    type: 'input',
    default: 'lucia.bubniakova@gmail.com',
    name: 'userName',
    message: 'Please insert your username: '
  });

  credentials.userName = userNamePrompt.userName;

  const passwordPrompt = await inquirer.prompt({
    type: 'password',
    default: 'codingchallenge',
    name: 'password',
    message: 'Please insert your password: '
  });

  credentials.password = passwordPrompt.password;

  return credentials;
}