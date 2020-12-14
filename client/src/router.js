import React from "react";
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import { HomePage, SettingsPage, TradingPage } from "./pages";

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props => localStorage.getItem("authToken") ? (
      <Component {...props} />
    ) : (
      <Redirect to={{ pathname: '/', state: { from: props.location }}} />
    )}
  />
)

const AppRouter = ({ priceInfo }) => {
  return (
    <Router>
      <Switch>
        <Route path="/settings" component={SettingsPage} />
        <PrivateRoute path="/trading" component={TradingPage} />
        <Route path="/" exact component={() => <HomePage priceInfo={priceInfo} />} />
      </Switch>
    </Router>
  );
};

export default AppRouter;
