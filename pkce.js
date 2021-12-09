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

const generateCodeVerifier = document.getElementById('generate-code-verifier');
const generateCodeChallenge = document.getElementById('generate-code-challenge');
const codeVerifer = document.getElementById('code-verifer');
const codeChallenge = document.getElementById('code-challenge');

generateCodeVerifier.addEventListener("click", () => {
  const codeVerifier = CryptoJS.lib.WordArray.random(43).toString(CryptoJS.enc.Base64);
  codeVerifer.value = codeVerifier;
})

generateCodeChallenge.addEventListener("click", () => {
  if (codeVerifer.value) {
    const sh256URLBase64 = CryptoJS.SHA256(codeVerifer.value).toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    console.log(sh256URLBase64);
    const code_challenge = encodeURI(sh256URLBase64)
    codeChallenge.value = code_challenge;

  }
})