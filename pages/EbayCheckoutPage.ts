import { expect, Locator, Page } from "@playwright/test";

export type CheckoutAddress = {
	email: string;
	firstName: string;
	lastName: string;
	addressLine1: string;
	city: string;
	postalCode: string;
	phone: string;
	country?: string;
};

export class EbayCheckoutPage {
	constructor(private readonly page: Page) {}

	async continueAsGuestIfVisible(): Promise<void> {
		const signInFrame = this.page.frameLocator(
			'iframe[src*="signin.ebay.com"]',
		);

		const guestCheckoutButton = signInFrame
			.locator(
				'button.hbi-auth__guest-section-link, #modal-gxo-link, button:has-text("Check out as guest instead")',
			)
			.first();

		await guestCheckoutButton.click({ force: true });

		await this.page.waitForLoadState("domcontentloaded");
	}

	async verifyCheckoutPageOpened(): Promise<void> {
		await expect(this.page.locator("body")).toContainText(
			/checkout|delivery|shipping|address|contact|email|payment/i,
			{ timeout: 30_000 },
		);
	}

	async selectCountryIfVisible(country: string): Promise<void> {
		const countryDropdown = this.page
			.getByLabel(/country|region/i)
			.or(this.page.locator('select[name*="country" i]'))
			.first();

		if (
			await countryDropdown.isVisible({ timeout: 3_000 }).catch(() => false)
		) {
			await countryDropdown.selectOption({ label: country });
		}
	}

	async fillDeliveryAddress(address: CheckoutAddress): Promise<void> {
		if (address.country) {
			await this.selectCountryIfVisible(address.country);
		}

		await this.fillOptionalField("email", /email/i, address.email);

		await this.fillRequiredField(
			"first name",
			/first name/i,
			address.firstName,
		);
		await this.fillRequiredField(
			"last name",
			/last name|surname/i,
			address.lastName,
		);
		await this.fillRequiredField(
			"address line 1",
			/address line 1|address|street/i,
			address.addressLine1,
		);
		await this.fillRequiredField("city", /city|town/i, address.city);
		await this.fillRequiredField(
			"postal code",
			/postcode|postal code|zip/i,
			address.postalCode,
		);
		await this.fillRequiredField(
			"phone",
			/phone|mobile|telephone/i,
			address.phone,
		);
	}

	async saveDeliveryAddress(): Promise<void> {
		const doneButton = this.page
			.getByRole("button", { name: /^done$/i })
			.or(this.page.getByRole("button", { name: /save|continue|confirm/i }))
			.first();

		await expect(doneButton).toBeVisible({ timeout: 30_000 });
		await doneButton.scrollIntoViewIfNeeded();

		await doneButton.click();

		await this.page.waitForLoadState("domcontentloaded");
	}

	async selectPayPalPayment(): Promise<void> {
		const paypalOption = this.page
			.getByRole("radio", { name: /paypal/i })
			.or(this.page.getByRole("button", { name: /paypal/i }))
			.or(this.page.locator('label:has-text("PayPal")'))
			.or(this.page.getByText(/paypal/i))
			.first();

		await expect(paypalOption).toBeVisible({ timeout: 30_000 });
		await paypalOption.scrollIntoViewIfNeeded();

		await paypalOption.click({ force: true });

		await expect(this.page.locator("body")).toContainText(/paypal/i, {
			timeout: 30_000,
		});
	}

	async verifyPayPalSelected(): Promise<void> {
		await expect(this.page.locator("body")).toContainText(/paypal/i, {
			timeout: 30_000,
		});
	}

    async returnToCart(): Promise<void> {
        await this.page.goBack();
        await this.page.waitForLoadState('domcontentloaded');

        if (!/cart/i.test(this.page.url())) {
            await this.page.goto('/cart');
            await this.page.waitForLoadState('domcontentloaded');
    }

  await expect(this.page).toHaveURL(/cart/i);
}

	private async fillOptionalField(
		fieldName: string,
		label: RegExp,
		value: string,
	): Promise<void> {
		const input = await this.findVisibleInput(label);

		if (!input) {
			console.log(`Optional field not visible, skipping: ${fieldName}`);
			return;
		}

		console.log(`Filling optional field: ${fieldName}`);
		await input.fill(value);
	}

	private async fillRequiredField(
		fieldName: string,
		label: RegExp,
		value: string,
	): Promise<void> {
		const input = await this.findVisibleInput(label);

		if (!input) {
			throw new Error(
				`Could not find visible input for required field: ${fieldName}`,
			);
		}

		console.log(`Filling required field: ${fieldName}`);
		await input.fill(value);
	}

	private async findVisibleInput(label: RegExp): Promise<Locator | null> {
		const inputByLabel = this.page.getByLabel(label).first();

		if (await inputByLabel.isVisible({ timeout: 3_000 }).catch(() => false)) {
			return inputByLabel;
		}

		const inputByPlaceholder = this.page.getByPlaceholder(label).first();

		if (
			await inputByPlaceholder.isVisible({ timeout: 3_000 }).catch(() => false)
		) {
			return inputByPlaceholder;
		}

		return null;
	}
}
