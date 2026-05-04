import { toString, day, dayOfWeek, equals, addDays, date as date_1, month, year, now as now_1 } from "./fable_modules/fable-library-js.4.24.0/Date.js";
import { singleton as singleton_1, mapIndexed, length, map, max as max_1, isEmpty, ofArray, sumBy, choose, sortByDescending, filter } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { int32ToString, createObj, comparePrimitives } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { singleton, collect, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { op_UnaryNegation_Int32 } from "./fable_modules/fable-library-js.4.24.0/Int32.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.24.0/Range.js";
import { createElement } from "react";
import { reactApi } from "./fable_modules/Feliz.2.9.0/./Interop.fs.js";
import { defaultOf } from "./fable_modules/Feliz.2.9.0/../.././fable_modules/fable-library-js.4.24.0/Util.js";
import { min, max } from "./fable_modules/fable-library-js.4.24.0/Double.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";
import { Msg, ActiveView, Format_amount } from "./Types.fs.js";
import { item } from "./fable_modules/fable-library-js.4.24.0/Array.js";

function currentMonthExpenses(expenses) {
    const now = now_1();
    return filter((e) => {
        if (year(e.Date) === year(now)) {
            return month(e.Date) === month(now);
        }
        else {
            return false;
        }
    }, expenses);
}

function categorySpending(categories, expenses) {
    return sortByDescending((tuple) => tuple[1], choose((cat) => {
        const total = sumBy((e_1) => e_1.Amount, filter((e) => (e.CategoryId === cat.Id), expenses), {
            GetZero: () => 0,
            Add: (x, y) => (x + y),
        });
        if (total > 0) {
            return [cat, total];
        }
        else {
            return undefined;
        }
    }, categories), {
        Compare: comparePrimitives,
    });
}

function dailySpending(days, expenses) {
    const today = date_1(now_1());
    return toList(delay(() => collect((i) => {
        const date = addDays(today, op_UnaryNegation_Int32(i));
        const total = sumBy((e_1) => e_1.Amount, filter((e) => equals(date_1(e.Date), date), expenses), {
            GetZero: () => 0,
            Add: (x, y) => (x + y),
        });
        return singleton([date, total]);
    }, rangeDouble(days - 1, -1, 0))));
}

function statCard(label, value, icon, color) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "stat-card"], (elems_1 = [createElement("div", {
        className: "stat-icon",
        style: {
            backgroundColor: color,
        },
        children: icon,
    }), createElement("div", createObj(ofArray([["className", "stat-content"], (elems = [createElement("div", {
        className: "stat-value",
        children: value,
    }), createElement("div", {
        className: "stat-label",
        children: label,
    })], ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

function categoryChart(categories, currency) {
    let elems_2, arg, elems_1;
    if (isEmpty(categories)) {
        return defaultOf();
    }
    else {
        const maxVal = max(1, max_1(map((tuple) => tuple[1], categories), {
            Compare: comparePrimitives,
        }));
        const barHeight = 32;
        const gap = 10;
        const labelWidth = 130;
        const chartWidth = 400;
        const totalHeight = (length(categories) * (barHeight + gap)) + 10;
        return createElement("div", createObj(ofArray([["className", "chart-container"], (elems_2 = [createElement("svg", createObj(ofArray([["width", ~~((labelWidth + chartWidth) + 80)], ["height", ~~totalHeight], ["viewBox", (arg = ((labelWidth + chartWidth) + 80), toText(printf("0 0 %g %g"))(arg)(totalHeight))], ["style", {
            maxWidth: 100 + "%",
        }], (elems_1 = toList(delay(() => mapIndexed((i, tupledArg) => {
            let elems, arg_3;
            const cat = tupledArg[0];
            const amount = tupledArg[1];
            const y_1 = (i * (barHeight + gap)) + 5;
            const barWidth = (amount / maxVal) * chartWidth;
            return createElement("g", createObj(singleton_1((elems = [createElement("text", {
                x: labelWidth - 8,
                y: y_1 + (barHeight / 2),
                fill: "var(--text-secondary)",
                fontSize: 12,
                textAnchor: "end",
                dominantBaseline: "central",
                children: (arg_3 = ((cat.Name.length > 12) ? (cat.Name.slice(undefined, 9 + 1) + "...") : cat.Name), toText(printf("%s %s"))(cat.Icon)(arg_3)),
            }), createElement("rect", {
                x: labelWidth,
                y: y_1,
                width: chartWidth,
                height: barHeight,
                rx: 6,
                ry: 6,
                fill: "rgba(255,255,255,0.05)",
            }), createElement("rect", {
                x: labelWidth,
                y: y_1,
                width: max(barWidth, 4),
                height: barHeight,
                rx: 6,
                ry: 6,
                fill: cat.Color,
                style: {
                    transitionProperty: "width",
                    transitionDuration: 0.5 + "s",
                },
            }), createElement("text", {
                x: (labelWidth + barWidth) + 8,
                y: y_1 + (barHeight / 2),
                fill: "var(--text-secondary)",
                fontSize: 11,
                dominantBaseline: "central",
                children: Format_amount(currency, amount),
            })], ["children", reactApi.Children.toArray(Array.from(elems))]))));
        }, categories))), ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
    }
}

function dailyChart(data, currency) {
    let elems_3, elems_2;
    if (isEmpty(data)) {
        return defaultOf();
    }
    else {
        const maxVal = max(1, max_1(map((tuple) => tuple[1], data), {
            Compare: comparePrimitives,
        }));
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return createElement("div", createObj(ofArray([["className", "daily-chart"], (elems_3 = [createElement("div", createObj(ofArray([["className", "daily-bars"], (elems_2 = toList(delay(() => collect((matchValue) => {
            let elems_1, elems, arg_1;
            const date = matchValue[0];
            const amount = matchValue[1];
            const heightPct = (amount / maxVal) * 100;
            const dayName = item(dayOfWeek(date), dayNames);
            const isToday = equals(date_1(date), date_1(now_1()));
            return singleton(createElement("div", createObj(ofArray([["className", "daily-bar-col"], (elems_1 = [createElement("div", {
                className: "daily-bar-value",
                children: (amount > 0) ? Format_amount(currency, amount) : "",
            }), createElement("div", createObj(ofArray([["className", "daily-bar-track"], (elems = [createElement("div", {
                className: "daily-bar-fill",
                style: {
                    height: heightPct + "%",
                    backgroundColor: isToday ? "#e74c3c" : "#3498db",
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("span", {
                className: isToday ? "daily-bar-label today" : "daily-bar-label",
                children: (arg_1 = (day(date) | 0), toText(printf("%s\n%d"))(dayName)(arg_1)),
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))));
        }, data))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
    }
}

function budgetProgress(categories, expenses, currency) {
    let elems_4, elems_3;
    const monthExpenses = currentMonthExpenses(expenses);
    const catsWithBudget = choose((cat) => {
        const matchValue = cat.MonthlyBudget;
        if (matchValue == null) {
            return undefined;
        }
        else {
            const budget = matchValue;
            const spent = sumBy((e_1) => e_1.Amount, filter((e) => (e.CategoryId === cat.Id), monthExpenses), {
                GetZero: () => 0,
                Add: (x, y) => (x + y),
            });
            return [cat, spent, budget];
        }
    }, categories);
    if (isEmpty(catsWithBudget)) {
        return defaultOf();
    }
    else {
        return createElement("div", createObj(ofArray([["className", "budget-section"], (elems_4 = [createElement("h3", {
            children: "Monthly Budgets",
        }), createElement("div", createObj(ofArray([["className", "budget-list"], (elems_3 = toList(delay(() => collect((matchValue_1) => {
            let elems_2, elems, arg_2, arg_3, elems_1;
            const spent_1 = matchValue_1[1];
            const cat_1 = matchValue_1[0];
            const budget_1 = matchValue_1[2];
            const pct = min((spent_1 / budget_1) * 100, 100);
            const isOver = spent_1 > budget_1;
            return singleton(createElement("div", createObj(ofArray([["className", "budget-item"], (elems_2 = [createElement("div", createObj(ofArray([["className", "budget-header"], (elems = [createElement("span", {
                children: toText(printf("%s %s"))(cat_1.Icon)(cat_1.Name),
            }), createElement("span", {
                className: isOver ? "budget-amount over" : "budget-amount",
                children: (arg_2 = Format_amount(currency, spent_1), (arg_3 = Format_amount(currency, budget_1), toText(printf("%s / %s"))(arg_2)(arg_3))),
            })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "budget-bar-track"], (elems_1 = [createElement("div", {
                className: isOver ? "budget-bar-fill over" : "budget-bar-fill",
                style: {
                    width: pct + "%",
                    backgroundColor: isOver ? "#e74c3c" : cat_1.Color,
                },
            })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])]))));
        }, catsWithBudget))), ["children", reactApi.Children.toArray(Array.from(elems_3))])])))], ["children", reactApi.Children.toArray(Array.from(elems_4))])])));
    }
}

/**
 * Main dashboard view
 */
export function view(model, dispatch) {
    let elems_3, arg, arg_1, elems, elems_1, elems_2;
    const monthExpenses = currentMonthExpenses(model.Expenses);
    const monthTotal = sumBy((e) => e.Amount, monthExpenses, {
        GetZero: () => 0,
        Add: (x, y) => (x + y),
    });
    const todayTotal = sumBy((e_2) => e_2.Amount, filter((e_1) => equals(date_1(e_1.Date), date_1(now_1())), model.Expenses), {
        GetZero: () => 0,
        Add: (x_1, y_1) => (x_1 + y_1),
    });
    const avgDaily = isEmpty(monthExpenses) ? 0 : (monthTotal / day(now_1()));
    const catSpending = categorySpending(model.Categories, monthExpenses);
    const daily = dailySpending(14, model.Expenses);
    return createElement("div", createObj(ofArray([["className", "dashboard-page"], (elems_3 = [createElement("h2", {
        children: "Dashboard",
    }), createElement("p", {
        className: "dash-subtitle",
        children: (arg = toString(now_1(), "MMMM"), (arg_1 = (year(now_1()) | 0), toText(printf("%s %d"))(arg)(arg_1))),
    }), createElement("div", createObj(ofArray([["className", "stat-cards"], (elems = [statCard("This Month", Format_amount(model.Currency, monthTotal), "💰", "#3498db"), statCard("Today", Format_amount(model.Currency, todayTotal), "📅", "#e74c3c"), statCard("Daily Avg", Format_amount(model.Currency, avgDaily), "📊", "#2ecc71"), statCard("Transactions", int32ToString(length(monthExpenses)), "📋", "#f39c12")], ["children", reactApi.Children.toArray(Array.from(elems))])]))), budgetProgress(model.Categories, model.Expenses, model.Currency), createElement("div", createObj(ofArray([["className", "chart-section"], (elems_1 = [createElement("h3", {
        children: "Last 14 Days",
    }), dailyChart(daily, model.Currency)], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", createObj(ofArray([["className", "chart-section"], (elems_2 = [createElement("h3", {
        children: "Spending by Category",
    }), categoryChart(catSpending, model.Currency)], ["children", reactApi.Children.toArray(Array.from(elems_2))])]))), createElement("button", {
        className: "fab",
        children: "+",
        title: "Add expense",
        onClick: (_arg) => {
            dispatch(new Msg(0, [new ActiveView(2, [])]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

