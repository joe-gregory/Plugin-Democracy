//CSS
import CssBaseline from "@mui/material/CssBaseline";

//React
import { useState, useEffect } from "react";

//Routes
import { Routes, Route, Navigate } from "react-router-dom";

//Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import AuthChecker from "./components/AuthChecker";

//Pages
import Home from "./pages/Home";
import Community from "./pages/Community";
import LogIn from "./pages/LogIn";
import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import Account from "./pages/Account";
import AboutCommunity from "./pages/AboutCommunity";
import Contact from "./pages/Contact";
import RegisterCommunity from "./pages/RegisterCommunity";
import JoinCommunity from "./pages/JoinCommunity";
import Admin from "./pages/Admin";
import CreateProposal from "./pages/CreateProposal";
import NotFound404 from "./pages/NotFound404";

import TestMessages from "./pages/TestMessages";

//context
import { AuthContext } from "./contexts/auth-context";
import { MessagesContext } from "./contexts/messages-context";
import { RequestContext } from "./contexts/requests-context";
import { EmailConfirmContext } from "./contexts/confirmed-email-context";
import { CitizenContext } from "./contexts/citizen-context";
import { CommunitiesContext } from "./contexts/communities-context";
import { UpdateContext } from "./contexts/update-context";
import { PPContext } from "./contexts/pp-context";

