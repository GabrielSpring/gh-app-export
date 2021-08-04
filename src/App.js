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

  const client = new ApolloClient({
    uri: 'https://graphql.anilist.co',
    cache: new InMemoryCache()
  });

  const userRef = React.useRef();
  const passRef = React.useRef();

  const handleLogin = () => {
    const data = {
      username: userRef.current.value,
      password: passRef.current.value
    };
    if (localStorage.getItem(data.username) === data.password) {
      alert("Welcome " + data.username);
      document.querySelectorAll('.login_input')[0].style.display = 'none';
      document.querySelectorAll('.login_input')[1].style.display = 'none';
      document.querySelectorAll('.login_input')[2].style.display = 'none';
      document.querySelectorAll('.login_input')[3].style.display = 'none';
      document.querySelector('.header_login').textContent = "Welcome " + data.username;
      var loginfo = document.createElement("del");
      loginfo.className = "logininfo user_" + data.username;
      document.querySelector('.header_login').appendChild(loginfo)

      if (document.querySelector('#favorites > .product_test > .detail_btn') !== null) {
        var favorite_backup = [document.querySelectorAll('#favorites > .product_test')];
        var idarray = [];
        for (let i = 0; i < favorite_backup[0].length; i++) {
          idarray.push(favorite_backup[0][i].lastChild.value);
        }

        let logdata = localStorage.getItem("user_" + data.username);
        if (logdata === null)
          logdata = '';
        logdata = logdata.split(',');
        logdata.pop();

        let mandata = _.union(idarray, logdata);
        getFavorites(mandata);
        let finaldata = '';
        for (let i = 0; i < mandata.length; i++) {
          finaldata = finaldata + mandata[i] + ",";
        }
        localStorage.setItem("user_" + data.username, finaldata);

      } else {
        let logdata = localStorage.getItem("user_" + data.username);
        if (logdata === null)
          logdata = '';
        logdata = logdata.split(',');
        logdata.pop();
        getFavorites(logdata);
      }

    } else {
      alert("Wrong credentials.");
    }
  }

  const handleRegister = () => {
    const data = {
      username: userRef.current.value,
      password: passRef.current.value
    };
    if (localStorage.getItem(data.username) === null) {
      localStorage.setItem(data.username, data.password);
      alert("Account created.")
    } else {
      alert("User already exists.")
    }
  }

  const getFavorites = async (v) => {

    const listing = document.querySelector("#favorites");
    while (listing.firstChild) {
      listing.removeChild(listing.lastChild);
    }

    for (var i = 0; i < v.length; i++) {

      const variables = { id: v[i] }

      const jsondata = await weebResponse(variables);
      if (jsondata.error) {
        continue
      }

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

    const listing = document.querySelector("#products");
    while (listing.firstChild) {
      listing.removeChild(listing.lastChild);
    }

    for (variables.id; variables.id < 75; variables.id++) {
      const jsondata = await weebResponse(variables);
      if (jsondata.error) {
        continue
      }

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

  //https://graphql.anilist.co
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

  const handleFavoriteAdd = async (divs) => {
    let shouldadd = divs.cloneNode(true);
    let btnnumb = divs.querySelector('.detail_btn')
    btnnumb = btnnumb.value;
    shouldadd.removeChild(shouldadd.lastChild);

    let btn = document.createElement("button");
    btn.className = "detail_btn";
    btn.innerHTML = "Remove from favorites";
    btn.value = btnnumb;
    btn.onclick = () => { handleFavoriteRemove(shouldadd); };
    shouldadd.appendChild(btn);

    if (document.querySelector('#favorites > .prodid' + btnnumb) === null) {
      document.querySelector('#favorites').appendChild(shouldadd);
      var loginfo = document.querySelector('.logininfo');
      if (loginfo !== null) {
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

  const handleFavoriteRemove = async (divs) => {
    let shouldadd = divs.cloneNode(true);
    divs.remove();

    var loginfo = document.querySelector('.logininfo');
    if (loginfo !== null) {
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

  const clearFav = async () => {
    var loginfo = document.querySelector('.logininfo');
    if (loginfo === null) {
      alert('Please login first');
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
