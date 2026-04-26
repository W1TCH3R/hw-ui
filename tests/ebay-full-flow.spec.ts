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

test.describe("eBay end-to-end shopping flow", () => {
	for (const data of testData) {
		test("should complete shopping flow without completing payment", async ({
			page,
		}) => {
			const homePage = new EbayHomePage(page);
			const resultsPage = new EbayResultsPage(page);

			let itemPageTab = page;
			let itemPage: EbayItemPage;
			let cartPage: EbayCartPage;
			let checkoutPage: EbayCheckoutPage;

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

			await test.step("Open the third filtered item", async () => {
				itemPageTab = await resultsPage.openThirdItem();
				itemPage = new EbayItemPage(itemPageTab);

				await itemPage.verifyItemPageIsOpened();
			});

			await test.step("Add item to cart", async () => {
				await itemPage.addToCart();
				await itemPage.goToCart();

				cartPage = new EbayCartPage(itemPageTab);
				await cartPage.verifyItemInCart();
			});

			await test.step("Begin checkout and proceed without payment", async () => {
				await cartPage.goToCheckout();

				checkoutPage = new EbayCheckoutPage(itemPageTab);

				await checkoutPage.continueAsGuestIfVisible();
				await checkoutPage.verifyCheckoutPageOpened();

				await checkoutPage.fillDeliveryAddress(checkoutData);
				await checkoutPage.saveDeliveryAddress();

				await checkoutPage.selectPayPalPayment();
				await checkoutPage.verifyPayPalSelected();

			});

			await test.step("Return to cart and remove item", async () => {
				await checkoutPage.returnToCart();

				cartPage = new EbayCartPage(itemPageTab);

				await cartPage.verifyItemInCart();
				await cartPage.removeItemFromCart();
				await cartPage.verifyCartIsEmpty();
			});
		});
	}
});