import { v4 as uuid } from "uuid";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [emailConfirm, setEmailConfirm] = useState(false);
  const [alertMessages, setAlertMessages] = useState([]);
  const [citizen, setCitizen] = useState(undefined);
  const [communities, setCommunities] = useState([]);
  const [update, setUpdate] = useState(true);
  const [pp, setPpupdate] = useState(true);

  useEffect(() => {
    async function getSession() {
      const output = await request("get", "/initial-session");
      output.authenticated ? setAuthenticated(true) : setAuthenticated(false);
      console.log("app initial authenticated: ", output.authenticated);
    }
    getSession();
  }, []);

  //AuthContext
  const login = () => {
    setAuthenticated(true);
  };

  const logout = () => {
    setCitizen(undefined);
    setAuthenticated(false);
  };

  //AlertMessages
  const setMessages = (messages) => {
    setAlertMessages(messages);
  };

  //ConfirmEmailContext
  const confirmEmail = () => {
    setEmailConfirm(true);
  };

  const unconfirmEmail = () => {
    setEmailConfirm(false);
  };

  const returnUUIDMessage = ({ severity = "success", message = "" }) => {
    let key = uuid();
    message = {
      severity: severity,
      message: message,
      key: key,
    };
    return message;
  };

  const createAndAddMessage = (messages) => {
    if (Array.isArray(messages)) {
      for (let i = 0; i < messages.length; i++) {
        if (!messages[i].severity) messages[i].severity = "success";
        if (!messages[i].key) messages[i].key = uuid();
        if (!messages[i].message) messages[i].message = "";
      }
      setAlertMessages([...alertMessages, ...messages]);
    } else {
      let message = {
        severity: messages.severity ? messages.severity : "success",
        message: messages.message ? messages.message : "",
        key: messages.key ? messages.key : uuid(),
      };
      setAlertMessages([...alertMessages, message]);
    }
  };

  const createAndSetMessage = (messages) => {
    if (Array.isArray(messages)) {
      for (let i = 0; i < messages.length; i++) {
        if (!messages[i].severity) messages[i].severity = "success";
        if (!messages[i].key) messages[i].key = uuid();
        if (!messages[i].message) messages[i].message = "";
      }
      setAlertMessages([...messages]);
    } else {
      let message = {
        severity: messages.severity ? messages.severity : "success",
        message: messages.message ? messages.message : "",
        key: messages.key ? messages.key : uuid(),
      };
      setAlertMessages([message]);
    }
  };
  const clearMessages = () => {
    setAlertMessages([]);
  };

  //RequestContext
  async function request(
    method = "get",
    subdirectory = "/",
    headers = {
      "Content-Type": "application/json",
    },
    body
  ) {
    //fetches and returns json response

    method = method.toLowerCase();
    //subdirectory = subdirectory.toLowerCase();
    if (subdirectory[0] !== "/") subdirectory = "/" + subdirectory;
    let methods = ["get", "post"];
    if (!methods.includes(method)) throw new Error("Unknown http method");
    const domain = "https://localhost:8080";
    const url = domain + subdirectory;

    let output = {};
    output.messages = [];

    try {
      const response = await fetch(url, {
        method: method,
        headers: headers,
        body: body,
        mode: "cors",
        credentials: "include",
      });
      output = response;
    } catch (error) {
      output.success = false;
      output.messages.push({
        severity: "error",
        message: "Error in fetch at app.jsx: " + error.message,
      });
      console.log(error);
    }
    try {
      output = await output.json();
      console.log("App.jsx output of request: ", output);
    } catch (error) {
      console.log("error converting to Json. ", error);
    }

    //Desmenuzando output. Rerouting output
    //isAuthenticated?
    if (output.authenticated === true) login();
    else if (output.authenticated === false) logout();
    //is emailConfirm?
    if (output.emailConfirm === true) confirmEmail();
    else if (output.emailConfirm === false) unconfirmEmail();
    //RR NavBar alert messages
    if (output.messages) createAndAddMessage(output.messages);
    //Citizen info
    if (output.citizen) setCitizen(output.citizen);
    //Communities info
    if (output.communities) setCommunities(output.communities);

    //The entire request output object
    return output;
  }

  const updateUpdate = () => {
    setUpdate(!update);
  };

  const ppUpdate = () => {
    setPpupdate(!pp);
  };

  return (
    <CssBaseline>
      <RequestContext.Provider value={{ request: request }}>
        <UpdateContext.Provider
          value={{ update: update, updateUpdate: updateUpdate }}
        >
          <AuthContext.Provider
            value={{
              authenticated: authenticated,
              login: login,
              logout: logout,
            }}
          >
            <PPContext.Provider value={{ pp: pp, ppUpdate: ppUpdate }}>
              <CitizenContext.Provider value={{ citizen: citizen }}>
                <CommunitiesContext.Provider
                  value={{ communities: communities }}
                >
                  <EmailConfirmContext.Provider
                    value={{
                      emailConfirm: emailConfirm,
                      confirmEmail: confirmEmail,
                      unconfirmEmail: unconfirmEmail,
                    }}
                  >
                    <AuthChecker />
                    <MessagesContext.Provider
                      value={{
                        messages: alertMessages,
                        setMessages: setMessages,
                        createAndAddMessage: createAndAddMessage,
                        createAndSetMessage: createAndSetMessage,
                        returnUUIDMessage: returnUUIDMessage,
                        clearMessages: clearMessages,
                      }}
                    >
                      <NavBar />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                          path="/community"
                          element={
                            authenticated &&
                            emailConfirm &&
                            communities.length > 0 ? (
                              <Community />
                            ) : authenticated && !emailConfirm ? (
                              <Navigate to="/account" />
                            ) : authenticated &&
                              emailConfirm &&
                              communities.length === 0 ? (
                              <Navigate to="/community/join" />
                            ) : (
                              <Navigate to="/login" />
                            )
                          }
                        />
                        <Route
                          path="/login"
                          element={
                            authenticated && emailConfirm ? (
                              <Navigate to="/community" />
                            ) : authenticated && !emailConfirm ? (
                              <Navigate to="/account" />
                            ) : (
                              <LogIn />
                            )
                          }
                        />
                        <Route
                          path="/signup"
                          element={
                            authenticated && emailConfirm ? (
                              <Navigate to="/community" />
                            ) : authenticated && !emailConfirm ? (
                              <Navigate to="/account" />
                            ) : (
                              <SignUp />
                            )
                          }
                        />
                        <Route
                          path="/account"
                          element={
                            authenticated ? (
                              <Account />
                            ) : (
                              <Navigate to="/login" />
                            )
                          }
                        />
                        <Route
                          path="/community/about"
                          element={
                            authenticated ? (
                              <AboutCommunity />
                            ) : (
                              <Navigate to="/login" />
                            )
                          }
                        />
                        <Route
                          path="/test-messages"
                          element={<TestMessages />}
                        />
                        <Route path="/contact" element={<Contact />} />
                        <Route
                          path="/community/register"
                          element={<RegisterCommunity />}
                        />
                        <Route
                          path="/community/join"
                          element={<JoinCommunity />}
                        />
                        <Route
                          path="/admin"
                          element={
                            authenticated ? <Admin /> : <Navigate to="/login" />
                          }
                        />
                        <Route
                          path="/createproposal"
                          element={
                            authenticated && communities.length > 0 ? (
                              <CreateProposal />
                            ) : authenticated ? (
                              <Navigate to="/community/join" />
                            ) : (
                              <Navigate to="/login" />
                            )
                          }
                        />
                        <Route path="/verifyemail" element={<VerifyEmail />} />
                        <Route path="*" element={<NotFound404 />} />
                      </Routes>
                      <Footer />
                    </MessagesContext.Provider>
                  </EmailConfirmContext.Provider>
                </CommunitiesContext.Provider>
              </CitizenContext.Provider>
            </PPContext.Provider>
          </AuthContext.Provider>
        </UpdateContext.Provider>
      </RequestContext.Provider>
    </CssBaseline>
  );
}

export default App;
