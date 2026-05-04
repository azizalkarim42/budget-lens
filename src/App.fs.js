import { saveCurrency, saveCategories, saveExpenses, loadCurrency, loadExpenses, loadCategories } from "./Storage.fs.js";
import { Msg, Category, CategoryFormState, Expense, ExpenseFormState, Model, CategoryFormState_get_Empty, ExpenseFormState_get_Empty, SortOrder, TimeRange, ActiveView as ActiveView_4 } from "./Types.fs.js";
import { tryParse } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { FSharpRef } from "./fable_modules/fable-library-js.4.24.0/Types.js";
import { toString, now, tryParse as tryParse_1, minValue } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { newGuid } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { value as value_15 } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { ofArray, empty, singleton, append, filter, tryFind, map, cons } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { createObj, equals } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { createElement } from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { singleton as singleton_1, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { view as view_2 } from "./ExpenseList.fs.js";
import { view as view_3 } from "./ExpenseForm.fs.js";
import { view as view_4 } from "./CategoryManager.fs.js";
import { view as view_5 } from "./Dashboard.fs.js";

/**
 * Initialize application state from localStorage
 */
export function init() {
    const categories = loadCategories();
    const expenses = loadExpenses();
    const currency = loadCurrency();
    return new Model(categories, expenses, currency, new ActiveView_4(0, []), new TimeRange(1, []), new SortOrder(0, []), ExpenseFormState_get_Empty(), CategoryFormState_get_Empty(), undefined, undefined, "");
}

/**
 * Update function — pure state transitions
 */
export function update(msg, model) {
    let bind$0040, bind$0040_1, bind$0040_2, bind$0040_3, amount, bind$0040_4, bind$0040_5, bind$0040_6, bind$0040_7, v_10, matchValue_6, b, v_13;
    switch (msg.tag) {
        case 1: {
            const v = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, (bind$0040 = model.ExpenseForm, new ExpenseFormState(v, bind$0040.Description, bind$0040.CategoryId, bind$0040.Date, bind$0040.EditingId)), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 2: {
            const v_1 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, (bind$0040_1 = model.ExpenseForm, new ExpenseFormState(bind$0040_1.Amount, v_1, bind$0040_1.CategoryId, bind$0040_1.Date, bind$0040_1.EditingId)), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 3: {
            const id = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, (bind$0040_2 = model.ExpenseForm, new ExpenseFormState(bind$0040_2.Amount, bind$0040_2.Description, id, bind$0040_2.Date, bind$0040_2.EditingId)), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 4: {
            const v_2 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, (bind$0040_3 = model.ExpenseForm, new ExpenseFormState(bind$0040_3.Amount, bind$0040_3.Description, bind$0040_3.CategoryId, v_2, bind$0040_3.EditingId)), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 5: {
            let matchValue;
            let outArg = 0;
            matchValue = [tryParse(model.ExpenseForm.Amount, new FSharpRef(() => outArg, (v_3) => {
                outArg = v_3;
            })), outArg];
            let matchResult;
            if (matchValue[0]) {
                if ((amount = matchValue[1], (amount > 0) && (model.ExpenseForm.CategoryId != null))) {
                    matchResult = 0;
                }
                else {
                    matchResult = 1;
                }
            }
            else {
                matchResult = 1;
            }
            switch (matchResult) {
                case 0: {
                    const amount_1 = matchValue[1];
                    let date;
                    let matchValue_1;
                    let outArg_1 = minValue();
                    matchValue_1 = [tryParse_1(model.ExpenseForm.Date, new FSharpRef(() => outArg_1, (v_4) => {
                        outArg_1 = v_4;
                    })), outArg_1];
                    if (matchValue_1[0]) {
                        const d = matchValue_1[1];
                        date = d;
                    }
                    else {
                        date = now();
                    }
                    const matchValue_2 = model.ExpenseForm.EditingId;
                    if (matchValue_2 == null) {
                        const expense = new Expense(newGuid(), value_15(model.ExpenseForm.CategoryId), amount_1, model.ExpenseForm.Description.trim(), date);
                        const newExpenses_1 = cons(expense, model.Expenses);
                        saveExpenses(newExpenses_1);
                        return new Model(model.Categories, newExpenses_1, model.Currency, new ActiveView_4(1, []), model.TimeRange, model.SortOrder, ExpenseFormState_get_Empty(), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
                    }
                    else {
                        const editId = matchValue_2;
                        const newExpenses = map((e) => {
                            if (e.Id === editId) {
                                const Description = model.ExpenseForm.Description.trim();
                                return new Expense(e.Id, value_15(model.ExpenseForm.CategoryId), amount_1, Description, date);
                            }
                            else {
                                return e;
                            }
                        }, model.Expenses);
                        saveExpenses(newExpenses);
                        return new Model(model.Categories, newExpenses, model.Currency, new ActiveView_4(1, []), model.TimeRange, model.SortOrder, ExpenseFormState_get_Empty(), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
                    }
                }
                default:
                    return model;
            }
        }
        case 6: {
            const id_1 = msg.fields[0];
            const matchValue_3 = tryFind((e_1) => (e_1.Id === id_1), model.Expenses);
            if (matchValue_3 == null) {
                return model;
            }
            else {
                const expense_1 = matchValue_3;
                return new Model(model.Categories, model.Expenses, model.Currency, new ActiveView_4(2, []), model.TimeRange, model.SortOrder, new ExpenseFormState(expense_1.Amount.toString(), expense_1.Description, expense_1.CategoryId, toString(expense_1.Date, "yyyy-MM-dd"), id_1), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
            }
        }
        case 7: {
            const id_2 = msg.fields[0];
            const newExpenses_2 = filter((e_2) => (e_2.Id !== id_2), model.Expenses);
            saveExpenses(newExpenses_2);
            return new Model(model.Categories, newExpenses_2, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 8:
            return new Model(model.Categories, model.Expenses, model.Currency, new ActiveView_4(1, []), model.TimeRange, model.SortOrder, ExpenseFormState_get_Empty(), model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        case 9: {
            const v_5 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, (bind$0040_4 = model.CategoryForm, new CategoryFormState(v_5, bind$0040_4.Icon, bind$0040_4.Color, bind$0040_4.MonthlyBudget)), model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 10: {
            const v_6 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, (bind$0040_5 = model.CategoryForm, new CategoryFormState(bind$0040_5.Name, v_6, bind$0040_5.Color, bind$0040_5.MonthlyBudget)), model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 11: {
            const v_7 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, (bind$0040_6 = model.CategoryForm, new CategoryFormState(bind$0040_6.Name, bind$0040_6.Icon, v_7, bind$0040_6.MonthlyBudget)), model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 12: {
            const v_8 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, (bind$0040_7 = model.CategoryForm, new CategoryFormState(bind$0040_7.Name, bind$0040_7.Icon, bind$0040_7.Color, v_8)), model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 13: {
            const name = model.CategoryForm.Name.trim();
            if (name === "") {
                return model;
            }
            else {
                let budget;
                let matchValue_4;
                let outArg_2 = 0;
                matchValue_4 = [tryParse(model.CategoryForm.MonthlyBudget, new FSharpRef(() => outArg_2, (v_9) => {
                    outArg_2 = v_9;
                })), outArg_2];
                let matchResult_1;
                if (matchValue_4[0]) {
                    if ((v_10 = matchValue_4[1], v_10 > 0)) {
                        matchResult_1 = 0;
                    }
                    else {
                        matchResult_1 = 1;
                    }
                }
                else {
                    matchResult_1 = 1;
                }
                switch (matchResult_1) {
                    case 0: {
                        const v_11 = matchValue_4[1];
                        budget = v_11;
                        break;
                    }
                    default:
                        budget = undefined;
                }
                const cat = new Category(newGuid(), name, model.CategoryForm.Icon, model.CategoryForm.Color, budget);
                const newCats = append(model.Categories, singleton(cat));
                saveCategories(newCats);
                return new Model(newCats, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, CategoryFormState_get_Empty(), model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
            }
        }
        case 14: {
            const id_3 = msg.fields[0];
            const matchValue_5 = tryFind((c) => (c.Id === id_3), model.Categories);
            if (matchValue_5 == null) {
                return model;
            }
            else {
                const cat_1 = matchValue_5;
                return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, new CategoryFormState(cat_1.Name, cat_1.Icon, cat_1.Color, (matchValue_6 = cat_1.MonthlyBudget, (matchValue_6 == null) ? "" : ((b = matchValue_6, b.toString())))), id_3, model.FilterCategoryId, model.SearchQuery);
            }
        }
        case 15: {
            const matchValue_7 = model.EditingCategoryId;
            if (matchValue_7 == null) {
                return model;
            }
            else {
                const id_4 = matchValue_7;
                const name_1 = model.CategoryForm.Name.trim();
                if (name_1 === "") {
                    return model;
                }
                else {
                    let budget_1;
                    let matchValue_8;
                    let outArg_3 = 0;
                    matchValue_8 = [tryParse(model.CategoryForm.MonthlyBudget, new FSharpRef(() => outArg_3, (v_12) => {
                        outArg_3 = v_12;
                    })), outArg_3];
                    let matchResult_2;
                    if (matchValue_8[0]) {
                        if ((v_13 = matchValue_8[1], v_13 > 0)) {
                            matchResult_2 = 0;
                        }
                        else {
                            matchResult_2 = 1;
                        }
                    }
                    else {
                        matchResult_2 = 1;
                    }
                    switch (matchResult_2) {
                        case 0: {
                            const v_14 = matchValue_8[1];
                            budget_1 = v_14;
                            break;
                        }
                        default:
                            budget_1 = undefined;
                    }
                    const newCats_1 = map((c_1) => {
                        if (c_1.Id === id_4) {
                            return new Category(c_1.Id, name_1, model.CategoryForm.Icon, model.CategoryForm.Color, budget_1);
                        }
                        else {
                            return c_1;
                        }
                    }, model.Categories);
                    saveCategories(newCats_1);
                    return new Model(newCats_1, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, CategoryFormState_get_Empty(), undefined, model.FilterCategoryId, model.SearchQuery);
                }
            }
        }
        case 16: {
            const id_5 = msg.fields[0];
            const newCats_2 = filter((c_2) => (c_2.Id !== id_5), model.Categories);
            saveCategories(newCats_2);
            return new Model(newCats_2, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 17:
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, CategoryFormState_get_Empty(), undefined, model.FilterCategoryId, model.SearchQuery);
        case 18: {
            const range = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, range, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 19: {
            const order = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, order, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 20: {
            const id_6 = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, id_6, model.SearchQuery);
        }
        case 21: {
            const query = msg.fields[0];
            return new Model(model.Categories, model.Expenses, model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, query);
        }
        case 22: {
            const curr = msg.fields[0];
            saveCurrency(curr);
            return new Model(model.Categories, model.Expenses, curr, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        case 23: {
            saveExpenses(empty());
            return new Model(model.Categories, empty(), model.Currency, model.ActiveView, model.TimeRange, model.SortOrder, model.ExpenseForm, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
        default: {
            const view_1 = msg.fields[0];
            const form = equals(view_1, new ActiveView_4(2, [])) ? ExpenseFormState_get_Empty() : model.ExpenseForm;
            return new Model(model.Categories, model.Expenses, model.Currency, view_1, model.TimeRange, model.SortOrder, form, model.CategoryForm, model.EditingCategoryId, model.FilterCategoryId, model.SearchQuery);
        }
    }
}

function navbar(activeView, dispatch) {
    let elems_1;
    const tabButton = (view_1, icon, label) => {
        let elems;
        return createElement("button", createObj(ofArray([["className", equals(activeView, view_1) ? "nav-tab active" : "nav-tab"], ["onClick", (_arg) => {
            dispatch(new Msg(0, [view_1]));
        }], (elems = [createElement("span", {
            className: "nav-icon",
            children: icon,
        }), createElement("span", {
            className: "nav-label",
            children: label,
        })], ["children", reactApi.Children.toArray(Array.from(elems))])])));
    };
    return createElement("nav", createObj(ofArray([["className", "navbar"], (elems_1 = [tabButton(new ActiveView_4(0, []), "📊", "Dashboard"), tabButton(new ActiveView_4(1, []), "📋", "Expenses"), tabButton(new ActiveView_4(2, []), "➕", "Add"), tabButton(new ActiveView_4(3, []), "⚙️", "Settings")], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

/**
 * Main application view
 */
export function view(model, dispatch) {
    let elems_2, elems, elems_1;
    return createElement("div", createObj(ofArray([["className", "app-container"], (elems_2 = [createElement("header", createObj(ofArray([["className", "app-header"], (elems = [createElement("h1", {
        children: "BudgetLens",
    }), createElement("span", {
        className: "app-subtitle",
        children: "Personal Expense Tracker",
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("main", createObj(ofArray([["className", "app-main"], (elems_1 = toList(delay(() => {
        const matchValue = model.ActiveView;
        return (matchValue.tag === 1) ? singleton_1(view_2(model, dispatch)) : ((matchValue.tag === 2) ? singleton_1(view_3(model, dispatch)) : ((matchValue.tag === 3) ? singleton_1(view_4(model, dispatch)) : singleton_1(view_5(model, dispatch))));
    })), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), navbar(model.ActiveView, dispatch)], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

