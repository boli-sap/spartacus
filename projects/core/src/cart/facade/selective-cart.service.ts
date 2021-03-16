import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { UserIdService } from '../../auth/user-auth/facade/user-id.service';
import { Cart } from '../../model/cart.model';
import { OrderEntry } from '../../model/order.model';
import { OCC_USER_ID_ANONYMOUS } from '../../occ/utils/occ-constants';
import { BaseSiteService } from '../../site-context/facade/base-site.service';
import { LoaderState } from '../../state/utils/loader/loader-state';
import { UserService } from '../../user/facade/user.service';
import { CartConfigService } from '../services/cart-config.service';
import { StateWithMultiCart } from '../store/multi-cart-state';
import { MultiCartService } from './multi-cart.service';

@Injectable({
  providedIn: 'root',
})
export class SelectiveCartService {
  private customerId: string;
  private userId: string;
  private cartId: string;
  private selectiveCart$: Observable<Cart>;
  private cartId$: BehaviorSubject<string> = new BehaviorSubject<string>(
    undefined
  );

  private readonly PREVIOUS_USER_ID_INITIAL_VALUE =
    'PREVIOUS_USER_ID_INITIAL_VALUE';
  private previousUserId = this.PREVIOUS_USER_ID_INITIAL_VALUE;

  private cartSelector$ = this.cartId$.pipe(
    switchMap((cartId) => {
      this.cartId = cartId;
      return this.multiCartService.getCartEntity(cartId);
    })
  );

  constructor(
    protected store: Store<StateWithMultiCart>,
    protected userService: UserService,
    protected multiCartService: MultiCartService,
    protected baseSiteService: BaseSiteService,
    protected cartConfigService: CartConfigService,
    protected userIdService: UserIdService
  ) {
    combineLatest([
      this.userService.get(),
      this.baseSiteService.getActive(),
    ]).subscribe(([user, activeBaseSite]) => {
      if (user && user.customerId && activeBaseSite) {
        this.customerId = user.customerId;
        this.cartId$.next(`selectivecart${activeBaseSite}${this.customerId}`);
      } else if (user && !user.customerId) {
        this.cartId$.next(undefined);
      }
    });

    this.userIdService.getUserId().subscribe((userId) => {
      this.userId = userId;

      if (this.isJustLoggedIn(userId)) {
        this.load();
      }

      this.previousUserId = userId;
    });

    this.selectiveCart$ = this.cartSelector$.pipe(
      map((cartEntity: LoaderState<Cart>): {
        cart: Cart;
        loading: boolean;
        loaded: boolean;
      } => {
        return {
          cart: cartEntity.value,
          loading: cartEntity.loading,
          loaded:
            (cartEntity.error || cartEntity.success) && !cartEntity.loading,
        };
      }),
      filter(({ loading }) => !loading),
      tap(({ cart, loaded }) => {
        if (this.cartId && this.isEmpty(cart) && !loaded) {
          this.load();
        }
      }),
      map(({ cart }) => (cart ? cart : {})),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  }

  getCart(): Observable<Cart> {
    return this.selectiveCart$;
  }

  getEntries(): Observable<OrderEntry[]> {
    return this.multiCartService.getEntries(this.cartId);
  }

  getLoaded(): Observable<boolean> {
    return this.cartSelector$.pipe(
      map((cart) => (cart.success || cart.error) && !cart.loading)
    );
  }

  /**
   * Returns true when selective cart is stable (not loading and not pending processes on cart)
   */
  isStable(): Observable<boolean> {
    return this.cartId$.pipe(
      switchMap((cartId) => this.multiCartService.isStable(cartId))
    );
  }

  private load() {
    if (this.isLoggedIn(this.userId) && this.cartId) {
      this.multiCartService.loadCart({
        userId: this.userId,
        cartId: this.cartId,
      });
    }
  }

  addEntry(productCode: string, quantity: number): void {
    let loadAttempted = false;
    this.cartSelector$
      .pipe(
        filter(() => !loadAttempted),
        switchMap((cartState) => {
          if (this.isEmpty(cartState.value) && !cartState.loading) {
            loadAttempted = true;
            this.load();
          }
          return of(cartState);
        }),
        filter((cartState) => !this.isEmpty(cartState.value)),
        take(1)
      )
      .subscribe(() => {
        this.multiCartService.addEntry(
          this.userId,
          this.cartId,
          productCode,
          quantity
        );
      });
  }

  removeEntry(entry: OrderEntry, cartCode?: string): void {
    this.multiCartService.removeEntry(
      this.userId,
      cartCode ?? this.cartId,
      entry.entryNumber
    );
  }

  updateEntry(entryNumber: number, quantity: number, cartCode?: string): void {
    this.multiCartService.updateEntry(
      this.userId,
      cartCode ?? this.cartId,
      entryNumber,
      quantity
    );
  }

  getEntry(productCode: string): Observable<OrderEntry> {
    return this.multiCartService.getEntry(this.cartId, productCode);
  }

  /**
   * Indicates if selectiveCart feature is enabled based on cart configuration.
   */
  isEnabled(): boolean {
    return this.cartConfigService.isSelectiveCartEnabled();
  }

  private isEmpty(cart: Cart): boolean {
    return (
      !cart || (typeof cart === 'object' && Object.keys(cart).length === 0)
    );
  }

  private isJustLoggedIn(userId: string): boolean {
    return (
      this.isLoggedIn(userId) &&
      this.previousUserId !== userId && // *just* logged in
      this.previousUserId !== this.PREVIOUS_USER_ID_INITIAL_VALUE // not app initialization
    );
  }

  private isLoggedIn(userId: string): boolean {
    return typeof userId !== 'undefined' && userId !== OCC_USER_ID_ANONYMOUS;
  }
}
