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
}
