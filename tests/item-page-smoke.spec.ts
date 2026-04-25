import { test } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { EbayHomePage } from "../pages/EbayHomePage";
import { EbayResultsPage } from "../pages/EbayResultsPage";
import { EbayItemPage } from "../pages/EbayItemPage";
import { EbayCartPage } from "../pages/EbayCartPage";

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

test.describe("Item page smoke test", () => {
	for (const data of testData) {
		test(`should open third filtered ${data.brand} item and add it to cart`, async ({
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

			const itemPageTab = await resultsPage.openThirdItem();
			const itemPage = new EbayItemPage(itemPageTab);

			await itemPage.verifyItemPageIsOpened();
			await itemPage.addToCart();
			await itemPage.goToCart();

			const cartPage = new EbayCartPage(itemPageTab);

			await cartPage.verifyItemInCart();
		});
	}
});
