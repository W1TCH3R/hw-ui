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

test.describe("eBay filter tests", () => {
	for (const data of testData) {
		test(`should apply ${data.brand} brand and price range ${data.minPrice}-${data.maxPrice}`, async ({
			page,
		}) => {
			const homePage = new EbayHomePage(page);
			const resultsPage = new EbayResultsPage(page);

			await test.step("Open eBay and search for product", async () => {
				await homePage.open();
				await homePage.searchFor(data.searchTerm);
				await resultsPage.verifyResultsPage(data.searchTerm);
			});

			await test.step("Apply brand and price filters", async () => {
				await resultsPage.applyBrandAndPriceFilters(
					data.brand,
					data.minPrice,
					data.maxPrice,
				);
			});

			await test.step("Verify filters are applied", async () => {
				await resultsPage.verifyAppliedFilters(
					data.brand,
					data.minPrice,
					data.maxPrice,
				);

				await expect(page.locator("body")).toContainText(
					new RegExp(data.brand, "i"),
					{ timeout: 30_000 },
				);
			});
		});
	}

	test("negative: should not apply unavailable brand filter", async ({
		page,
	}) => {
        test.skip(!!process.env.CI, 'Skipped in CI because eBay may show browser verification / anti-bot page.');
		const homePage = new EbayHomePage(page);
		const resultsPage = new EbayResultsPage(page);

		await test.step("Open eBay and search for Headphones", async () => {
			await homePage.open();
			await homePage.searchFor("Headphones");
			await resultsPage.verifyResultsPage("Headphones");
		});

		await test.step("Try to apply unavailable brand filter", async () => {
			await expect(
				resultsPage.applyBrandAndPriceFilters(
					"InvalidBrandXYZ123",
					"50",
					"200",
				),
			).rejects.toThrow();
		});
	});
});
