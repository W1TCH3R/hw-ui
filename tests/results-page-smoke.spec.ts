import { test, expect } from "@playwright/test";
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

test.describe("Search results page smoke test", () => {
	for (const data of testData) {
		test(`should apply filters and open third filtered item`, async ({
			page,
		}) => {
			const homePage = new EbayHomePage(page);
			const resultsPage = new EbayResultsPage(page);

			await homePage.open();
			await homePage.searchFor(data.searchTerm);

			await resultsPage.verifyResultsPage(data.searchTerm);

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

			const itemPage = await resultsPage.openThirdItem();

			await expect(itemPage.locator("body")).toContainText(
				new RegExp(data.brand, "i"),
				{ timeout: 30_000 },
			);
		});
	}
});
