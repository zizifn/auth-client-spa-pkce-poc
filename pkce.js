console.log('ddddddd');
const auth0 = await createAuth0Client({
    domain: 'dev-nfefysox.us.auth0.com',
    client_id: 'Egzg4IYGOl95vuMXqtTtzLmIp4kIEdki'
  });

  window.onload = async () => {
    await configureClient();
  }


