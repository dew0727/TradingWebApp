import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Login, TradingPage } from "./pages";
import { AppProvider } from "./context";
import SoundPlayer from './sound'

const PrivateRoute = ({ component: Component, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) =>
        localStorage.getItem("twpAuthToken") ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/", state: { from: props.location } }} />
        )
      }
    />
  );
};

const AppRouter = () => {
  return (
    <AppProvider>
      <SoundPlayer />
      <Router>
        <Switch>
          <PrivateRoute path="/trading" component={TradingPage} />
          <Route path="/" exact component={() => <Login />} />
        </Switch>
      </Router>
    </AppProvider>
  );
};

export default AppRouter;
