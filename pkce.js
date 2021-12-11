import * as jose from './jose/browser/index.js'
console.log('ddddddd');
let auth0 = null;

const updateUI = async () => {
  // const isAuthenticated = await auth0.isAuthenticated();

  // document.getElementById("btn-logout").disabled = !isAuthenticated;
  // document.getElementById("btn-login").disabled = isAuthenticated;

  if (localStorage.getItem('client-id')) {
    document.getElementById('client-id').value = localStorage.getItem('client-id');
  }

  if (sessionStorage.getItem('codeVerifier')) {
    document.getElementById('code-verifer').value = sessionStorage.getItem('codeVerifier');
  }
  if (localStorage.getItem('oath2-token-decode')) {
    const tokenDecode = JSON.parse(localStorage.getItem('oath2-token-decode'));
    document.querySelector('.notes>label[for="notes"]').textContent = tokenDecode?.nickname + ' notes';

  }
};
window.onload = async () => {
  // auth0 = await createAuth0Client({
  //   domain: 'dev-nfefysox.us.auth0.com',
  //   client_id: 'Egzg4IYGOl95vuMXqtTtzLmIp4kIEdki'
  // });

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
const clientId = document.getElementById('client-id');
const codeChallenge = document.getElementById('code-challenge');
const loginForNoteApi = document.getElementById('loginForNoteApi');
const auth0Form = document.getElementById('auth0Form');
const authCodeBtn = document.getElementById('auth-code-btn');
const authCodeText = document.getElementById('auth-code');
const accessTokenBtn = document.getElementById('access-token-btn');
const accessTokenText = document.getElementById('access-token');
const notesBtn = document.getElementById('notes-btn');
const addNotesBtn = document.getElementById('add-notes-btn');
const notesText = document.getElementById('notes');



generateCodeVerifier.addEventListener("click", () => {
  const codeVerifier = CryptoJS.lib.WordArray.random(43).toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  codeVerifer.value = codeVerifier;
  window.sessionStorage.setItem('codeVerifier', codeVerifier);

})

generateCodeChallenge.addEventListener("click", () => {
  if (codeVerifer.value) {
    const sh256URLBase64 = CryptoJS.SHA256(codeVerifer.value).toString(CryptoJS.enc.Base64).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    console.log(sh256URLBase64);
    const code_challenge = encodeURI(sh256URLBase64)
    codeChallenge.value = code_challenge;
  }
})

loginForNoteApi.addEventListener("click", () => {
  const redirect_uri = window.location.href;
  window.localStorage.setItem('redirect_uri', redirect_uri);
  // get url
  const auth0FormData = new FormData(auth0Form);
  let clientIdtext = auth0FormData.get('client-id');
  if (clientIdtext) {
    window.localStorage.setItem('client-id', clientIdtext);
  } else {
    clientIdtext = window.localStorage.getItem('client-id');
  }
  const urlQuery = new URLSearchParams({
    client_id: clientIdtext,
    scope: `openid profile email ${auth0FormData.get('readnote') || ''} ${auth0FormData.get('writenote') || ''}`,
    audience: 'note-poc',
    response_type: 'code',
    response_mode: 'query',
    // state:
    // nonce:
    redirect_uri: redirect_uri,
    code_challenge: auth0FormData.get('code-challenge'),
    code_challenge_method: 'S256',
    // auth0Client: eyJuYW1lIjoiYXV0aDAtc3BhLWpzIiwidmVyc2lvbiI6IjEuMTIuMSJ9
  });
  console.log(urlQuery.toString());
  const authURl =
    `https://dev-nfefysox.us.auth0.com/authorize?${urlQuery.toString()}`;
  window.location.replace(authURl);
})

authCodeBtn.addEventListener('click', () => {
  const searchUrl = new URLSearchParams(window.location.search);
  if (searchUrl.has('code')) {
    authCodeText.value = searchUrl.get('code');
  }
})

accessTokenBtn.addEventListener('click', async () => {
  const toneRsp = await fetch('https://dev-nfefysox.us.auth0.com/oauth/token', {
    method: 'POST',
    mode: 'cors',
    body: JSON.stringify({
      redirect_uri: window.localStorage.getItem('redirect_uri'),
      client_id: clientId.value,
      code_verifier: codeVerifer.value,
      grant_type: 'authorization_code',
      code: authCodeText.value
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const result = await toneRsp.json();
  console.log(result);
  localStorage.setItem('oath2-token-note', JSON.stringify(result));
  accessTokenText.value = result.access_token;
  const JWKS = jose.createRemoteJWKSet(new URL('https://dev-nfefysox.us.auth0.com/.well-known/jwks.json'))
  const jwt = result.id_token;
  const { payload, protectedHeader } = await jose.jwtVerify(jwt, JWKS, {
    issuer: 'https://dev-nfefysox.us.auth0.com/',
    audience: localStorage.getItem('client-id')
  })
  // console.log(protectedHeader)
  console.log(payload)
  localStorage.setItem('oath2-token-decode', JSON.stringify(payload));
  document.querySelector('.notes>label[for="notes"]').textContent = payload?.nickname + ' notes';
})

notesBtn.addEventListener('click', async () => {
  const tokens = JSON.parse(localStorage.getItem('oath2-token-note'))
  if (tokens) {
    const access_token = tokens.access_token;

    /** @type {Array} */
    const notes = await fetch('https://oauth2-api-note.herokuapp.com/api/auth0/note',
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }).then(res => res.json())

    console.log(notes);
    const notesUl = document.getElementById('notes-ls');
    const noteElements = notes.map(
      note => {
        const li = document.createElement('li');
        li.id = note.id;
        li.textContent = note.content;
        return li
      }
    );
    notesUl.replaceChildren(...noteElements);
  }

})

addNotesBtn.addEventListener('click', async () => {
  const noteText = document.getElementById('add-note')?.value;
  const tokens = JSON.parse(localStorage.getItem('oath2-token-note'));
  if (noteText && tokens) {
    const saveNoteResp = await fetch('https://oauth2-api-note.herokuapp.com/api/auth0/note', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: noteText,
        important: false
      }
      )
    });
    let saveNote = null;
    if (saveNoteResp.ok) {
      saveNote = await saveNoteResp.json();
    } else {
      document.getElementById('add-notes-result').textContent = await saveNoteResp.text();
    }

    if (saveNote) {
      document.getElementById('add-notes-result').textContent = 'add note sucess';
    }
  }


})

