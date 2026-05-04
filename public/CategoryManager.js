import { createElement } from "react";
import { equals, createObj } from "./fable_modules/fable-library-js.4.24.0/Util.js";
import { empty, singleton, append, map, delay, toList } from "./fable_modules/fable-library-js.4.24.0/Seq.js";
import { Currency, Currency__get_Code, Currency__get_Symbol, Format_amount, Defaults_icons, Msg } from "./Types.js";
import { reactApi } from "./fable_modules/Feliz.2.9.0/Interop.fs.js";
import { isEmpty, ofArray } from "./fable_modules/fable-library-js.4.24.0/List.js";
import { printf, toText } from "./fable_modules/fable-library-js.4.24.0/String.js";

function iconPicker(selected, dispatch) {
    let elems;
    return createElement("div", createObj(ofArray([["className", "icon-grid"], (elems = toList(delay(() => map((icon) => createElement("button", {
        className: (icon === selected) ? "icon-btn selected" : "icon-btn",
        children: icon,
        onClick: (_arg) => {
            dispatch(new Msg(10, [icon]));
        },
    }), Defaults_icons))), ["children", reactApi.Children.toArray(Array.from(elems))])])));
}

function categoryForm(model, dispatch) {
    let elems_3, elems, elems_1, elems_2;
    const isEditing = model.EditingCategoryId != null;
    return createElement("div", createObj(ofArray([["className", "category-form"], (elems_3 = [createElement("h3", {
        children: isEditing ? "Edit Category" : "Add Category",
    }), createElement("div", createObj(ofArray([["className", "form-row"], (elems = [createElement("input", {
        className: "text-input",
        placeholder: "Category name...",
        value: model.CategoryForm.Name,
        onChange: (ev) => {
            dispatch(new Msg(9, [ev.target.value]));
        },
        onKeyDown: (e) => {
            if ((e.key === "Enter") && (model.CategoryForm.Name.trim() !== "")) {
                if (isEditing) {
                    dispatch(new Msg(15, []));
                }
                else {
                    dispatch(new Msg(13, []));
                }
            }
        },
    }), createElement("input", {
        className: "color-input",
        type: "color",
        value: model.CategoryForm.Color,
        onChange: (ev_1) => {
            dispatch(new Msg(11, [ev_1.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("label", {
        className: "form-label",
        children: "Icon",
    }), iconPicker(model.CategoryForm.Icon, dispatch), createElement("div", createObj(ofArray([["className", "form-row"], (elems_1 = [createElement("label", {
        className: "form-label",
        children: "Monthly Budget (optional)",
    }), createElement("input", {
        className: "text-input budget-input",
        type: "number",
        placeholder: "No limit",
        value: model.CategoryForm.MonthlyBudget,
        onChange: (ev_2) => {
            dispatch(new Msg(12, [ev_2.target.value]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])]))), createElement("div", createObj(ofArray([["className", "form-actions"], (elems_2 = toList(delay(() => append(singleton(createElement("button", {
        className: "btn btn-primary btn-small",
        children: isEditing ? "Save" : "Add",
        disabled: model.CategoryForm.Name.trim() === "",
        onClick: (_arg) => {
            if (isEditing) {
                dispatch(new Msg(15, []));
            }
            else {
                dispatch(new Msg(13, []));
            }
        },
    })), delay(() => (isEditing ? singleton(createElement("button", {
        className: "btn btn-secondary btn-small",
        children: "Cancel",
        onClick: (_arg_1) => {
            dispatch(new Msg(17, []));
        },
    })) : empty()))))), ["children", reactApi.Children.toArray(Array.from(elems_2))])])))], ["children", reactApi.Children.toArray(Array.from(elems_3))])])));
}

function categoryItem(cat, currency, dispatch) {
    let elems_2, elems, elems_1;
    return createElement("div", createObj(ofArray([["className", "category-item"], (elems_2 = [createElement("div", {
        className: "cat-icon",
        style: {
            backgroundColor: cat.Color,
        },
        children: cat.Icon,
    }), createElement("div", createObj(ofArray([["className", "cat-info"], (elems = toList(delay(() => append(singleton(createElement("span", {
        className: "cat-name",
        children: cat.Name,
    })), delay(() => {
        let arg;
        const matchValue = cat.MonthlyBudget;
        return (matchValue == null) ? singleton(createElement("span", {
            className: "cat-budget",
            children: "No budget set",
        })) : singleton(createElement("span", {
            className: "cat-budget",
            children: (arg = Format_amount(currency, matchValue), toText(printf("Budget: %s/mo"))(arg)),
        }));
    })))), ["children", reactApi.Children.toArray(Array.from(elems))])]))), createElement("div", createObj(ofArray([["className", "cat-actions"], (elems_1 = [createElement("button", {
        className: "btn-icon",
        title: "Edit",
        children: "✎",
        onClick: (_arg) => {
            dispatch(new Msg(14, [cat.Id]));
        },
    }), createElement("button", {
        className: "btn-icon btn-delete",
        title: "Delete",
        children: "×",
        onClick: (_arg_1) => {
            dispatch(new Msg(16, [cat.Id]));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

function currencySelector(current, dispatch) {
    let elems_1, elems;
    return createElement("div", createObj(ofArray([["className", "currency-section"], (elems_1 = [createElement("h3", {
        children: "Currency",
    }), createElement("div", createObj(ofArray([["className", "currency-pills"], (elems = toList(delay(() => map((curr) => {
        let arg, arg_1;
        return createElement("button", {
            className: equals(current, curr) ? "pill active" : "pill",
            children: (arg = Currency__get_Symbol(curr), (arg_1 = Currency__get_Code(curr), toText(printf("%s %s"))(arg)(arg_1))),
            onClick: (_arg) => {
                dispatch(new Msg(22, [curr]));
            },
        });
    }, [new Currency(0, []), new Currency(1, []), new Currency(2, []), new Currency(3, [])]))), ["children", reactApi.Children.toArray(Array.from(elems))])])))], ["children", reactApi.Children.toArray(Array.from(elems_1))])])));
}

/**
 * Main categories/settings view
 */
export function view(model, dispatch) {
    let elems_2, elems, elems_1;
    return createElement("div", createObj(ofArray([["className", "categories-page"], (elems_2 = [createElement("h2", {
        children: "Categories & Settings",
    }), categoryForm(model, dispatch), createElement("div", createObj(ofArray([["className", "categories-list"], (elems = toList(delay(() => append(singleton(createElement("h3", {
        children: "Your Categories",
    })), delay(() => (isEmpty(model.Categories) ? singleton(createElement("p", {
        className: "empty-hint",
        children: "Add your first category to organize your expenses.",
    })) : map((cat) => categoryItem(cat, model.Currency, dispatch), model.Categories)))))), ["children", reactApi.Children.toArray(Array.from(elems))])]))), currencySelector(model.Currency, dispatch), createElement("div", createObj(ofArray([["className", "danger-zone"], (elems_1 = [createElement("h3", {
        children: "Data Management",
    }), createElement("button", {
        className: "btn btn-danger",
        children: "Clear All Expenses",
        onClick: (_arg) => {
            dispatch(new Msg(23, []));
        },
    })], ["children", reactApi.Children.toArray(Array.from(elems_1))])])))], ["children", reactApi.Children.toArray(Array.from(elems_2))])])));
}

