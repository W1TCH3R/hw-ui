import { expect, Page } from "@playwright/test";

export class EbayResultsPage {
	constructor(private readonly page: Page) {}

	async verifyResultsPage(searchTerm: string): Promise<void> {
		await expect(this.page).toHaveURL(/sch/i);
		await expect(this.page.locator("body")).toContainText(searchTerm);
	}

	async openBrandFilterDialog(): Promise<void> {
		const brandTitle = this.page.getByText("Brand", { exact: true });

		await expect(brandTitle).toBeVisible({ timeout: 30_000 });
		await brandTitle.scrollIntoViewIfNeeded();

		const brandSeeAllButton = this.page.getByRole("button", {
			name: /see all - Brand/i,
		});

		await expect(brandSeeAllButton).toBeVisible({ timeout: 30_000 });
		await brandSeeAllButton.click();
	}

	async selectBrandInFilterDialog(brand: string): Promise<void> {
		const dialog = this.page.getByRole("dialog");

		await expect(dialog).toBeVisible({ timeout: 30_000 });

		const brandCheckbox = dialog
			.getByRole("checkbox", { name: new RegExp(brand, "i") })
			.first();

		await expect(brandCheckbox).toBeVisible({ timeout: 30_000 });
		await brandCheckbox.check();
	}

	async setPriceRangeInFilterDialog(
		minPrice: string,
		maxPrice: string,
	): Promise<void> {
		const dialog = this.page.getByRole("dialog");

		await expect(dialog).toBeVisible({ timeout: 30_000 });

		const priceTab = dialog.getByRole("tab", { name: /Price/i });

		await expect(priceTab).toBeVisible({ timeout: 30_000 });
		await priceTab.click();

		const minPriceInput = dialog
			.locator(
				'input[aria-label*="Minimum"], input[placeholder*="Min"], input[aria-label*="min"]',
			)
			.first();

		const maxPriceInput = dialog
			.locator(
				'input[aria-label*="Maximum"], input[placeholder*="Max"], input[aria-label*="max"]',
			)
			.first();

		await expect(minPriceInput).toBeVisible({ timeout: 30_000 });
		await minPriceInput.fill(minPrice);

		await expect(maxPriceInput).toBeVisible({ timeout: 30_000 });
		await maxPriceInput.fill(maxPrice);
	}

	async applyFilterDialog(): Promise<void> {
		const dialog = this.page.getByRole("dialog");

		const applyButton = dialog.getByRole("button", { name: /Apply/i });

		await expect(applyButton).toBeVisible({ timeout: 30_000 });

		await Promise.all([
			this.page.waitForLoadState("domcontentloaded"),
			applyButton.click(),
		]);

		await expect(dialog).toBeHidden({ timeout: 30_000 });
	}

	async applyBrandAndPriceFilters(
		brand: string,
		minPrice: string,
		maxPrice: string,
	): Promise<void> {
		await this.openBrandFilterDialog();
		await this.selectBrandInFilterDialog(brand);
		await this.setPriceRangeInFilterDialog(minPrice, maxPrice);
		await this.applyFilterDialog();
	}

	async verifyAppliedFilters(
		brand: string,
		minPrice: string,
		maxPrice: string,
	): Promise<void> {
		await expect(this.page.locator("body")).toContainText(
			new RegExp(brand, "i"),
			{
				timeout: 30_000,
			},
		);

		await expect(this.page.locator("body")).toContainText(
			new RegExp(`${minPrice}|${maxPrice}`, "i"),
			{
				timeout: 30_000,
			},
		);
	}

	async openThirdItem(): Promise<Page> {
		const resultLinks = this.page
			.locator("ul.srp-results li.s-card a.s-card__link")
			.filter({
				has: this.page.locator("img"),
			});

		await expect(resultLinks.nth(2)).toBeVisible({ timeout: 30_000 });

		const thirdItemLink = resultLinks.nth(2);

		const newPagePromise = this.page
			.context()
			.waitForEvent("page", { timeout: 10_000 })
			.catch(() => null);

		await thirdItemLink.scrollIntoViewIfNeeded();
		await thirdItemLink.click();

		const newPage = await newPagePromise;

		if (newPage) {
			await newPage.waitForLoadState("domcontentloaded");
			return newPage;
		}

		await this.page.waitForLoadState("domcontentloaded");
		return this.page;
	}
}
