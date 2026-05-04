import { list as list_1, toString, datetime, nil, guid, object } from "./fable_modules/Thoth.Json.10.2.0/Encode.fs.js";
import { Defaults_categories, Currency, Expense, Category, Currency__get_Code } from "./Types.js";
import { list as list_2, fromString, succeed, andThen, datetime as datetime_1, float, string, guid as guid_1, object as object_1 } from "./fable_modules/Thoth.Json.10.2.0/Decode.fs.js";
import { uncurry2, uncurry3 } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { bind, defaultArg, ofNullable } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { empty, map } from "./fable_modules/fable-library-js.4.24.0/List.js";

export function Encode_category(c) {
    let matchValue;
    return object([["id", guid(c.Id)], ["name", c.Name], ["icon", c.Icon], ["color", c.Color], ["monthlyBudget", (matchValue = c.MonthlyBudget, (matchValue == null) ? nil : matchValue)]]);
}

export function Encode_expense(e) {
    return object([["id", guid(e.Id)], ["categoryId", guid(e.CategoryId)], ["amount", e.Amount], ["description", e.Description], ["date", datetime(e.Date)]]);
}

export function Encode_currency(c) {
    return Currency__get_Code(c);
}

export const Decode_category = (path_5) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3, objectArg_4;
    return new Category((objectArg = get$.Required, objectArg.Field("id", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("name", string)), (objectArg_2 = get$.Required, objectArg_2.Field("icon", string)), (objectArg_3 = get$.Required, objectArg_3.Field("color", string)), (objectArg_4 = get$.Optional, objectArg_4.Field("monthlyBudget", float)));
}, path_5, v));

export const Decode_expense = (path_5) => ((v) => object_1((get$) => {
    let objectArg, objectArg_1, objectArg_2, objectArg_3, objectArg_4;
    return new Expense((objectArg = get$.Required, objectArg.Field("id", guid_1)), (objectArg_1 = get$.Required, objectArg_1.Field("categoryId", guid_1)), (objectArg_2 = get$.Required, objectArg_2.Field("amount", float)), (objectArg_3 = get$.Required, objectArg_3.Field("description", string)), (objectArg_4 = get$.Required, objectArg_4.Field("date", datetime_1)));
}, path_5, v));

export const Decode_currency = (path_1) => ((value_1) => andThen(uncurry3((code) => {
    switch (code) {
        case "EUR":
            return (arg10$0040) => ((arg20$0040) => succeed(new Currency(0, []), arg10$0040, arg20$0040));
        case "USD":
            return (arg10$0040_1) => ((arg20$0040_1) => succeed(new Currency(1, []), arg10$0040_1, arg20$0040_1));
        case "GBP":
            return (arg10$0040_2) => ((arg20$0040_2) => succeed(new Currency(2, []), arg10$0040_2, arg20$0040_2));
        case "HUF":
            return (arg10$0040_3) => ((arg20$0040_3) => succeed(new Currency(3, []), arg10$0040_3, arg20$0040_3));
        default:
            return (arg10$0040_4) => ((arg20$0040_4) => succeed(new Currency(0, []), arg10$0040_4, arg20$0040_4));
    }
}), string, path_1, value_1));

function save(key, value) {
    window.localStorage.setItem(key, value);
}

function load(key) {
    return ofNullable(window.localStorage.getItem(key));
}

/**
 * Save categories
 */
export function saveCategories(categories) {
    save("budgetlens_categories", toString(0, list_1(map(Encode_category, categories))));
}

/**
 * Load categories (returns defaults if none saved)
 */
export function loadCategories() {
    return defaultArg(bind((json) => {
        const matchValue = fromString((path, value) => list_2(uncurry2(Decode_category), path, value), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            return matchValue.fields[0];
        }
    }, load("budgetlens_categories")), Defaults_categories);
}

/**
 * Save expenses
 */
export function saveExpenses(expenses) {
    save("budgetlens_expenses", toString(0, list_1(map(Encode_expense, expenses))));
}

/**
 * Load expenses
 */
export function loadExpenses() {
    return defaultArg(bind((json) => {
        const matchValue = fromString((path, value) => list_2(uncurry2(Decode_expense), path, value), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            return matchValue.fields[0];
        }
    }, load("budgetlens_expenses")), empty());
}

/**
 * Save currency preference
 */
export function saveCurrency(currency) {
    save("budgetlens_currency", toString(0, Encode_currency(currency)));
}

/**
 * Load currency preference
 */
export function loadCurrency() {
    return defaultArg(bind((json) => {
        const matchValue = fromString(uncurry2(Decode_currency), json);
        if (matchValue.tag === 1) {
            return undefined;
        }
        else {
            return matchValue.fields[0];
        }
    }, load("budgetlens_currency")), new Currency(0, []));
}

