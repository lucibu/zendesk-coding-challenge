import test from 'ava';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ticketApiManager from './ticket-api-manager';
const mockAdapter = new MockAdapter(axios);

// testing cases of an error in API - if the code handles this error accordingly

test('Test get tickets from API', async t => {
  mockAdapter.onGet(ticketApiManager.FIRST_PAGE_URL).replyOnce(200, {
    tickets: [
    {
      id: 123456,
      subject: "This is a subject."
    },
    {
      id: 67890,
      subject: "Another subject."
    }
    ],
    count: 2,
    next_page: "next"
  });

  const ticketData = await ticketApiManager.fetchTickets("username", "password", 2);

  t.is(ticketData.count, 2);
  t.is(ticketData.tickets.length, 2);
});

test('Test authentication failed', async t => {
  mockAdapter.onGet(ticketApiManager.FIRST_PAGE_URL).replyOnce(401);
  try {
    const ticketData = await ticketApiManager.fetchTickets("username", "password", 2);
  } catch(error) {
    t.is(error.message, 'UNAUTHORIZED');
  }
});

test('Test error in API service 500', async t => {
  mockAdapter.onGet(ticketApiManager.FIRST_PAGE_URL).replyOnce(500);
  try {
    const ticketData = await ticketApiManager.fetchTickets("username", "password", 2);
  } catch(error) {
    t.is(error.message, 'APIerror 500');
  }
});

test('Test error in API service 503', async t => {
  mockAdapter.onGet(ticketApiManager.FIRST_PAGE_URL).replyOnce(503);
  try {
    const ticketData = await ticketApiManager.fetchTickets("username", "password", 2);
  } catch(error) {
    t.is(error.message, 'APIerror 503');
  }
});

test('Test error in API service 403', async t => {
  mockAdapter.onGet(ticketApiManager.FIRST_PAGE_URL).replyOnce(403);
  try {
    const ticketData = await ticketApiManager.fetchTickets("username", "password", 2);
  } catch(error) {
    t.is(error.message, 'APIerror 403');
  }
});

test('Test network error', async t => {
  mockAdapter.onGet(ticketApiManager.FIRST_PAGE_URL).networkErrorOnce();
  try {
    const ticketData = await ticketApiManager.fetchTickets("username", "password", 2);
  } catch(error) {
    t.is(error.message, ticketApiManager.ErrorTypes.UNEXPECTED);
  }
});

