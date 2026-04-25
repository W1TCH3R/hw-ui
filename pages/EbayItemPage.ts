import { expect, Page } from "@playwright/test";

export class EbayItemPage {
	constructor(private readonly page: Page) {}

	async verifyItemPageIsOpened(): Promise<void> {
		await expect(this.page).toHaveURL(/itm|ebay/i);

		const itemTitle = this.page.locator("h1.x-item-title__mainTitle").first();

		await expect(itemTitle).toBeVisible({ timeout: 30_000 });
	}

	async addToCart(): Promise<void> {
		const addToCartButton = this.page
			.getByRole("link", { name: /add to cart/i })
			.or(this.page.getByRole("button", { name: /add to cart/i }))
			.first();

		await expect(addToCartButton).toBeVisible({ timeout: 30_000 });
		await addToCartButton.scrollIntoViewIfNeeded();
		await addToCartButton.click();

		const addedToCartDialog = this.page.getByRole("dialog");

		await expect(addedToCartDialog).toBeVisible({ timeout: 30_000 });
		await expect(addedToCartDialog).toContainText(/added to cart/i);
	}

	async goToCart(): Promise<void> {
		const addedToCartDialog = this.page.getByRole("dialog");

		await expect(addedToCartDialog).toBeVisible({ timeout: 30_000 });

		const seeInCartButton = addedToCartDialog
			.getByRole("link", { name: /see in cart/i })
			.or(addedToCartDialog.getByRole("button", { name: /see in cart/i }))
			.first();

		await expect(seeInCartButton).toBeVisible({ timeout: 30_000 });
		await seeInCartButton.click();

		await this.page.waitForLoadState("domcontentloaded");
		await expect(this.page).toHaveURL(/cart/i);
	}
}
