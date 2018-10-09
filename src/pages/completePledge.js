import React, { Fragment } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import withData from '../lib/withData';
import withLoggedInUser from '../lib/withLoggedInUser';

import Header from '../components/Header';
import Body from '../components/Body';
import Footer from '../components/Footer';
import ErrorPage from '../components/ErrorPage';
import OrderForm from '../components/OrderForm';
import SignInForm from '../components/SignInForm';
import { H1 } from '../components/Text';

class CompletePledgePage extends React.Component {
  static getInitialProps({ query = {} }) {
    return {
      id: query.id
    };
  }

  state = {
    errorMessage: null,
    loadingUserLogin: true,
    LoggedInUser: null,
  };

  async componentDidMount() {
    const { getLoggedInUser } = this.props;
    const LoggedInUser = getLoggedInUser && (await getLoggedInUser());
    this.setState({
      LoggedInUser,
      loadingUserLogin: false,
    });
  }

  render() {
    const {
      data,
    } = this.props;
    const {
      errorMessage,
      LoggedInUser,
      loadingUserLogin
    } = this.state;

    const {
      loading,
      Order,
    } = data;

    if (loading || errorMessage) {
      return (
        <ErrorPage
          loading={loading}
          data={data}
          message={errorMessage}
        />
      );
    }

    Order.tier = {
      name: 'Pledge',
      presets: !Order.totalAmount && [1000, 5000, 10000], // we only offer to customize the contribution if it hasn't been specified in the URL
      type: 'DONATION',
      currency: Order.collective.currency,
      interval: Order.interval,
      button: 'donate',
      description: 'Thank you for your kind donation',
    };

    return (
      <Fragment>
        <Header
          className={loadingUserLogin ? 'loading' : ''}
          LoggedInUser={LoggedInUser}
          title="Complete Pledge"
        />
        <Body>
          <H1>Complete Your Pledge</H1>
          {!loading && !LoggedInUser && (
            <SignInForm />
          )}
          {LoggedInUser && <OrderForm
            collective={Order.collective}
            LoggedInUser={LoggedInUser}
            onSubmit={console.log}
            order={Order}
          />}
        </Body>
        <Footer />
      </Fragment>
    );
  }
}

const addOrderData = graphql(gql`
  query getOrder($id: Int!) {
    Order(id: $id) {
      id
      interval
      publicMessage
      quantity
      totalAmount
      collective {
        currency
        host {
          id
          name
        }
        name
        paymentMethods {
          id
          name
          service
        }
        website
      }
      fromCollective {
        id
        name
        type
      }
    }
  }
`);

export { CompletePledgePage as MockCompletePledgePage };
export default withData(withLoggedInUser(addOrderData(CompletePledgePage)));
