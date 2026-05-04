import { equals as equals_1, dayOfWeek, date as date_1, addDays, compare, now as now_1, day, month, year } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { isEmpty, length, sumBy, sortByDescending, sortBy, filter, ofArray, tryFind } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { map, defaultArg } from "./fable_modules/fable-library-js.4.24.0/Option.js";
import { createElement } from "react";
import { dateHash, equals, comparePrimitives, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { ActiveView, SortOrder, TimeRange, Msg, Format_amount } from "./Types.fs.js";
import { map as map_1, append, singleton, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { parse } from "./fable_modules/fable-library-js.4.24.0/Guid.js";
import { List_groupBy } from "./fable_modules/fable-library-js.4.24.0/Seq2.js";

function formatDate(dt) {
    const arg = year(dt) | 0;
    const arg_1 = month(dt) | 0;
    const arg_2 = day(dt) | 0;
    return toText(printf("%04d-%02d-%02d"))(arg)(arg_1)(arg_2);
}

function findCategory(categories, id) {
    return tryFind((c) => (c.Id === id), categories);
}

function expenseRow(categories, currency, expense, dispatch) {
    let elems_2, elems, arg_1, elems_1;
    const category = findCategory(categories, expense.CategoryId);
    const catIcon = defaultArg(map((c) => c.Icon, category), "📦");
    const catName = defaultArg(map((c_1) => c_1.Name, category), "Unknown");
    return createElement("div", createObj(ofArray([["className", "expense-row"], (elems_2 = [createElement("div", {
        className: "expense-icon",
        style: {
            backgroundColor: defaultArg(map((c_2) => c_2.Color, category), "#95a5a6"),
        },
        children: catIcon,
    }), createElement("div", createObj(ofArray([["className", "expense-details"], (elems = [createElement("div", {
        className: "expense-desc",
        children: (expense.Description === "") ? catName : expense.Description,
    }), createElement("div", {
        className: "expense-meta",
        children: (arg_1 = formatDate(expense.Date), toText(printf("%s • %s"))(catName)(arg_1)),
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", {
        className: "expense-amount",
        children: Format_amount(currency, expense.Amount),
    }), createElement("div", createObj(ofArray([["className", "expense-actions"], (elems_1 = [createElement("button", {
        className: "btn-icon",
        title: "Edit",
        children: "✎",
        onClick: (_arg) => {
            dispatch(new Msg(6, [expense.Id]));
        },
    }), createElement("button", {
        className: "btn-icon btn-delete",
        title: "Delete",
        children: "×",
        onClick: (_arg_1) => {
            dispatch(new Msg(7, [expense.Id]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

function filterAndSort(model) {
    const now = now_1();
    const filtered = filter((e) => {
        let matchValue, matchValue_1;
        if (((matchValue = model.TimeRange, (matchValue.tag === 1) ? ((year(e.Date) === year(now)) && (month(e.Date) === month(now))) : ((matchValue.tag === 2) ? (compare(e.Date, addDays(now, -30)) >= 0) : ((matchValue.tag === 3) ? (compare(e.Date, addDays(now, -90)) >= 0) : ((matchValue.tag === 4) ? true : (compare(e.Date, date_1(addDays(now, -dayOfWeek(now)))) >= 0)))))) && ((matchValue_1 = model.FilterCategoryId, (matchValue_1 == null) ? true : (e.CategoryId === matchValue_1)))) {
            if (model.SearchQuery === "") {
                return true;
            }
            else {
                return e.Description.toLocaleLowerCase().indexOf(model.SearchQuery.toLocaleLowerCase()) >= 0;
            }
        }
        else {
            return false;
        }
    }, model.Expenses);
    const matchValue_2 = model.SortOrder;
    switch (matchValue_2.tag) {
        case 1:
            return sortBy((e_2) => e_2.Date, filtered, {
                Compare: compare,
            });
        case 2:
            return sortByDescending((e_3) => e_3.Amount, filtered, {
                Compare: comparePrimitives,
            });
        case 3:
            return sortBy((e_4) => e_4.Amount, filtered, {
                Compare: comparePrimitives,
            });
        default:
            return sortByDescending((e_1) => e_1.Date, filtered, {
                Compare: compare,
            });
    }
}

function filterBar(model, dispatch) {
    let elems_4, elems, elems_1, matchValue_1, elems_2, matchValue_2, elems_3;
    return createElement("div", createObj(ofArray([["className", "filter-bar"], (elems_4 = [createElement("div", createObj(ofArray([["className", "search-wrap"], (elems = [createElement("span", {
        className: "search-icon",
        children: "🔍",
    }), createElement("input", {
        className: "search-input",
        placeholder: "Search expenses...",
        value: model.SearchQuery,
        onChange: (ev) => {
            dispatch(new Msg(21, [ev.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "time-range-pills"], (elems_1 = toList(delay(() => collect((matchValue) => {
        const range = matchValue[0];
        return singleton(createElement("button", {
            className: equals(model.TimeRange, range) ? "pill active" : "pill",
            children: matchValue[1],
            onClick: (_arg) => {
                dispatch(new Msg(18, [range]));
            },
        }));
    }, [[new TimeRange(0, []), "Week"], [new TimeRange(1, []), "Month"], [new TimeRange(2, []), "30d"], [new TimeRange(4, []), "All"]]))), ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("select", createObj(ofArray([["className", "cat-filter-select"], ["value", (matchValue_1 = model.FilterCategoryId, (matchValue_1 == null) ? "" : matchValue_1)], ["onChange", (ev_1) => {
        const v_1 = ev_1.target.value;
        if (v_1 === "") {
            dispatch(new Msg(20, [undefined]));
        }
        else {
            dispatch(new Msg(20, [parse(v_1)]));
        }
    }], (elems_2 = toList(delay(() => append(singleton(createElement("option", {
        value: "",
        children: "All categories",
    })), delay(() => map_1((cat) => createElement("option", {
        value: cat.Id,
        children: toText(printf("%s %s"))(cat.Icon)(cat.Name),
    }), model.Categories))))), ["children", reactApi.Children.toArray(Array.from(elems_2))])]))), createElement("select", createObj(ofArray([["className", "sort-select"], ["value", (matchValue_2 = model.SortOrder, (matchValue_2.tag === 1) ? "date-asc" : ((matchValue_2.tag === 2) ? "amt-desc" : ((matchValue_2.tag === 3) ? "amt-asc" : "date-desc")))], ["onChange", (ev_2) => {
        const v_2 = ev_2.target.value;
        dispatch(new Msg(19, [(v_2 === "date-asc") ? (new SortOrder(1, [])) : ((v_2 === "amt-desc") ? (new SortOrder(2, [])) : ((v_2 === "amt-asc") ? (new SortOrder(3, [])) : (new SortOrder(0, []))))]));
    }], (elems_3 = [createElement("option", {
        value: "date-desc",
        children: "Newest first",
    }), createElement("option", {
        value: "date-asc",
        children: "Oldest first",
    }), createElement("option", {
        value: "amt-desc",
        children: "Highest amount",
    }), createElement("option", {
        value: "amt-asc",
        children: "Lowest amount",
    })], ["children", reactApi.Children.toArray(Array.from(elems_3))])])))], ["children", reactApi.Children.toArray(Array.from(elems_4))])])));
}

function groupByDate(expenses) {
    return sortByDescending((tuple) => tuple[0], List_groupBy((e) => date_1(e.Date), expenses, {
        Equals: equals_1,
        GetHashCode: dateHash,
    }), {
        Compare: compare,
    });
}

/**
 * Main expense list view
 */
export function view(model, dispatch) {
    let elems_5;
    const filtered = filterAndSort(model);
    const totalFiltered = sumBy((e) => e.Amount, filtered, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
    const grouped = groupByDate(filtered);
    return createElement("div", createObj(ofArray([["className", "expenses-page"], (elems_5 = toList(delay(() => {
        let elems;
        return append(singleton(createElement("div", createObj(ofArray([["className", "page-header"], (elems = [createElement("h2", {
            children: "Expenses",
        }), createElement("button", {
            className: "btn btn-primary btn-small",
            children: "+ Add",
            onClick: (_arg) => {
                dispatch(new Msg(0, [new ActiveView(2, [])]));
            },
        })], ["children", reactApi.Children.toArray(Array.from(elems))])])))), delay(() => append(singleton(filterBar(model, dispatch)), delay(() => {
            let arg, arg_1;
            return append(singleton(createElement("div", {
                className: "filter-summary",
                children: (arg = (length(filtered) | 0), (arg_1 = Format_amount(model.Currency, totalFiltered), toText(printf("%d expenses • %s total"))(arg)(arg_1))),
            })), delay(() => {
                let elems_1, elems_4;
                return isEmpty(filtered) ? singleton(createElement("div", createObj(ofArray([["className", "empty-state"], (elems_1 = [createElement("div", {
                    className: "empty-icon",
                    children: "💸",
                }), createElement("p", {
                    children: "No expenses found.",
                }), createElement("p", {
                    className: "empty-hint",
                    children: "Add your first expense to start tracking your spending!",
                })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))) : singleton(createElement("div", createObj(ofArray([["className", "expense-groups"], (elems_4 = toList(delay(() => collect((matchValue) => {
                    let elems_3;
                    const expenses = matchValue[1];
                    const dayTotal = sumBy((e_1) => e_1.Amount, expenses, {
                        GetZero: () => 0,
                        Add: (x_1, y_1) => (x_1 + y_1),
                    });
                    return singleton(createElement("div", createObj(ofArray([["className", "date-group"], (elems_3 = toList(delay(() => {
                        let elems_2;
                        return append(singleton(createElement("div", createObj(ofArray([["className", "date-header"], (elems_2 = [createElement("span", {
                            className: "date-label",
                            children: formatDate(matchValue[0]),
                        }), createElement("span", {
                            className: "date-total",
                            children: Format_amount(model.Currency, dayTotal),
                        })], ["children", reactApi.Children.toArray(Array.from(elems_2))])])))), delay(() => map_1((expense) => expenseRow(model.Categories, model.Currency, expense, dispatch), expenses)));
                    })), ["children", reactApi.Children.toArray(Array.from(elems_3))])]))));
                }, grouped))), ["children", reactApi.Children.toArray(Array.from(elems_4))])]))));
            }));
        }))));
    })), ["children", reactApi.Children.toArray(Array.from(elems_5))])])));
}

