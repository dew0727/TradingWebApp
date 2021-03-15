import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import { Login, TradingPage } from "./pages";


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
    <Router>
      <Switch>
        <PrivateRoute path="/trading" component={TradingPage} />
        <Route path="/" exact component={() => <Login />} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
