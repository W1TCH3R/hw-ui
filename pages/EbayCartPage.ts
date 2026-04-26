import { expect, Page } from "@playwright/test";

export class EbayCartPage {
	constructor(private readonly page: Page) {}

	async verifyItemInCart(): Promise<void> {
		await expect(this.page).toHaveURL(/cart/i);

		await expect(this.page.locator("body")).toContainText(
			/item|checkout|remove|cart/i,
			{ timeout: 30_000 },
		);
	}

	async goToCheckout(): Promise<void> {
		const checkoutButton = this.page
			.getByRole("button", { name: /go to checkout/i })
			.or(this.page.getByRole("link", { name: /go to checkout/i }))
			.first();

		await expect(checkoutButton).toBeVisible({ timeout: 30_000 });
		await checkoutButton.scrollIntoViewIfNeeded();
		await checkoutButton.click({ force: true });

		await expect(this.page.locator("body")).toContainText(
			/sign in for faster checkout|check out as guest|checkout|delivery|shipping/i,
			{ timeout: 30_000 },
		);
	}

	async removeItemFromCart(): Promise<void> {
		const removeButton = this.page
			.getByRole("button", { name: /remove/i })
			.or(this.page.getByRole("link", { name: /remove/i }))
			.first();

		await expect(removeButton).toBeVisible({ timeout: 30_000 });
		await removeButton.scrollIntoViewIfNeeded();
		await removeButton.click({ force: true });

		await this.page.waitForLoadState("domcontentloaded");
	}

	async verifyCartIsEmpty(): Promise<void> {
		await expect(this.page.locator("body")).toContainText(
			/empty|cart is empty|you don't have any items|shopping cart/i,
			{ timeout: 30_000 },
		);
	}
}
