import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CartModification,
  CART_MODIFICATION_NORMALIZER,
  ConverterService,
  OccEndpointsService,
  SearchConfig,
} from '@spartacus/core';
import {
  BundleAdapter,
  BundleStarter,
} from 'projects/core/src/cart/bundle/core/public_api';

@Injectable()
export class OccBundleAdapter implements BundleAdapter {
  constructor(
    protected http: HttpClient,
    protected occEndpointsService: OccEndpointsService,
    protected converterService: ConverterService
  ) {}

  /**
   * Starts a bundle once the productCode, its quantity, and a bundle templateId is provided. A successful result returns a CartModification response.
   *
   * @param userId
   * User identifier or one of the literals : ‘current’ for currently authenticated user, ‘anonymous’ for anonymous user.
   *
   * @param cartId
   * Cart code for logged in user, cart guid for anonymous user, ‘current’ for the last modified cart.
   *
   * @param bundleStarter
   * Mandatory data required to start a bundle. This includes the templateId of the bundle, the productCode, and the quantity of the product itself.
   */
  public bundleStart(
    userId: string,
    cartId: string,
    bundleStarter: BundleStarter
  ): Observable<CartModification> {
    const toAdd = JSON.stringify({
      bundleStarter: bundleStarter,
    });

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const url = this.occEndpointsService.getUrl('startBundle', {
      userId,
      cartId,
    });

    return this.http
      .post<CartModification>(url, toAdd, { headers })
      .pipe(this.converterService.pipeable(CART_MODIFICATION_NORMALIZER));
  }

  /**
   * Returns products and additional data based on the entry group and search query provided.
   *
   * @param userId
   * User identifier or one of the literals : ‘current’ for currently authenticated user, ‘anonymous’ for anonymous user.
   *
   * @param cartId
   * Cart code for logged in user, cart guid for anonymous user, ‘current’ for the last modified cart
   *
   * @param entryGroupNumber
   * Each entry group in a cart has a specific entry group number. Entry group numbers are integers starting at one. They are defined in ascending order.
   *
   * @param searchConfig
   * Options for search.
   */
  public bundleAllowedProductsSearch(
    userId: string,
    cartId: string,
    entryGroupId: number,
    searchConfig?: SearchConfig
  ): Observable<CartModification> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const url = this.occEndpointsService.getUrl('bundleAllowedProductsSearch', {
      userId,
      cartId,
      entryGroupId,
    });

    return this.http
      .get<CartModification>(url, {
        headers,
        params: <HttpParams>searchConfig,
      })
      .pipe(this.converterService.pipeable(CART_MODIFICATION_NORMALIZER));
  }
}