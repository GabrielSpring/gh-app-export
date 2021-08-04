import React from "react";
import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  gql
} from "@apollo/client";
import _ from "lodash"

const App = () => {
  // Info for API requests via Apollo
  const client = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache: new InMemoryCache()
  });

  // Used to retrieve the content from the login fields
  const userRef = React.useRef();
  const passRef = React.useRef();

  // Is called when you press the login button
  const handleLogin = () => {
    // Used to retrieve the content from the login fields
    const data = {
      username: userRef.current.value,
      password: passRef.current.value
    };
    // Checks if the username has a match on localStorage
    if (localStorage.getItem(data.username) === data.password) {
      // Alerts the user that the login was successful
      // then it hides the login elements and
      // it adds text with the user's name
      // along with a className which will be used later for favorites
      alert("Welcome " + data.username + ".");
      document.querySelectorAll('.login_input')[0].style.display = 'none';
      document.querySelectorAll('.login_input')[1].style.display = 'none';
      document.querySelectorAll('.login_input')[2].style.display = 'none';
      document.querySelectorAll('.login_input')[3].style.display = 'none';
      document.querySelector('.header_login').textContent = "Welcome " + data.username;
      var loginfo = document.createElement("del");
      loginfo.className = "logininfo user_" + data.username;
      document.querySelector('.header_login').appendChild(loginfo)

      // Checks if the is any favorites already added before login
      if (document.querySelector('#favorites > .product_test > .detail_btn') !== null) {
        // It saves and formats the existing favorites 
        // into an array with only the IDs
        var favorite_backup = [document.querySelectorAll('#favorites > .product_test')];
        var idarray = [];
        for (let i = 0; i < favorite_backup[0].length; i++) {
          idarray.push(favorite_backup[0][i].lastChild.value);
        }

        // Retrieves existing favorites from localStorage 
        let logdata = localStorage.getItem("user_" + data.username);
        if (logdata === null)
          logdata = '';
        logdata = logdata.split(',');
        logdata.pop();

        // Merges the existing favorites with the ones added before login
        let manudata = _.union(idarray, logdata);
        // Requests and renders all requested products by their ID
        getFavorites(manudata);
        let finaldata = '';
        for (let i = 0; i < manudata.length; i++) {
          finaldata = finaldata + manudata[i] + ",";
        }

        // Saves the merged favorites
        localStorage.setItem("user_" + data.username, finaldata);

      } else {
        // Retrieves existing favorites from localStorage
        let logdata = localStorage.getItem("user_" + data.username);
        if (logdata === null)
          logdata = '';
        logdata = logdata.split(',');
        logdata.pop();
        // Requests and renders all requested products by their ID
        getFavorites(logdata);
      }

    } else {
      alert("Wrong credentials.");
    }
  }

  const handleRegister = () => {
    // Used to retrieve the content from the login fields
    const data = {
      username: userRef.current.value,
      password: passRef.current.value
    };
    // Checks if the user is already registered
    if (localStorage.getItem(data.username) === null) {
      localStorage.setItem(data.username, data.password);
      alert("Account created.")
    } else {
      alert("User already exists.")
    }
  }

  const getFavorites = async (v) => {

    // Empties the favorites
    const listing = document.querySelector("#favorites");
    while (listing.firstChild) {
      listing.removeChild(listing.lastChild);
    }

    // Loop that runs for each ID that must be added
    for (var i = 0; i < v.length; i++) {

      const variables = { id: v[i] }

      const jsondata = await weebResponse(variables);
      if (jsondata.error) {
        continue
      }

      // Creates an element with JavaScript for each favorite along with a button
      let btn = document.createElement("button");
      btn.className = "detail_btn";
      btn.innerHTML = "Remove from favorites";
      btn.value = v[i];
      let divs = document.createElement("div");
      divs.className = "product_test prodid" + v[i];
      divs.innerHTML = "ID: " + v[i] + "<br>Title: " +
        jsondata.title.romaji + "<br> Score: " +
        jsondata.averageScore + "<br> Year: " +
        jsondata.startDate.year + "<br> Status: " +
        jsondata.status + "<br>";

      btn.onclick = () => { handleFavoriteRemove(divs); };
      document.querySelector('#favorites').appendChild(divs)
      divs.appendChild(btn);
    }
  }

  const postProductWeeb = async () => {

    const variables = { id: 1 }

    // Empties the products
    const listing = document.querySelector("#products");
    while (listing.firstChild) {
      listing.removeChild(listing.lastChild);
    }

    // Loop that runs for 75 IDs 
    for (variables.id; variables.id < 75; variables.id++) {
      const jsondata = await weebResponse(variables);
      if (jsondata.error) {
        continue
      }

      // Creates an element with JavaScript for each product along with a button
      let btn = document.createElement("button");
      btn.className = "detail_btn";
      btn.innerHTML = "Add to favorites";
      btn.value = variables.id;
      let divs = document.createElement("div");
      divs.className = "product_test prodid" + variables.id;
      divs.innerHTML = "ID: " + variables.id + "<br>Title: " +
        jsondata.title.romaji + "<br> Score: " +
        jsondata.averageScore + "<br> Year: " +
        jsondata.startDate.year + "<br> Status: " +
        jsondata.status + "<br>";

      btn.onclick = () => { handleFavoriteAdd(divs); };
      document.querySelector('#products').appendChild(divs)
      divs.appendChild(btn);

    }
  }

  // Function to retrieve from the Graphql API 
  const weebResponse = async (v) => {
    try {
      var query = gql`
      query ($id: Int) {
        Media(id: $id) {
          title {
            romaji
          }
          status
          startDate {
            year
          }
          averageScore
        }
      }
      `;
      const response = await client.query({ query, variables: v });
      return response.data.Media;
    }
    catch {
      return { error: true, msm: "Couldnt retrieve media" };
    }
  }

  // Handles the action of adding products to the favorites tab
  const handleFavoriteAdd = async (divs) => {
    // Makes a deep clone to avoid tampering with the original product
    let shouldadd = divs.cloneNode(true);

    // Swaps the button for one that removes from the favorites tab
    let btnnumb = divs.querySelector('.detail_btn')
    btnnumb = btnnumb.value;
    shouldadd.removeChild(shouldadd.lastChild);

    let btn = document.createElement("button");
    btn.className = "detail_btn";
    btn.innerHTML = "Remove from favorites";
    btn.value = btnnumb;
    btn.onclick = () => { handleFavoriteRemove(shouldadd); };
    shouldadd.appendChild(btn);

    // Checks if the favorite is already added 
    if (document.querySelector('#favorites > .prodid' + btnnumb) === null) {
      // Adds the favorite and checks to see if the user is logged in
      document.querySelector('#favorites').appendChild(shouldadd);
      var loginfo = document.querySelector('.logininfo');
      if (loginfo !== null) {
        // When logged in it will retrieve the user login from the header
        // and use it along with the localStorage to retrieve existing favorites,
        // merge with the new one and store the updated data
        loginfo = loginfo.className.split(' ')[1];
        var logdata = localStorage.getItem(loginfo);
        let shouldaddid = shouldadd.cloneNode(true);
        shouldaddid = shouldaddid.className.split(' ')[1].split('prodid')[1];
        if (logdata === null)
          logdata = '';
        logdata = logdata + shouldaddid + ",";
        localStorage.setItem(loginfo, logdata);
      } else {
        alert('Favorites will be saved on login.');
      }
    }
  }

  // Handles the action of removing products to the favorites tab
  const handleFavoriteRemove = async (divs) => {
    // Makes a deep clone to still have access to the data
    let shouldadd = divs.cloneNode(true);
    divs.remove();

    var loginfo = document.querySelector('.logininfo');
    if (loginfo !== null) {
      // When logged in it will retrieve the user login from the header
      // and use it along with the localStorage to retrieve existing favorites,
      // remove the requested one and store the updated data
      loginfo = loginfo.className.split(' ')[1];
      var logdata = localStorage.getItem(loginfo);
      let shouldaddid = shouldadd.cloneNode(true);
      shouldaddid = shouldaddid.className.split(' ')[1].split('prodid')[1];

      let newarray = logdata.replace(shouldaddid + ',', '');
      localStorage.setItem(loginfo, newarray);
    } else {
      alert('Favorites will be saved on login.');
    }
  }

  // Button that clears all favorites from both the DOM and localStorage
  const clearFav = async () => {
    var loginfo = document.querySelector('.logininfo');
    if (loginfo === null) {
      alert('Please login first.');
    } else {
      loginfo = loginfo.className.split(' ')[1];
      localStorage.setItem(loginfo, '');
      if (document.querySelector('#favorites').firstChild) {
        while (document.querySelector('#favorites').firstChild) {
          let removepls = document.querySelector('#favorites').firstChild;
          removepls.remove();
        }
      }
    }
  }

  // HTML
  return (
    <ApolloProvider client={client} className="App">
      <header></header>
      <body>
        <div id="container">
          <div id="header">
            <div className="table_element">
              Growth Hackers App
            </div>
            <div className="table_element header_login">
              <input ref={userRef} type="text" className="login_input user_input" id="user" name="user" placeholder="User" />
              <input ref={passRef} type="text" className="login_input pass_input" id="pass" name="pass" placeholder="Password" />
              <button className="login_input login_btn" id="login_btn"
                onClick={() => { handleLogin() }}>Login</button>
              <button className="login_input register_btn" id="register_btn"
                onClick={() => { handleRegister() }}>Register</button>
            </div>
          </div>
          <div id="content">
            <button className="detail_btn" onClick={() => { postProductWeeb() }}>Refresh</button>
            <button className="detail_btn btn_right" onClick={() => { clearFav() }}>Clear favorites</button>
            <div className="main">
              <div className="table_element prod_main">
                Products
                <div id="products"></div>
              </div>
              <div className="table_element fav_main">
                Favorites
                <div id="favorites"></div>
              </div>
            </div>
          </div>
          <div id="footer"> 
            Made by <p>Gabriel Bonatto Buffon</p> for <p>Growth Hackers</p>
          </div>
        </div>
      </body>
    </ApolloProvider>
  );
}

export default App;
