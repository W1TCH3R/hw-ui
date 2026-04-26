import { expect, test } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { EbayHomePage } from "../pages/EbayHomePage";
import { EbayResultsPage } from "../pages/EbayResultsPage";
import { EbayItemPage } from "../pages/EbayItemPage";

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

test.describe("eBay item page tests", () => {
	for (const data of testData) {
		test("should open the third filtered item", async ({ page }) => {
			const homePage = new EbayHomePage(page);
			const resultsPage = new EbayResultsPage(page);

			let itemPageTab = page;

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

				await resultsPage.verifyAppliedFilters(
					data.brand,
					data.minPrice,
					data.maxPrice,
				);
			});

			await test.step("Open third filtered item", async () => {
				itemPageTab = await resultsPage.openThirdItem();
			});

			await test.step("Verify item page is opened", async () => {
				const itemPage = new EbayItemPage(itemPageTab);

				await itemPage.verifyItemPageIsOpened();

				await expect(itemPageTab.locator("body")).toContainText(
					new RegExp(data.brand, "i"),
					{ timeout: 30_000 },
				);
			});
		});
	}
});
