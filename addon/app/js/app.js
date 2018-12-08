firebase.initializeApp(CONFIG);

function initApp() {
  firebase
    .auth()
    .onAuthStateChanged(function (user) {
      if (user) {
        // User is signed in. var uid = user.uid; window.location.href = "app.html";
        const uid = user.uid;
        const name = user.displayName;
        getUserData(uid);

        document
          .getElementById('quickstart-button')
          .textContent = 'Sign out';
        document
          .querySelector('.quickstart-user-details-container .container')
          .style
          .opacity = '1';
        document
          .querySelector('.header h3')
          .innerHTML = name;
        document
          .querySelector('.header')
          .style
          .flexDirection = 'row';

      } else {}
      document
        .getElementById('quickstart-button')
        .disabled = false;
    });

  document
    .getElementById('quickstart-button')
    .addEventListener('click', startSignIn, false);
}

/**
 * Start the auth flow and authorizes to Firebase.
 * @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
 */
function startAuth(interactive) {
  // Request an OAuth token from the Chrome Identity API.
  chrome
    .identity
    .getAuthToken({
      interactive: !!interactive
    }, function (token) {
      if (chrome.runtime.lastError && !interactive) {
        console.log('It was not possible to get a token programmatically.');
      } else if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else if (token) {
        // Authorize Firebase with the OAuth Access Token.
        var credential = firebase
          .auth
          .GoogleAuthProvider
          .credential(null, token);
        firebase
          .auth()
          .signInAndRetrieveDataWithCredential(credential)
          .catch(function (error) {
            // The OAuth token might have been invalidated. Lets' remove it from cache.
            if (error.code === 'auth/invalid-credential') {
              chrome
                .identity
                .removeCachedAuthToken({
                  token: token
                }, function () {
                  startAuth(interactive);
                });
            }
          });
      } else {
        console.error('The OAuth Token was null');
      }
    });
}

/**
 * Starts the sign-in process.
 */
function startSignIn() {
  document
    .getElementById('quickstart-button')
    .disabled = true;
  if (firebase.auth().currentUser) {
    firebase
      .auth()
      .signOut();
    window.close();
  } else {
    startAuth(true);
  }
}

window.onload = function () {
  initApp();
};

function writeUserData(item) {
  const {description, price, category} = item;
  firebase
    .database()
    .ref('users/' + firebase.auth().currentUser.uid)
    .push({description: description, price: price, category: category});
  getUserData(firebase.auth().currentUser.uid);
}

function getUserData(uid) {
  firebase
    .database()
    .ref('users/' + uid)
    .once('value')
    .then(snapshot => {
      const expenses = [];

      snapshot.forEach(childSnapshot => {
        expenses.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      localStorage.setItem('items', JSON.stringify(expenses));
      generateList(expenses);
    });
}

function deleteUserData(id) {
  firebase
    .database()
    .ref('users/' + firebase.auth().currentUser.uid + '/' + id)
    .remove()
    .then(() => {
      getUserData(firebase.auth().currentUser.uid);
    });
}

function generateList(expenses) {
  const tbody = document.querySelector('tbody');
  const total = document.querySelector('.total span');
  let totalCalc = 0;
  tbody.innerHTML = '';
  expenses.map((item, index) => {
    const price = +item.price;
    totalCalc += + item.price;
    const listItem2 = `
      <tr>     
        <th>${item
      .description}</th>     
        <td>$${price
      .toFixed(2)}</td>     
        <td>${item
      .category}</td>    
        <td><i class="fas fa-trash-alt" id="${item
      .id}"></td>   
      </tr>   
    `;
    const tr = document.createElement('tr');
    tr.innerHTML = listItem2;
    tbody.appendChild(tr);
  });
  total.innerText = totalCalc.toFixed(2);
}