import { expect, test } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { EbayHomePage } from "../pages/EbayHomePage";
import { EbayResultsPage } from "../pages/EbayResultsPage";

type SearchData = {
	searchTerm: string;
	brand: string;
	minPrice: string;
	maxPrice: string;
};

const testData = parse(fs.readFileSync("data/search-data.csv"), {
	columns: true,
	skip_empty_lines: true,
}) as SearchData[];

test.describe("eBay search tests", () => {
	for (const data of testData) {
		test(`should search for ${data.searchTerm}`, async ({ page }) => {
			const homePage = new EbayHomePage(page);
			const resultsPage = new EbayResultsPage(page);

			await test.step("Open eBay home page", async () => {
				await homePage.open();
			});

			await test.step(`Search for ${data.searchTerm}`, async () => {
				await homePage.searchFor(data.searchTerm);
			});

			await test.step("Verify search results page is opened", async () => {
				await resultsPage.verifyResultsPage(data.searchTerm);
				await expect(page.locator("body")).toContainText(data.searchTerm, {
					timeout: 30_000,
				});
			});
		});
	}

	test("negative: should show limited or no results for invalid search term", async ({
		page,
	}) => {
		const homePage = new EbayHomePage(page);

		await test.step("Open eBay home page", async () => {
			await homePage.open();
		});

		await test.step("Search for invalid product name", async () => {
			await homePage.searchFor("zzzzzz-invalid-product-123456789");
		});

		await test.step("Verify invalid search result behavior", async () => {
			await expect(page.locator("body")).toContainText(
				/no exact matches|0 results|try checking|results matching fewer words|we looked everywhere/i,
				{ timeout: 30_000 },
			);
		});
	});

	test("negative: should handle empty search input", async ({ page }) => {
		const homePage = new EbayHomePage(page);

		await test.step("Open eBay home page", async () => {
			await homePage.open();
		});

		await test.step("Click search with empty input", async () => {
			await page.getByRole("button", { name: /search/i }).click();
		});

		await test.step("Verify user stays on eBay page", async () => {
			await expect(page).toHaveURL(/ebay/i);
			await expect(page.locator("body")).toContainText(/search|shop|ebay/i, {
				timeout: 30_000,
			});
		});
	});
});
