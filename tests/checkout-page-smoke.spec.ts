import { test } from "@playwright/test";
import fs from "fs";
import { parse } from "csv-parse/sync";
import checkoutDataJson from "../data/checkout-data.json";
import { EbayHomePage } from "../pages/EbayHomePage";
import { EbayResultsPage } from "../pages/EbayResultsPage";
import { EbayItemPage } from "../pages/EbayItemPage";
import { EbayCartPage } from "../pages/EbayCartPage";
import {
	EbayCheckoutPage,
	type CheckoutAddress,
} from "../pages/EbayCheckoutPage";

type SearchData = {
	searchTerm: string;
	brand: string;
	minPrice: string;
	maxPrice: string;
};

const checkoutData = checkoutDataJson as CheckoutAddress;

const testData = parse(fs.readFileSync("data/search-data.csv"), {
	columns: true,
	skip_empty_lines: true,
}) as SearchData[];

test.describe("Checkout smoke test", () => {
	for (const data of testData) {
		test("should start checkout, fill address, and select PayPal without payment", async ({
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
			await cartPage.goToCheckout();

			const checkoutPage = new EbayCheckoutPage(itemPageTab);

			await checkoutPage.continueAsGuestIfVisible();
			await checkoutPage.verifyCheckoutPageOpened();

			await checkoutPage.fillDeliveryAddress(checkoutData);
			await checkoutPage.saveDeliveryAddress();

			await checkoutPage.selectPayPalPayment();
			await checkoutPage.verifyPayPalSelected();
            await checkoutPage.returnToCart();

            await cartPage.verifyItemInCart();
            await cartPage.removeItemFromCart();
            await cartPage.verifyCartIsEmpty();

		});
	}
});
