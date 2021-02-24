import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  AnonymousConsent,
  AnonymousConsentsConfig,
  AnonymousConsentsService,
  AuthConfigService,
  ConsentTemplate,
  GlobalMessageEntities,
  GlobalMessageService,
  GlobalMessageType,
  OAuthFlow,
  RoutingService,
  Title,
} from '@spartacus/core';
import { CustomFormValidators, sortTitles } from '@spartacus/storefront';
import { UserRegisterFacade, UserSignUp } from '@spartacus/user/profile/root';
import { BehaviorSubject, combineLatest, Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Component({
  selector: 'cx-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent implements OnInit, OnDestroy {
  titles$: Observable<Title[]>;

  isLoading$ = new BehaviorSubject(false);

  private subscription = new Subscription();

  anonymousConsent$: Observable<{
    consent: AnonymousConsent;
    template: string;
  }>;

  registerForm: FormGroup = this.fb.group(
    {
      titleCode: [''],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, CustomFormValidators.emailValidator]],
      password: [
        '',
        [Validators.required, CustomFormValidators.passwordValidator],
      ],
      passwordconf: ['', Validators.required],
      newsletter: new FormControl({
        value: false,
        disabled: this.isConsentRequired(),
      }),
      termsandconditions: [false, Validators.requiredTrue],
    },
    {
      validators: CustomFormValidators.passwordsMustMatch(
        'password',
        'passwordconf'
      ),
    }
  );

  constructor(
    protected userRegister: UserRegisterFacade,
    protected globalMessageService: GlobalMessageService,
    protected fb: FormBuilder,
    protected router: RoutingService,
    protected anonymousConsentsService: AnonymousConsentsService,
    protected anonymousConsentsConfig: AnonymousConsentsConfig,
    protected authConfigService: AuthConfigService
  ) {}

  ngOnInit() {
    this.titles$ = this.userRegister.getTitles().pipe(
      map((titles) => {
        return titles.sort(sortTitles);
      })
    );

    // TODO: Workaround: allow server for decide is titleCode mandatory (if yes, provide personalized message)
    this.subscription.add(
      this.globalMessageService
        .get()
        .pipe(filter((messages) => !!Object.keys(messages).length))
        .subscribe((globalMessageEntities: GlobalMessageEntities) => {
          const messages =
            globalMessageEntities &&
            globalMessageEntities[GlobalMessageType.MSG_TYPE_ERROR];

          if (
            messages &&
            messages.some((message) => message === 'This field is required.')
          ) {
            this.globalMessageService.remove(GlobalMessageType.MSG_TYPE_ERROR);
            this.globalMessageService.add(
              { key: 'register.titleRequired' },
              GlobalMessageType.MSG_TYPE_ERROR
            );
          }
        })
    );

    const { registerConsent } = this.anonymousConsentsConfig?.anonymousConsents;

    this.anonymousConsent$ = combineLatest([
      this.anonymousConsentsService.getConsent(registerConsent),
      this.anonymousConsentsService.getTemplate(registerConsent),
    ]).pipe(
      map(([consent, template]: [AnonymousConsent, ConsentTemplate]) => {
        return {
          consent,
          template: template ? template.description : '',
        };
      })
    );

    this.subscription.add(
      this.registerForm.get('newsletter').valueChanges.subscribe(() => {
        this.toggleAnonymousConsent();
      })
    );
  }

  submitForm(): void {
    if (this.registerForm.valid) {
      this.registerUser();
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  registerUser(): void {
    this.subscription.add(
      this.userRegister
        .register(this.collectDataFromRegisterForm(this.registerForm.value))
        .pipe(
          tap((state) => {
            this.isLoading$.next(state.loading);
            this.onRegisterUserSuccess(state.success);
          })
        )
        .subscribe()
    );
  }

  titleSelected(title: Title): void {
    this.registerForm['controls'].titleCode.setValue(title.code);
  }

  collectDataFromRegisterForm(formData: any): UserSignUp {
    const { firstName, lastName, email, password, titleCode } = formData;

    return {
      firstName,
      lastName,
      uid: email.toLowerCase(),
      password,
      titleCode,
    };
  }

  isConsentGiven(consent: AnonymousConsent): boolean {
    return this.anonymousConsentsService.isConsentGiven(consent);
  }

  private isConsentRequired(): boolean {
    const {
      requiredConsents,
      registerConsent,
    } = this.anonymousConsentsConfig?.anonymousConsents;

    if (requiredConsents && registerConsent) {
      return requiredConsents.includes(registerConsent);
    }

    return false;
  }

  private onRegisterUserSuccess(success: boolean): void {
    if (success) {
      if (
        this.authConfigService.getOAuthFlow() ===
        OAuthFlow.ResourceOwnerPasswordFlow
      ) {
        this.router.go('login');
      }
      this.globalMessageService.add(
        { key: 'register.postRegisterMessage' },
        GlobalMessageType.MSG_TYPE_CONFIRMATION
      );
    }
  }

  toggleAnonymousConsent(): void {
    const { registerConsent } = this.anonymousConsentsConfig.anonymousConsents;

    if (Boolean(this.registerForm.get('newsletter').value)) {
      this.anonymousConsentsService.giveConsent(registerConsent);
    } else {
      this.anonymousConsentsService.withdrawConsent(registerConsent);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}