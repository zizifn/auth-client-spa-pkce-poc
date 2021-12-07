console.log('ddddddd');
let auth0 = null;

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();
  
    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;
  };


  window.onload = async () => {
    auth0 = await createAuth0Client({
        domain: 'dev-nfefysox.us.auth0.com',
        client_id: 'Egzg4IYGOl95vuMXqtTtzLmIp4kIEdki'
      });

      updateUI();
  }


  const login = async () => {
    await auth0.loginWithRedirect({
      redirect_uri: window.location.href
    });
  };
