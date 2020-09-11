import * as b2bCheckout from '../../../helpers/b2b/b2b-checkout';
import * as checkout from '../../../helpers/checkout-flow';
import {
  cartWithB2bProduct,
  POWERTOOLS_BASESITE,
  POWERTOOLS_DEFAULT_DELIVERY_MODE,
  products,
} from '../../../sample-data/b2b-checkout';
import { user } from '../../../sample-data/checkout-flow';

context('B2B - Credit Card Checkout flow', () => {
  before(() => {
    cy.window().then((win) => win.sessionStorage.clear());
    Cypress.env('BASE_SITE', POWERTOOLS_BASESITE);
  });

  beforeEach(() => {
    cy.restoreLocalStorage();
  });

  afterEach(() => {
    cy.saveLocalStorage();
  });

  it('should login to b2b user', () => {
    b2bCheckout.loginB2bUser();
  });

  it('should add a product to cart', () => {
    b2bCheckout.addB2bProductToCartAndCheckout();
  });

  it('should select Credit Card payment type', () => {
    b2bCheckout.enterPONumber();
    b2bCheckout.selectCreditCardPayment();
  });

  it('should enter shipping address', () => {
    checkout.fillAddressFormWithCheapProduct(user, cartWithB2bProduct);
  });

  it('should select delivery mode', () => {
    checkout.verifyDeliveryMethod(POWERTOOLS_DEFAULT_DELIVERY_MODE);
  });

  it('should enter payment method', () => {
    checkout.fillPaymentFormWithCheapProduct(
      user,
      undefined,
      cartWithB2bProduct
    );
  });

  it('should review and place order', () => {
    checkout.placeOrderWithCheapProduct(user, cartWithB2bProduct);
  });

  it('should display summary page', () => {
    checkout.verifyOrderConfirmationPageWithCheapProduct(
      user,
      products[0],
      cartWithB2bProduct,
      false
    );
  });
});