import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import withIntl from '../lib/withIntl';
import { defineMessages, FormattedMessage } from 'react-intl';
import { get, uniqBy } from 'lodash';
import Avatar from './Avatar';
import Logo from './Logo';
import { Link, Router } from '../server/pages';
import Currency from './Currency';
import colors from '../constants/colors';
import { formatCurrency } from '../lib/utils';
import Markdown from 'react-markdown';

class TierCard extends React.Component {
  static propTypes = {
    tier: PropTypes.object.isRequired,
    collective: PropTypes.object.isRequired,
    className: PropTypes.string,
    referral: PropTypes.string,
    intl: PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);
    this.anchor =
      get(props.tier, 'slug') ||
      (get(props.tier, 'name') || '').toLowerCase().replace(/ /g, '-');

    this.messages = defineMessages({
      contribution: {
        id: 'contribution',
        defaultMessage: '{n, plural, one {contribution} other {contributions}}',
      },
      'collective.types.organization': {
        id: 'collective.types.organization',
        defaultMessage: '{n, plural, one {organization} other {organizations}}',
      },
      'collective.types.user': {
        id: 'collective.types.user',
        defaultMessage: '{n, plural, one {people} other {people}}',
      },
      'collective.types.collective': {
        id: 'collective.types.collective',
        defaultMessage: '{n, plural, one {collective} other {collectives}}',
      },
      'tier.error.hostMissing': {
        id: 'tier.error.hostMissing',
        defaultMessage:
          'Your collective needs a host before you can start accepting money.',
      },
      'tier.error.collectiveInactive': {
        id: 'tier.error.collectiveInactive',
        defaultMessage:
          'Your collective needs to be activated by your host before you can start accepting money.',
      },
    });
  }

  showLastOrders(fromCollectiveTypeArray, limit) {
    const { tier } = this.props;
    const fromCollectives = uniqBy(
      tier.orders
        .map(o => o.fromCollective)
        .filter(c => c && fromCollectiveTypeArray.indexOf(c.type) !== -1),
      c => c.id,
    );
    if (fromCollectives.length === 0) return;
    return (
      <div>
        <style jsx>
          {`
            .fromCollectives {
              display: flex;
              flex-wrap: wrap;
            }
          `}
        </style>
        <div
          className={`fromCollectives ${fromCollectiveTypeArray[0].toLowerCase()}`}
        >
          {fromCollectives.slice(0, limit).map(fromCollective => (
            <div
              className="image"
              key={`${tier.slug}-fromCollective-${fromCollective.id}`}
            >
              <Link route={`/${fromCollective.slug}`}>
                <a title={fromCollective.name}>
                  {fromCollectiveTypeArray.indexOf('USER') !== -1 && (
                    <Avatar src={fromCollective.image} radius={32} />
                  )}
                  {fromCollectiveTypeArray.indexOf('USER') === -1 && (
                    <Logo
                      src={fromCollective.image}
                      website={fromCollective.website}
                      height={32}
                    />
                  )}
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const { collective, tier, referral, intl } = this.props;
    const amount = tier.presets
      ? Math.min(tier.presets[0], tier.amount)
      : tier.amount;
    const disabled = amount > 0 && !collective.isActive;
    const totalOrders = tier.stats.totalOrders;
    let errorMsg;
    if (!collective.host) {
      errorMsg = 'hostMissing';
    } else if (!collective.isActive) {
      errorMsg = 'collectiveInactive';
    }
    const tooltip = disabled
      ? intl.formatMessage(this.messages[`tier.error.${errorMsg}`])
      : '';

    const linkRoute = {
      name: 'orderCollectiveTier',
      params: { collectiveSlug: collective.slug, TierId: tier.id },
      anchor: '#content',
    };
    if (referral) {
      linkRoute.params.referral = referral;
    }

    const onClick = e => {
      e.preventDefault();
      if (!disabled) {
        // For better UX, we redirect to #content after the route is loaded
        // without that, we would either scroll to the top or don't scroll at all
        Router.pushRoute(linkRoute.name, linkRoute.params).then(() => {
          window.location.hash = linkRoute.anchor;
        });
      }
    };

    return (
      <div
        className={classNames('TierCard', this.props.className, this.anchor)}
      >
        <style jsx global>
          {`
            .image img {
              border: 2px solid white;
            }
            .TierCard .fromCollectives {
              margin: 1rem 0;
            }
            .TierCard .Avatar {
              margin-left: -15px;
            }
            .TierCard .fromCollectives.user:first-child {
              margin-left: 15px;
            }
          `}
        </style>
        <style jsx>
          {`
            .TierCard {
              width: 280px;
              overflow: hidden;
              border-radius: 8px;
              background-color: #ffffff;
              box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.04);
              border: solid 1px rgba(37, 39, 41, 0.16);
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              position: relative;
            }
            .name {
              margin: 3rem 0rem 1rem 3rem;
              width: 160px;
              font-family: Rubik;
              font-size: 22px;
              font-weight: 300;
              line-height: 1.32;
              text-align: left;
              color: #373a3d;
              color: var(--charcoal-grey-two);
            }
            .amount {
              position: absolute;
              top: 3rem;
              right: 3rem;
              font-family: Rubik;
              font-size: 1.6rem;
              font-weight: 500;
              line-height: 1;
              text-align: right;
              color: #45484c;
              color: var(--charcoal-grey-three);
            }
            .interval {
              font-size: 1.2rem;
              color: ${colors.darkgray};
            }
            .limited {
              margin: 0rem 3rem;
              font-family: Rubik;
              font-size: 1.1rem;
              font-weight: 500;
              line-height: 2.09;
              letter-spacing: 1px;
              text-align: left;
              color: #e69900;
              color: var(--attention);
            }
            .description {
              margin: 0rem 3rem;
              overflow: hidden;
              text-overflow: ellipsis;
              font-size: 1.4rem;
              color: var(--gunmetal);
            }
            .divider {
              margin: 1rem 0;
              width: 280px;
              height: 1px;
              background-color: #e1e4e6;
              background-color: var(--silver-four);
            }
            .footer {
              display: flex;
              align-items: center;
              margin: 2rem 3rem;
            }
            .action {
              margin-top: 1rem;
              width: 280px;
              height: 56px;
              border-radius: 0 0 8px 8px;
              background-color: ${colors.blue};
              font-family: Rubik, sans-serif;
              font-size: 14px;
              font-weight: 500;
              text-align: center;
              color: #ffffff !important; /* needed for firefox :-/ */
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .action:hover {
              background-color: ${colors.blueHover};
            }
            .action:active {
              background-color: ${colors.blueActive};
            }
            .action.disabled {
              background-color: var(--silver-four);
              cursor: not-allowed;
            }
            .totalOrders {
              height: 14px;
              font-family: Rubik;
              font-size: 12px;
              text-align: left;
              color: #9ea2a6;
              color: var(--cool-grey);
            }
          `}
        </style>
        <div className="name">{tier.name}</div>
        {amount > 0 && (
          <div className="amount">
            <Currency
              value={amount}
              currency={tier.currency || collective.currency}
              precision={0}
            />
            {tier.presets && <span>+</span>}
            {tier.interval && (
              <div className="interval">
                <FormattedMessage
                  id="tier.interval"
                  defaultMessage="per {interval, select, month {month} year {year} other {}}"
                  values={{ interval: tier.interval }}
                />
              </div>
            )}
          </div>
        )}
        {tier.maxQuantity > 0 && (
          <div className="limited">
            <FormattedMessage
              id="tier.limited"
              values={{
                maxQuantity: tier.maxQuantity,
                availableQuantity: tier.stats.availableQuantity,
              }}
              defaultMessage="LIMITED: {availableQuantity} LEFT OUT OF {maxQuantity}"
            />
          </div>
        )}
        <div className="description">
          {tier.description && <Markdown source={tier.description} />}
          {!tier.description && (
            <p>
              <FormattedMessage
                id="tier.defaultDescription"
                defaultMessage="Become a {name} for {amount} per {interval} and help us sustain our activities!"
                values={{
                  name: tier.name,
                  amount: formatCurrency(
                    amount,
                    tier.currency || collective.currency,
                  ),
                  interval: tier.interval,
                }}
              />
            </p>
          )}
        </div>
        {tier.stats.totalOrders > 0 && (
          <div>
            <div className="divider" />
            <div className="footer">
              <div className="lastOrders">
                {totalOrders > 0 && (
                  <div className="totalOrders">
                    {totalOrders}{' '}
                    {intl.formatMessage(this.messages['contribution'], {
                      n: totalOrders,
                    })}
                  </div>
                )}
                {this.showLastOrders(['USER'], 10)}
                {this.showLastOrders(['ORGANIZATION', 'COLLECTIVE'], 10)}
              </div>
            </div>
          </div>
        )}
        <Link route={linkRoute.name} params={linkRoute.params}>
          <a
            className={`action ${disabled ? 'disabled' : ''}`}
            title={tooltip}
            onClick={onClick}
          >
            {tier.button ? (
              tier.button
            ) : (
              <FormattedMessage
                id="tier.contribute"
                defaultMessage="contribute"
              />
            )}
          </a>
        </Link>
      </div>
    );
  }
}

export default withIntl(TierCard);
